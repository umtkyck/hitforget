import { SerialConsole } from "@/components/device-canvas/serial-console";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Power, RefreshCw, Camera } from "lucide-react";

export default function DevicePage({ params }: { params: { id: string } }) {
  // TODO: Fetch device details from API
  const device = {
    id: params.id,
    type: "Raspberry Pi 4",
    status: "in_use",
    slotNumber: 1,
    rackId: "rack-001",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Device: {device.type}</h1>
        <p className="text-muted-foreground">Slot {device.slotNumber}, {device.rackId}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">{device.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Power Control</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" variant="outline">
              <Power className="h-4 w-4 mr-1" />
              Power On
            </Button>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" variant="outline">
              <Camera className="h-4 w-4 mr-1" />
              Camera
            </Button>
            <Button size="sm" variant="outline">
              Flash
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SerialConsole deviceId={params.id} />

        <Card>
          <CardHeader>
            <CardTitle>Device Camera</CardTitle>
            <CardDescription>Live video stream from device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground ml-2">Camera feed coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
