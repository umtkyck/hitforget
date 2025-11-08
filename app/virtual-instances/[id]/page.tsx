"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, Upload, Terminal } from "lucide-react";

interface PinAssignment {
  id: string;
  pinNumber: string;
  pinMode: string;
  connectedComponent: string;
  componentConfig: any;
  initialValue: number | null;
  description: string | null;
}

export default function VirtualInstanceDetailPage() {
  const params = useParams();
  const instanceId = params.id as string;

  const [instance, setInstance] = useState<any>(null);
  const [pins, setPins] = useState<PinAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newPin, setNewPin] = useState({
    pinNumber: "",
    pinMode: "OUTPUT",
    connectedComponent: "",
    initialValue: 0,
    description: "",
  });

  useEffect(() => {
    fetchInstanceDetails();
    fetchPinAssignments();
  }, [instanceId]);

  const fetchInstanceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/virtual-instances/${instanceId}`);
      const data = await response.json();

      if (data.success) {
        setInstance(data.instance);
        setName(data.instance.name);
        setDescription(data.instance.description || "");
      }
    } catch (error) {
      console.error("Error fetching instance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPinAssignments = async () => {
    try {
      const response = await fetch(`/api/virtual-instances/${instanceId}/pins`);
      const data = await response.json();

      if (data.success) {
        setPins(data.pins);
      }
    } catch (error) {
      console.error("Error fetching pins:", error);
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/virtual-instances/${instanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Instance updated successfully");
        await fetchInstanceDetails();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating instance:", error);
      alert("Failed to update instance");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPin = async () => {
    if (!newPin.pinNumber || !newPin.connectedComponent) {
      alert("Please fill in pin number and component");
      return;
    }

    try {
      const response = await fetch(`/api/virtual-instances/${instanceId}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPin),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPinAssignments();
        setNewPin({
          pinNumber: "",
          pinMode: "OUTPUT",
          connectedComponent: "",
          initialValue: 0,
          description: "",
        });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding pin:", error);
      alert("Failed to add pin assignment");
    }
  };

  const handleDeletePin = async (pinNumber: string) => {
    if (!confirm(`Delete pin ${pinNumber}?`)) return;

    try {
      const response = await fetch(
        `/api/virtual-instances/${instanceId}/pins?pin=${pinNumber}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        await fetchPinAssignments();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting pin:", error);
      alert("Failed to delete pin");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading instance...</p>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Instance not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{instance.name}</h1>
          <p className="text-muted-foreground">
            {instance.processorType?.name} • {instance.processorType?.architecture}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={instance.status === "running" ? "default" : "secondary"}>
            {instance.status.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            onClick={() => window.location.href = `/virtual-instances/${instanceId}/console`}
            disabled={instance.status !== "running"}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Console
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pins">Pin Assignment</TabsTrigger>
          <TabsTrigger value="firmware">Firmware</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update instance name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Instance Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Arduino Project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveBasicInfo} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Runtime</div>
                  <div className="text-2xl font-bold">
                    {parseFloat(instance.totalRuntimeHours || "0").toFixed(1)} hrs
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-2xl font-bold capitalize">{instance.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {new Date(instance.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Pins Configured</div>
                  <div className="text-2xl font-bold">{pins.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pin Assignment Tab */}
        <TabsContent value="pins">
          <Card>
            <CardHeader>
              <CardTitle>Pin Assignments</CardTitle>
              <CardDescription>
                Configure virtual hardware pin connections and components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Pin Form */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-4">Add New Pin Assignment</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pin Number</Label>
                    <Input
                      placeholder="e.g., D2, A0, GPIO17"
                      value={newPin.pinNumber}
                      onChange={(e) => setNewPin({ ...newPin, pinNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pin Mode</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={newPin.pinMode}
                      onChange={(e) => setNewPin({ ...newPin, pinMode: e.target.value })}
                    >
                      <option value="OUTPUT">OUTPUT</option>
                      <option value="INPUT">INPUT</option>
                      <option value="INPUT_PULLUP">INPUT_PULLUP</option>
                      <option value="PWM">PWM</option>
                      <option value="ANALOG">ANALOG</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Connected Component</Label>
                    <Input
                      placeholder="e.g., LED, Button, Sensor"
                      value={newPin.connectedComponent}
                      onChange={(e) => setNewPin({ ...newPin, connectedComponent: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Initial Value</Label>
                    <Input
                      type="number"
                      placeholder="0 or 1"
                      value={newPin.initialValue}
                      onChange={(e) => setNewPin({ ...newPin, initialValue: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      placeholder="Additional notes..."
                      value={newPin.description}
                      onChange={(e) => setNewPin({ ...newPin, description: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleAddPin} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pin
                </Button>
              </div>

              {/* Existing Pins */}
              <div>
                <h3 className="font-semibold mb-4">Configured Pins ({pins.length})</h3>
                {pins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pins configured yet. Add your first pin assignment above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pins.map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{pin.pinNumber}</Badge>
                            <Badge variant="secondary">{pin.pinMode}</Badge>
                            <span className="font-semibold">{pin.connectedComponent}</span>
                          </div>
                          {pin.description && (
                            <p className="text-sm text-muted-foreground">{pin.description}</p>
                          )}
                          <div className="text-sm text-muted-foreground mt-1">
                            Initial: {pin.initialValue !== null ? pin.initialValue : "N/A"}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePin(pin.pinNumber)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firmware Tab */}
        <TabsContent value="firmware">
          <Card>
            <CardHeader>
              <CardTitle>Firmware Management</CardTitle>
              <CardDescription>
                Upload and manage firmware for your virtual processor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2 font-semibold">Upload Firmware</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: HEX, BIN, ELF
                </p>
                <input
                  type="file"
                  accept=".hex,.bin,.elf"
                  className="hidden"
                  id="firmware-upload"
                />
                <Button variant="outline" onClick={() => document.getElementById("firmware-upload")?.click()}>
                  Choose File
                </Button>
              </div>

              {instance.firmwareUrl && (
                <div className="p-4 border rounded-lg">
                  <div className="font-semibold mb-2">Current Firmware</div>
                  <div className="text-sm text-muted-foreground">{instance.firmwareUrl}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulations Tab */}
        <TabsContent value="simulations">
          <Card>
            <CardHeader>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                View past simulation runs and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No simulation history yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
