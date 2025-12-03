import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

export default function ProviderRegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Become a Hardware Provider</h1>
        <p className="text-xl text-muted-foreground">
          Turn your idle eval boards into a passive income stream
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">💰 Earn 70% Revenue</h4>
              <p className="text-sm text-muted-foreground">
                Keep 70% of all bookings. We handle everything else.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🌍 Global Marketplace</h4>
              <p className="text-sm text-muted-foreground">
                Reach developers from around the world 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">🛡️ Fully Managed</h4>
              <p className="text-sm text-muted-foreground">
                Automated billing, security, and customer support.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">📊 Analytics Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Track earnings, bookings, and device performance.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold mb-1">✅ Stable Internet</h4>
              <p className="text-sm text-muted-foreground">
                Minimum 10 Mbps upload speed for reliable connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ 24/7 Availability</h4>
              <p className="text-sm text-muted-foreground">
                Devices should be accessible round the clock.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ Quality Hardware</h4>
              <p className="text-sm text-muted-foreground">
                Working development boards with proper accessories.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">✅ Basic Setup</h4>
              <p className="text-sm text-muted-foreground">
                Install our agent software and configure network.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Application</CardTitle>
          <CardDescription>
            Fill out this form to get started. We'll review and contact you within 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business/Lab Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., TechLab Istanbul"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Istanbul, Turkey"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your lab, hardware collection, and experience..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourlab.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hardwareList">Hardware You'll Provide</Label>
              <Textarea
                id="hardwareList"
                placeholder="List your available development boards, quantities, and any special features..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option>Hobbyist</option>
                <option>Professional Lab</option>
                <option>University/Institution</option>
                <option>Commercial Provider</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-input"
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="/provider/terms" className="text-primary hover:underline">
                  Provider Terms & Conditions
                </a>
              </Label>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Questions? Contact us at{" "}
          <a href="mailto:providers@visucan.io" className="text-primary hover:underline">
            providers@visucan.io
          </a>
        </p>
      </div>
    </div>
  );
}
