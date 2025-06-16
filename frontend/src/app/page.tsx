"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Check, Star, Coffee, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "@/components/CustomNode";

const nodeTypes = {
  custom: CustomNode,
};

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blockchainStep, setBlockchainStep] = useState(0);
  const [workflowStep, setWorkflowStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 50, y: 50 });

  const initialNodes: Node[] = [
    {
      id: "1",
      type: "custom",
      position: { x: 45, y: 95 },
      data: {
        label: "Webhook Trigger",
        description: "Receives external events",
        status: "idle",
      },
    },
    {
      id: "2",
      type: "custom",
      position: { x: 305, y: 48 },
      data: {
        label: "Process Data",
        description: "Transform and validate",
        status: "idle",
      },
    },
    {
      id: "3",
      type: "custom",
      position: { x: 298, y: 155 },
      data: {
        label: "Smart Contract",
        description: "Execute blockchain logic",
        status: "idle",
      },
    },
    {
      id: "4",
      type: "custom",
      position: { x: 555, y: 102 },
      data: {
        label: "Send Transaction",
        description: "Submit to network",
        status: "idle",
      },
    },
    {
      id: "5",
      type: "custom",
      position: { x: 805, y: 98 },
      data: {
        label: "Token Transfer",
        description: "Complete transaction",
        status: "idle",
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      style: { stroke: "#374151", strokeWidth: 2 },
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      animated: true,
      style: { stroke: "#374151", strokeWidth: 2 },
    },
    {
      id: "e2-4",
      source: "2",
      target: "4",
      animated: true,
      style: { stroke: "#374151", strokeWidth: 2 },
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      animated: true,
      style: { stroke: "#374151", strokeWidth: 2 },
    },
    {
      id: "e4-5",
      source: "4",
      target: "5",
      animated: true,
      style: { stroke: "#374151", strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    setIsVisible(true);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    const blockchainInterval = setInterval(() => {
      setBlockchainStep((prev) => (prev + 1) % 4);
    }, 2500);

    const workflowInterval = setInterval(() => {
      setWorkflowStep((prev) => (prev + 1) % 5);
    }, 3000);

    // Animate workflow nodes
    const nodeInterval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node, index) => ({
          ...node,
          data: {
            ...node.data,
            status:
              workflowStep > index
                ? "done"
                : workflowStep === index
                ? "processing"
                : "idle",
          },
        }))
      );
    }, 1000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(blockchainInterval);
      clearInterval(workflowInterval);
      clearInterval(nodeInterval);
    };
  }, [setNodes, workflowStep]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }

      // CTA spotlight effect
      if (ctaRef.current) {
        const rect = ctaRef.current.getBoundingClientRect();
        setSpotlightPosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const features = [
    {
      title: "Visual Workflow Builder",
      description: "Drag-and-drop interface for complex Web3 automations",
      image: "/images/workflow-screenshot.png",
    },
    {
      title: "Custom Node Development",
      description: "Build and deploy custom logic with TypeScript",
      image: "/images/custom-node-modal.png",
    },
    {
      title: "Enterprise Configuration",
      description: "Advanced settings for production deployments",
      image: "/images/settings-page.png",
    },
  ];

  const extendedFeatures = [
    {
      title: "Multi-chain Support",
      description: "Ethereum, Polygon, BSC, and 50+ networks",
    },
    {
      title: "Real-time Monitoring",
      description: "Live dashboard with transaction tracking",
    },
    {
      title: "API Integration",
      description: "REST and GraphQL APIs for custom integrations",
    },
    {
      title: "Webhook Support",
      description: "Trigger workflows from external events",
    },
    {
      title: "Smart Contract Templates",
      description: "Pre-built contracts for common use cases",
    },
    {
      title: "Advanced Analytics",
      description: "Detailed insights and performance metrics",
    },
  ];

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All data encrypted in transit and at rest",
    },
    {
      title: "Private Key Management",
      description: "Secure key storage with hardware wallet support",
    },
    {
      title: "Audit Logging",
      description: "Complete transaction history and monitoring",
    },
  ];

  const blockchainSteps = [
    { title: "Transaction Initiated", active: blockchainStep >= 0 },
    { title: "Smart Contract Execution", active: blockchainStep >= 1 },
    { title: "Network Validation", active: blockchainStep >= 2 },
    { title: "Block Confirmation", active: blockchainStep >= 3 },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual developers",
      features: [
        "Up to 1,000 executions/month",
        "5 active workflows",
        "Basic integrations",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing teams and projects",
      features: [
        "Up to 10,000 executions/month",
        "Unlimited workflows",
        "All integrations",
        "Priority support",
        "Advanced analytics",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale operations",
      features: [
        "Unlimited executions",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "On-premise deployment",
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at DeFiCorp",
      content:
        "n8n Web3 transformed our blockchain operations. We reduced manual work by 90%.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Developer at TokenLabs",
      content:
        "The visual workflow builder is incredible. Complex automations made simple.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Blockchain Architect",
      content:
        "Enterprise-grade security with developer-friendly tools. Perfect combination.",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "Founder at CryptoStart",
      content:
        "Saved us months of development time. The custom nodes feature is game-changing.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "DevOps Engineer",
      content:
        "Reliable, scalable, and easy to use. Our go-to solution for Web3 automation.",
      rating: 5,
    },
    {
      name: "Alex Johnson",
      role: "Smart Contract Developer",
      content:
        "The automation capabilities are unmatched. Perfect for our DeFi protocols.",
      rating: 5,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-white"
    >
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-6 border-l border-r border-gray-100/50">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center transform rotate-3">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">
                n8n Web3
              </span>
              <div className="hidden md:flex items-center ml-4">
                <Coffee className="h-3 w-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Built with care</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="#features"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#security"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Security
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-sm border-gray-300 hover:border-gray-400"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-14 bg-white">
        <div className="max-w-5xl mx-auto w-full border-l border-r border-gray-100/50 px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-center mb-6">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 bg-gray-100 text-gray-700 border-0 text-sm rounded-full"
                >
                  Web3 Automation Platform
                </Badge>
                <div className="ml-3 text-xs text-gray-400 transform -rotate-12">
                  <Heart className="h-3 w-3 fill-red-400 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Automate blockchain operations{" "}
                <span className="relative">
                  at scale
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-200 rounded transform -rotate-1"></div>
                </span>
              </h1>
              <p className="text-base text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Build, deploy, and manage Web3 workflows with enterprise-grade
                security and reliability. No more manual blockchain operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 text-sm rounded-lg transform hover:scale-105 transition-all duration-200">
                  Start Building
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2 text-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg"
                >
                  View Documentation
                </Button>
              </div>
              <div className="mt-8 text-xs text-gray-400 flex items-center justify-center space-x-4">
                <span>Trusted by 10,000+ developers</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span>99.9% uptime</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Interactive Workflow Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Interactive Workflow Builder
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Drag, connect, and customize your Web3 automation nodes. It's like
              Figma, but for blockchain workflows.
            </p>
          </div>

          <div className="relative">
            <Card className="relative p-6 border-2 border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden group hover:shadow-2xl hover:border-gray-300 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-[400px] w-full relative">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-50 rounded-xl"
                  >
                    <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
                    <Background
                      variant={BackgroundVariant.Dots}
                      gap={20}
                      size={1}
                      color="#e5e7eb"
                    />
                  </ReactFlow>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-2">
                    <span>💡</span>
                    <span>
                      Try dragging the nodes around • They update in real-time
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Blockchain Process Animation */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              How It Actually Works
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Real blockchain automation in four steps. No magic, just solid
              engineering.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {blockchainSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl ${
                    step.active
                      ? "bg-gray-900 text-white border-gray-900 transform scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    transform: `rotate(${
                      index % 2 === 0 ? "0.5deg" : "-0.5deg"
                    }) ${step.active ? "scale(1.05)" : ""}`,
                  }}
                >
                  <CardContent className="p-0 text-center">
                    <div className="w-8 h-8 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                  </CardContent>
                </Card>
                {index < blockchainSteps.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 transition-all duration-500 ${
                      step.active ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Features Showcase */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Platform Features
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Everything you need to build production-ready Web3 automations.
              Seriously, everything.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`p-5 cursor-pointer transition-all duration-300 border-2 rounded-xl group hover:shadow-lg ${
                    activeFeature === index
                      ? "bg-white shadow-xl border-gray-300 transform scale-[1.02]"
                      : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                  style={{
                    transform: `${
                      activeFeature === index ? "scale(1.02)" : ""
                    } rotate(${index % 2 === 0 ? "0.2deg" : "-0.2deg"})`,
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          activeFeature === index
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold mb-2 text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative">
              <Card className="overflow-hidden border-2 border-gray-200 shadow-xl bg-white rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                <CardContent className="p-0">
                  <Image
                    src={features[activeFeature].image || "/placeholder.svg"}
                    alt={features[activeFeature].title}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
              <div className="absolute -bottom-3 -right-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium transform rotate-12">
                Live Demo ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Extended Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Everything You Need
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              We've thought of everything so you don't have to. Here's what's
              included out of the box.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {extendedFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-2 border-gray-200 transition-all duration-300 group hover:shadow-lg bg-white rounded-xl cursor-pointer hover:border-gray-300 shadow-md hover:shadow-xl"
                style={{
                  transform: `rotate(${
                    index % 3 === 0
                      ? "0.3deg"
                      : index % 3 === 1
                      ? "-0.3deg"
                      : "0.1deg"
                  })`,
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Testimonials - Slanted Marquee */}
      <section className="py-20 px-6 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-5xl mx-auto mb-12 border-l border-r border-gray-100/50 px-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              What Developers Say
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Real feedback from real developers building real Web3
              applications.
            </p>
          </div>
        </div>

        <div className="relative transform -rotate-2 overflow-hidden">
          <div className="flex space-x-6 animate-marquee">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card
                key={index}
                className="min-w-[240px] h-[180px] p-5 border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-shrink-0 group cursor-pointer flex flex-col justify-between"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-800 mb-4 leading-relaxed flex-1">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Simple, Honest Pricing
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              No hidden fees, no surprises. Just straightforward pricing that
              scales with your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`p-6 border-2 transition-all duration-300 hover:shadow-lg rounded-2xl shadow-lg hover:shadow-xl ${
                  plan.popular
                    ? "border-gray-900 bg-gray-900 text-white transform scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                style={{
                  transform: `${plan.popular ? "scale(1.05)" : ""} rotate(${
                    index % 2 === 0 ? "0.2deg" : "-0.2deg"
                  })`,
                }}
              >
                <CardContent className="p-0">
                  {plan.popular && (
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-white text-gray-900 text-xs rounded-full">
                        Most Popular
                      </Badge>
                      <div className="text-xs">🔥</div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        plan.popular ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm ml-2 opacity-70">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm mb-6 opacity-70">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm"
                      >
                        <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105 ${
                      plan.popular
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Security Features */}
      <section
        id="security"
        className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white"
      >
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Security First
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              We take security seriously. Your data and workflows are protected
              by enterprise-grade security measures.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-2 border-gray-200 transition-all duration-300 group hover:shadow-lg bg-white rounded-xl cursor-pointer hover:border-gray-300 shadow-md hover:shadow-xl"
                style={{
                  transform: `rotate(${
                    index % 2 === 0 ? "0.3deg" : "-0.3deg"
                  })`,
                }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Workflows Deployed" },
              { number: "50+", label: "Blockchain Networks" },
              { number: "99.9%", label: "Uptime SLA" },
              { number: "24/7", label: "Enterprise Support" },
            ].map((stat, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-200">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagonal Line Separator */}
      <div className="w-full h-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #000 10px,
              #000 11px
            )`,
          }}
        />
      </div>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Card
            ref={ctaRef}
            className="relative p-10 border-0 bg-gray-900 text-white shadow-2xl overflow-hidden rounded-2xl group transform hover:scale-[1.01] transition-all duration-300"
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
                {[...Array(96)].map((_, i) => (
                  <div
                    key={i}
                    className={`border border-white/20 ${
                      Math.random() > 0.9 ? "bg-white" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            <CardContent className="p-0 relative z-10">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Automate Your Web3 Operations?
              </h2>
              <p className="text-base mb-8 text-gray-300 max-w-2xl mx-auto">
                Join thousands of developers who are already building the future
                of blockchain automation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="secondary"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 py-2 text-sm rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Talk to Sales
                </Button>
              </div>
              <div className="mt-6 text-xs text-gray-400">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto border-l border-r border-gray-100/50 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center transform rotate-3">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">
                n8n Web3
              </span>
              <div className="text-xs text-gray-400 ml-4">
                Made with ❤️ in San Francisco
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Support
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                Documentation
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>
              &copy; 2024 n8n Web3. All rights reserved. Built by humans, for
              humans.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
