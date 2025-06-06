"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Clock,
  Shield,
  Workflow,
  Code,
  Rocket,
  CheckCircle,
  Star,
  Github,
  Twitter,
  DiscIcon as Discord,
  Play,
  Sparkles,
  Hexagon,
  Box,
  Layers,
} from "lucide-react";
import Link from "next/link";
import Testimonials from "@/components/ui/testimonials";

// Blockchain visualization component
const BlockchainVisualization = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-[600px] opacity-30 z-0 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Blockchain blocks */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${Math.sin(i * 0.7) * 30 + 50}%`,
              left: `${i * 12 + 5}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div
              className={`w-24 h-24 md:w-32 md:h-32 border-2 border-teal-400/30 backdrop-blur-sm 
                         bg-gradient-to-br from-teal-900/20 to-emerald-900/10 
                         rounded-xl rotate-12 animate-float shadow-lg shadow-teal-500/20`}
            >
              <div className="absolute inset-1 flex items-center justify-center">
                <Hexagon className="w-8 h-8 text-teal-400/70" />
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-teal-400/70 font-mono">
                #{i + 1}
              </div>
            </div>

            {/* Connection lines */}
            {i < 7 && (
              <div
                className="absolute top-1/2 left-full w-16 md:w-24 h-0.5 bg-gradient-to-r from-teal-400/70 to-teal-400/10 
                          transform -translate-y-1/2 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Floating 3D elements
const FloatingElements = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-2xl animate-bounce delay-500"></div>

      {/* 3D geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        >
          <div
            className={`w-16 h-16 md:w-24 md:h-24 border border-teal-400/20 
                      bg-gradient-to-br from-teal-900/5 to-transparent 
                      backdrop-blur-sm rounded-lg animate-float`}
            style={{ animationDelay: `${i * 0.5}s` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0E14] relative overflow-hidden">
      {/* Floating background elements */}
      <FloatingElements />

      {/* Header */}
      <header className="relative z-50 border-b border-teal-400/20 backdrop-blur-2xl bg-[#0A0E14]/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/50 transition-all duration-300 group-hover:scale-110">
                <Layers className="w-6 h-6 text-[#0A0E14]" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-teal-200 to-emerald-200 bg-clip-text text-transparent">
                FlowForge
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-200 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-gray-200 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                className="text-gray-200 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
              >
                Docs
              </Link>
              <Button
                variant="outline"
                className="border-2 border-teal-400/50 text-teal-200 hover:bg-teal-500/20 hover:border-teal-400 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25"
              >
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#0A0E14] font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105">
                Get Started
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32">
        {/* Blockchain visualization */}
        <BlockchainVisualization />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-8 bg-gradient-to-r from-teal-500/30 to-emerald-500/30 text-white border-2 border-teal-400/50 hover:border-teal-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25 cursor-pointer">
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              The Future of Web3 Automation
            </Badge>

            <h1 className="text-6xl md:text-8xl font-black mb-10 leading-tight">
              <span className="bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Build Web3 Flows
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                Without Limits
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              The most powerful Web3 automation platform. Create complex
              workflows, schedule transactions, and orchestrate your entire DeFi
              strategy.{" "}
              <span className="text-teal-300 font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                We can do it all, and nobody can stop us.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#0A0E14] px-12 py-6 text-xl font-bold shadow-2xl shadow-teal-500/50 hover:shadow-teal-500/75 transition-all duration-300 hover:scale-110 group"
              >
                Start Building Free
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-12 py-6 text-xl font-bold backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
              >
                <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Active Flows" },
                { number: "$2B+", label: "Volume Processed" },
                { number: "50+", label: "Integrations" },
                { number: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group cursor-pointer hover:scale-110 transition-all duration-300"
                >
                  <div className="text-4xl md:text-5xl font-black text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D cards */}
      <section id="features" className="py-32 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-2xl text-gray-200 max-w-3xl mx-auto font-light">
              From simple swaps to complex DeFi strategies, we've got the tools
              to make it happen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Workflow,
                title: "Visual Flow Builder",
                description:
                  "Drag, drop, and connect. Build complex Web3 workflows without writing a single line of code.",
                gradient: "from-teal-500 to-emerald-600",
                bgGradient: "from-teal-900/30 to-emerald-800/20",
                borderColor: "border-teal-400/30",
                features: [
                  "Intuitive drag & drop interface",
                  "Pre-built templates",
                  "Real-time testing",
                ],
              },
              {
                icon: Clock,
                title: "Smart Scheduling",
                description:
                  "Time-based triggers, price alerts, and condition-based execution. Never miss an opportunity.",
                gradient: "from-amber-500 to-amber-600",
                bgGradient: "from-amber-900/30 to-amber-800/20",
                borderColor: "border-amber-400/30",
                features: [
                  "Cron-based scheduling",
                  "Price-based triggers",
                  "Event-driven automation",
                ],
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Bank-grade security with multi-sig support, hardware wallet integration, and audit trails.",
                gradient: "from-emerald-500 to-emerald-600",
                bgGradient: "from-emerald-900/30 to-emerald-800/20",
                borderColor: "border-emerald-400/30",
                features: [
                  "Multi-signature wallets",
                  "Hardware wallet support",
                  "Complete audit logs",
                ],
              },
              {
                icon: Code,
                title: "Developer APIs",
                description:
                  "RESTful APIs, GraphQL endpoints, and WebSocket connections for real-time integration.",
                gradient: "from-rose-500 to-rose-600",
                bgGradient: "from-rose-900/30 to-rose-800/20",
                borderColor: "border-rose-400/30",
                features: [
                  "RESTful & GraphQL APIs",
                  "WebSocket real-time data",
                  "SDK for popular languages",
                ],
              },
              {
                icon: Rocket,
                title: "Multi-Chain Support",
                description:
                  "Ethereum, Polygon, BSC, Arbitrum, and more. One platform for all your chains.",
                gradient: "from-amber-500 to-rose-600",
                bgGradient: "from-amber-900/30 to-rose-800/20",
                borderColor: "border-amber-400/30",
                features: [
                  "15+ supported chains",
                  "Cross-chain bridges",
                  "Unified portfolio view",
                ],
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Sub-second execution times with our optimized infrastructure and MEV protection.",
                gradient: "from-teal-500 to-emerald-600",
                bgGradient: "from-teal-900/30 to-emerald-800/20",
                borderColor: "border-teal-400/30",
                features: [
                  "<100ms execution time",
                  "MEV protection built-in",
                  "99.9% uptime guarantee",
                ],
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${feature.bgGradient} border-2 ${feature.borderColor} backdrop-blur-xl 
                           hover:border-opacity-60 transition-all duration-500 hover:scale-105 
                           hover:shadow-2xl group cursor-pointer
                           [transform-style:preserve-3d] perspective`}
                style={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                <CardContent className="p-10 relative">
                  {/* 3D effect elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl transform -translate-z-10"></div>

                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 
                              shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300
                              [transform:translateZ(20px)]`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 [transform:translateZ(15px)]">
                    {feature.title}
                  </h3>
                  <p className="text-gray-200 mb-8 text-lg leading-relaxed group-hover:text-white transition-colors duration-300 [transform:translateZ(10px)]">
                    {feature.description}
                  </p>
                  <ul className="space-y-4 [transform:translateZ(5px)]">
                    {feature.features.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center text-gray-200 group-hover:text-white transition-colors duration-300"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Technology Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 to-emerald-900/20 backdrop-blur-3xl"></div>

        {/* Blockchain visualization elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="grid grid-cols-4 gap-4 transform rotate-12">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-24 border border-teal-400/30 rounded-lg bg-gradient-to-br from-teal-900/30 to-transparent backdrop-blur-sm"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animation: "pulse 3s infinite ease-in-out",
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <Hexagon className="w-8 h-8 text-teal-400/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent">
                  Built on Modern Blockchain Technology
                </h2>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Our platform leverages the latest advancements in blockchain
                  technology to provide secure, transparent, and efficient
                  automation for your Web3 workflows.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Decentralized execution environment",
                    "Immutable audit trails",
                    "Cryptographically secure transactions",
                    "Cross-chain compatibility",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-200">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg shadow-teal-500/25">
                        <CheckCircle className="w-4 h-4 text-[#0A0E14]" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#0A0E14] font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 group">
                  Learn More About Our Technology
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>

              <div className="relative">
                {/* 3D Blockchain Visualization */}
                <div className="aspect-square relative bg-gradient-to-br from-[#0A0E14] to-[#0A0E14]/50 rounded-2xl border-2 border-teal-400/30 p-8 shadow-2xl shadow-teal-500/20 transform perspective hover:rotate-y-12 transition-transform duration-700">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=600')] bg-center bg-no-repeat bg-contain opacity-10"></div>

                  {/* Blockchain nodes */}
                  <div className="relative h-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-16 h-16 border-2 border-teal-400/50 rounded-lg bg-gradient-to-br from-teal-900/50 to-transparent backdrop-blur-sm flex items-center justify-center shadow-lg shadow-teal-500/20"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${10 + (i % 3) * 30}%`,
                          animation: "float 3s infinite ease-in-out",
                          animationDelay: `${i * 0.5}s`,
                        }}
                      >
                        <Hexagon className="w-8 h-8 text-teal-400" />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-teal-400 to-transparent"></div>
                      </div>
                    ))}

                    {/* Connection lines */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      style={{ zIndex: -1 }}
                    >
                      <path
                        d="M80,100 L160,150 L240,120 L320,170 L400,130"
                        stroke="url(#lineGradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                      <linearGradient
                        id="lineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2DD4BF"
                          stopOpacity="0.8"
                        />
                        <stop
                          offset="100%"
                          stopColor="#2DD4BF"
                          stopOpacity="0.2"
                        />
                      </linearGradient>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 to-emerald-600/30 blur-3xl animate-pulse"></div>

        {/* Blockchain nodes in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="grid grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 border border-teal-400/30 rounded-lg bg-gradient-to-br from-teal-900/30 to-transparent backdrop-blur-sm"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animation: "pulse 4s infinite ease-in-out",
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <Box className="w-6 h-6 text-teal-400/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black mb-10 leading-tight">
              <span className="bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Ready to Build
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                the Future?
              </span>
            </h2>
            <p className="text-2xl text-gray-100 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Join the revolution. Start building unstoppable Web3 workflows
              today.
              <span className="text-teal-300 font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                No limits. No compromises.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-[#0A0E14] px-16 py-6 text-xl font-bold shadow-2xl shadow-teal-500/50 hover:shadow-teal-500/75 transition-all duration-300 hover:scale-110 group"
              >
                Start Building Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-16 py-6 text-xl font-bold backdrop-blur-sm transition-all duration-300 hover:scale-110"
              >
                Schedule Demo
              </Button>
            </div>

            <p className="text-gray-200 text-lg font-medium">
              Free forever plan • No credit card required • Deploy in seconds
            </p>
          </div>
        </div>
      </section>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .perspective {
          perspective: 1000px;
        }

        .hover\:rotate-y-12:hover {
          transform: rotateY(12deg);
        }
      `}</style>
    </div>
  );
}
