"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, RotateCw, Settings, Terminal, Cpu, Clock, Activity } from "lucide-react";

interface VirtualInstance {
  id: string;
  name: string;
  description: string | null;
  status: string;
  processorType: {
    name: string;
    category: string;
    architecture: string;
  };
  configuration: any;
  pinAssignments: any;
  lastStartedAt: string | null;
  lastStoppedAt: string | null;
  totalRuntimeHours: string;
  createdAt: string;
}

export default function VirtualInstancesPage() {
  const [instances, setInstances] = useState<VirtualInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/virtual-instances");
      const data = await response.json();

      if (data.success) {
        setInstances(data.instances);
      }
    } catch (error) {
      console.error("Error fetching instances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceControl = async (instanceId: string, action: string) => {
    try {
      setActionLoading(instanceId);
      const response = await fetch(`/api/virtual-instances/${instanceId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchInstances();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error controlling instance:", error);
      alert("Failed to control instance");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatRuntime = (hours: string) => {
    const h = parseFloat(hours);
    if (h < 1) {
      return `${Math.round(h * 60)} min`;
    }
    return `${h.toFixed(1)} hrs`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Virtual Instances</h1>
          <p className="text-muted-foreground">
            Manage your virtual embedded processors
          </p>
        </div>
        <Button onClick={() => window.location.href = "/virtual-processors"}>
          + New Instance
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading instances...</p>
        </div>
      ) : instances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Virtual Instances Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by subscribing to a virtual processor
            </p>
            <Button onClick={() => window.location.href = "/virtual-processors"}>
              Browse Virtual Processors
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card key={instance.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant={instance.status === "running" ? "default" : "secondary"}
                    className={`${getStatusColor(instance.status)} text-white`}
                  >
                    {instance.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {instance.processorType?.category?.toUpperCase() || "N/A"}
                  </Badge>
                </div>

                <CardTitle>{instance.name}</CardTitle>
                <CardDescription>
                  {instance.processorType?.name || "Unknown Processor"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow space-y-4">
                {instance.description && (
                  <p className="text-sm text-muted-foreground">
                    {instance.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Total Runtime:
                    </span>
                    <span className="font-semibold">
                      {formatRuntime(instance.totalRuntimeHours)}
                    </span>
                  </div>

                  {instance.lastStartedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Last Started:
                      </span>
                      <span className="text-sm">
                        {new Date(instance.lastStartedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Architecture:</span>
                    <span className="text-sm">
                      {instance.processorType?.architecture || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <div className="w-full grid grid-cols-3 gap-2">
                  {instance.status !== "running" ? (
                    <Button
                      size="sm"
                      onClick={() => handleInstanceControl(instance.id, "start")}
                      disabled={actionLoading === instance.id}
                      className="gap-1"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleInstanceControl(instance.id, "stop")}
                      disabled={actionLoading === instance.id}
                      className="gap-1"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInstanceControl(instance.id, "restart")}
                    disabled={actionLoading === instance.id || instance.status !== "running"}
                    className="gap-1"
                  >
                    <RotateCw className="h-4 w-4" />
                    Restart
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/virtual-instances/${instance.id}`}
                    className="gap-1"
                  >
                    <Settings className="h-4 w-4" />
                    Config
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full gap-1"
                  onClick={() => window.location.href = `/virtual-instances/${instance.id}/console`}
                  disabled={instance.status !== "running"}
                >
                  <Terminal className="h-4 w-4" />
                  Open Console
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
