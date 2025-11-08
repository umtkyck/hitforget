"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Zap, Check, ArrowRight } from "lucide-react";

interface VirtualProcessor {
  id: string;
  name: string;
  category: string;
  architecture: string;
  description: string;
  imageUrl: string | null;
  specifications: {
    cpu?: string;
    ram?: string;
    flash?: string;
    pins?: number;
  };
  simulatorEngine: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
}

export default function VirtualProcessorsPage() {
  const [processors, setProcessors] = useState<VirtualProcessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchProcessors();
  }, [selectedCategory]);

  const fetchProcessors = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all"
        ? "/api/virtual-processors"
        : `/api/virtual-processors?category=${selectedCategory}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProcessors(data.processors);
      }
    } catch (error) {
      console.error("Error fetching processors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (processorId: string, billingInterval: string) => {
    window.location.href = `/virtual-processors/${processorId}/subscribe?interval=${billingInterval}`;
  };

  const categories = [
    { id: "all", label: "All Processors" },
    { id: "arduino", label: "Arduino" },
    { id: "stm32", label: "STM32" },
    { id: "raspberry_pi", label: "Raspberry Pi" },
    { id: "fpga", label: "FPGA" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Virtual Embedded Processors</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Simulate real hardware without physical boards. Build, test, and deploy embedded applications in the cloud.
        </p>

        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="font-semibold">No Physical Hardware</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold">Instant Deployment</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI-Ready Platform</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Processors Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading virtual processors...</p>
        </div>
      ) : processors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No virtual processors found in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processors.map((processor) => (
            <Card key={processor.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="mb-2">
                    {processor.category.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {processor.simulatorEngine}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{processor.name}</CardTitle>
                <CardDescription>{processor.architecture}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                  {processor.description}
                </p>

                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm">Specifications:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {processor.specifications.cpu && (
                      <div>
                        <span className="text-muted-foreground">CPU:</span>{" "}
                        {processor.specifications.cpu}
                      </div>
                    )}
                    {processor.specifications.ram && (
                      <div>
                        <span className="text-muted-foreground">RAM:</span>{" "}
                        {processor.specifications.ram}
                      </div>
                    )}
                    {processor.specifications.flash && (
                      <div>
                        <span className="text-muted-foreground">Flash:</span>{" "}
                        {processor.specifications.flash}
                      </div>
                    )}
                    {processor.specifications.pins && (
                      <div>
                        <span className="text-muted-foreground">I/O Pins:</span>{" "}
                        {processor.specifications.pins}
                      </div>
                    )}
                  </div>
                </div>

                {processor.features && processor.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {processor.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">${processor.monthlyPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${processor.yearlyPrice}</div>
                    <div className="text-sm text-muted-foreground">per year</div>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSubscribe(processor.id, "monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    onClick={() => handleSubscribe(processor.id, "yearly")}
                    className="gap-1"
                  >
                    Yearly <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-16 border-t pt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Virtual Processors?</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>No Hardware Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Start developing immediately without buying expensive development boards.
                Save thousands on hardware procurement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Tool Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect your AI coding assistants (ChatGPT, Claude, GitHub Copilot) and deploy
                directly to virtual hardware.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Build & Deploy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate HEX files, flash images, and SD card images. Complete build system
                with automated testing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
