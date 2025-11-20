'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Cpu, Zap, Shield, Code } from "lucide-react";
import { HeroScene } from "@/components/3d/Scene";
import { LogoFull } from "@/components/logo";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    const ctx = gsap.context(() => {
      // Fade in hero content
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.8,
        ease: "power3.out",
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1.1,
        ease: "power3.out",
      });

      // Parallax effect on scroll
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <LogoFull size="sm" />
          <nav className="hidden md:flex space-x-6">
            <Link href="#features" className="text-sm hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link>
            <Link href="#docs" className="text-sm hover:text-primary transition-colors">Docs</Link>
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

      {/* Hero Section with 3D Scene */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <HeroScene />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl"
          >
            Hardware-as-a-Service
            <span className="block text-blue-400 mt-2 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              + AI Development Platform
            </span>
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg"
          >
            Remote access to real hardware. AI-powered development.
            Test and debug embedded devices from anywhere in the world.
          </p>
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 shadow-2xl hover:shadow-blue-500/50 transition-all" asChild>
              <Link href="/dashboard">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-2xl" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
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
