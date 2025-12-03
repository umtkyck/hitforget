import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Zap, Clock, DollarSign, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Visucan</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">Projects</Link>
            <Link href="/devices" className="text-sm text-muted-foreground hover:text-foreground">Devices</Link>
            <Link href="/builds" className="text-sm text-muted-foreground hover:text-foreground">Builds</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Successful Builds
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Device Hours
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5h</div>
              <p className="text-xs text-muted-foreground">
                +5.2h from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$47.50</div>
              <p className="text-xs text-muted-foreground">
                Device time + AI usage
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest hardware projects</CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Temperature Monitor", device: "ESP32", status: "Building" },
                  { name: "LED Controller", device: "Arduino Uno", status: "Success" },
                  { name: "FPGA Signal Processor", device: "Intel FPGA", status: "Testing" },
                ].map((project, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.device}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.status === 'Success' ? 'bg-green-100 text-green-800' :
                      project.status === 'Building' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Available Devices</CardTitle>
              <CardDescription>Ready to use right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Raspberry Pi 4", available: 3, price: "$1.50/hr" },
                  { type: "Arduino Uno", available: 8, price: "$0.50/hr" },
                  { type: "STM32 Nucleo", available: 5, price: "$1.00/hr" },
                  { type: "Intel FPGA", available: 2, price: "$5.00/hr" },
                ].map((device, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cpu className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{device.type}</p>
                        <p className="text-sm text-muted-foreground">{device.available} available</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{device.price}</p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/devices?type=${device.type}`}>Reserve</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button className="h-20" variant="outline" asChild>
                <Link href="/projects/new">
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    <p>Create Project from Prompt</p>
                  </div>
                </Link>
              </Button>
              <Button className="h-20" variant="outline" asChild>
                <Link href="/devices">
                  <div className="text-center">
                    <Cpu className="h-6 w-6 mx-auto mb-2" />
                    <p>Browse Devices</p>
                  </div>
                </Link>
              </Button>
              <Button className="h-20" variant="outline" asChild>
                <Link href="/docs">
                  <div className="text-center">
                    <Zap className="h-6 w-6 mx-auto mb-2" />
                    <p>View Documentation</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
