import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Cpu, Heart, Verified } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  // TODO: Fetch from API
  const providers = [
    {
      id: '1',
      businessName: 'TechLab Istanbul',
      description: 'Professional hardware testing lab with wide range of development boards',
      location: 'Istanbul, Turkey',
      rating: 4.8,
      totalReviews: 127,
      totalDevices: 15,
      isVerified: true,
      devices: [
        { type: 'Raspberry Pi 5', count: 3, price: '$2.00/hr' },
        { type: 'STM32 Nucleo', count: 5, price: '$1.50/hr' },
        { type: 'Intel FPGA', count: 2, price: '$5.00/hr' },
      ],
    },
    {
      id: '2',
      businessName: 'MakerSpace Ankara',
      description: 'Community maker space offering various eval boards and prototyping hardware',
      location: 'Ankara, Turkey',
      rating: 4.6,
      totalReviews: 89,
      totalDevices: 22,
      isVerified: true,
      devices: [
        { type: 'Arduino Mega', count: 8, price: '$0.75/hr' },
        { type: 'ESP32 DevKit', count: 10, price: '$0.50/hr' },
        { type: 'Raspberry Pi 4', count: 4, price: '$1.50/hr' },
      ],
    },
    {
      id: '3',
      businessName: 'EmbeddedLab Pro',
      description: 'Specialized in ARM Cortex-M and FPGA development platforms',
      location: 'Izmir, Turkey',
      rating: 4.9,
      totalReviews: 156,
      totalDevices: 12,
      isVerified: true,
      devices: [
        { type: 'STM32F7 Discovery', count: 4, price: '$2.50/hr' },
        { type: 'Xilinx Artix-7', count: 3, price: '$6.00/hr' },
        { type: 'Nordic nRF52', count: 5, price: '$1.25/hr' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hardware Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Rent development boards from verified providers worldwide
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Button variant="outline">
          All Providers
        </Button>
        <Button variant="outline">
          <Verified className="h-4 w-4 mr-2" />
          Verified Only
        </Button>
        <Button variant="outline">
          Top Rated
        </Button>
        <Button variant="outline">
          Near Me
        </Button>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">{provider.businessName}</CardTitle>
                    {provider.isVerified && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{provider.rating}</span>
                      <span>({provider.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available Devices</span>
                  <Badge variant="secondary">{provider.totalDevices} boards</Badge>
                </div>

                <div className="space-y-2">
                  {provider.devices.slice(0, 3).map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span>{device.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {device.count}x
                        </Badge>
                      </div>
                      <span className="font-semibold text-primary">{device.price}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link href={`/marketplace/${provider.id}`}>
                    View Provider
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Become a Provider CTA */}
      <Card className="mt-12 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Share Your Hardware, Earn Money</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Have eval boards sitting idle? Put them to work on the Visucan marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">💰 Earn Passive Income</h3>
              <p className="text-sm text-primary-foreground/80">
                Set your own rates and earn 70% of all bookings
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🌍 Global Reach</h3>
              <p className="text-sm text-primary-foreground/80">
                Connect with developers worldwide 24/7
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🛡️ Fully Managed</h3>
              <p className="text-sm text-primary-foreground/80">
                We handle payments, security, and support
              </p>
            </div>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/provider/register">
              Become a Provider
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
