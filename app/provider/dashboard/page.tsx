import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Cpu, Star, Plus, Calendar } from "lucide-react";
import Link from "next/link";

export default function ProviderDashboard() {
  // TODO: Fetch from API
  const stats = {
    totalEarnings: 1245.50,
    thisMonth: 387.20,
    totalDevices: 8,
    activeDevices: 6,
    rating: 4.7,
    totalReviews: 43,
    totalBookings: 127,
    upcomingBookings: 5,
  };

  const recentBookings = [
    { id: '1', device: 'Raspberry Pi 5', user: 'John D.', duration: '3h', amount: '$6.00', status: 'in_progress' },
    { id: '2', device: 'STM32 Nucleo', user: 'Sarah M.', duration: '5h', amount: '$7.50', status: 'completed' },
    { id: '3', device: 'Intel FPGA', user: 'Mike R.', duration: '2h', amount: '$10.00', status: 'upcoming' },
  ];

  const devices = [
    { id: '1', name: 'Raspberry Pi 5', type: 'ARM SBC', rate: '$2.00/hr', status: 'in_use', bookings: 45 },
    { id: '2', name: 'STM32 Nucleo F401', type: 'ARM Cortex-M', rate: '$1.50/hr', status: 'available', bookings: 32 },
    { id: '3', name: 'Intel FPGA DE10-Lite', type: 'FPGA', rate: '$5.00/hr', status: 'available', bookings: 18 },
    { id: '4', name: 'ESP32 DevKit', type: 'WiFi/BT Module', rate: '$0.50/hr', status: 'maintenance', bookings: 22 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage your devices and earnings</p>
        </div>
        <Button asChild>
          <Link href="/provider/devices/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${stats.thisMonth.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDevices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDevices} total devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingBookings} upcoming
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Devices</CardTitle>
              <CardDescription>Manage your available hardware</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{device.name}</h3>
                        <Badge
                          variant={
                            device.status === 'in_use' ? 'default' :
                            device.status === 'available' ? 'secondary' :
                            'outline'
                          }
                        >
                          {device.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{device.type}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold text-primary">{device.rate}</p>
                      <p className="text-xs text-muted-foreground">{device.bookings} bookings</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Stats</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Track your device reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{booking.device}</p>
                      <p className="text-sm text-muted-foreground">User: {booking.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{booking.amount}</p>
                      <p className="text-xs text-muted-foreground">{booking.duration}</p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'in_progress' ? 'default' :
                        booking.status === 'completed' ? 'secondary' :
                        'outline'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your revenue and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payout</p>
                    <p className="text-2xl font-bold">${stats.thisMonth.toFixed(2)}</p>
                  </div>
                  <Button>Request Payout</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-xl font-bold">${stats.thisMonth.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +15% from last month
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">All Time</p>
                    <p className="text-xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Since {new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>See what users are saying</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <p className="text-3xl font-bold mb-2">{stats.rating} / 5.0</p>
                <p className="text-muted-foreground">{stats.totalReviews} total reviews</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
