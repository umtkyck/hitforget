import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Cpu, Zap, Shield, Code } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HitForget</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#features" className="text-sm hover:text-primary">Features</Link>
            <Link href="#pricing" className="text-sm hover:text-primary">Pricing</Link>
            <Link href="#docs" className="text-sm hover:text-primary">Docs</Link>
          </nav>
          <div className="flex space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Hardware-as-a-Service
            <span className="block text-primary mt-2">+ AI Development Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Remote access to real hardware. AI-powered development.
            Test and debug embedded devices from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Building <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose HitForget?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Cpu className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real Hardware Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Raspberry Pi, Arduino, STM32, FPGA. Access real devices remotely with full control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Build & Flash Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automated compilation, testing, and firmware deployment. From code to device in minutes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  GPT-4, Claude, GitHub Copilot. Generate code, tests, and documentation with AI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure & Isolated</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Zero-trust architecture. Your code and data are encrypted and isolated.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Hardware */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Hardware</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "Raspberry Pi 4/5", price: "$1.50/hr" },
              { name: "Arduino Uno/Mega", price: "$0.50/hr" },
              { name: "STM32 Nucleo", price: "$1.00/hr" },
              { name: "Intel FPGA", price: "$5.00/hr" },
              { name: "Raspberry Pi Pico", price: "$0.50/hr" },
              { name: "ESP32", price: "$0.50/hr" },
              { name: "STM32 Discovery", price: "$1.50/hr" },
              { name: "More Coming...", price: "Custom" },
            ].map((hw, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{hw.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{hw.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Building?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers using HitForget for embedded development.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="h-5 w-5 text-primary" />
                <span className="font-bold">HitForget</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hardware-as-a-Service platform for embedded developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="/docs">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 HitForget. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
