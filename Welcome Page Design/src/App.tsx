import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Bug, Zap, Shield, Search, Code, CheckCircle2, Sparkles } from "lucide-react";

export default function App() {
  const features = [
    {
      icon: Search,
      title: "Smart Detection",
      description: "Automatically identify UI inconsistencies, layout issues, and visual bugs across your application.",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get real-time feedback and actionable insights to resolve UI bugs in seconds, not hours.",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      iconColor: "text-yellow-600"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Ensure pixel-perfect interfaces with comprehensive testing and validation tools.",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      iconColor: "text-green-600"
    },
    {
      icon: CheckCircle2,
      title: "Cross-Browser Support",
      description: "Test your UI across different browsers and devices to catch compatibility issues early.",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Integrate seamlessly with your workflow and get detailed reports with code-level insights.",
      gradient: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      iconColor: "text-indigo-600"
    },
    {
      icon: Bug,
      title: "Bug Tracking",
      description: "Track and prioritize UI bugs with an intuitive dashboard and collaborative tools.",
      gradient: "from-red-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 blur-2xl opacity-50 rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white p-6 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Bug className="w-16 h-16" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">Powered by AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              UI Bug Analyser
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Detect, analyze, and fix UI bugs faster than ever. Your intelligent companion for building flawless user interfaces.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Start Analyzing
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
            >
              <Code className="w-5 h-5" />
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className={`p-6 ${feature.bgColor} border-2 border-transparent hover:border-${feature.iconColor.replace('text-', '')} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1`}
              >
                <div className="space-y-4">
                  <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={feature.iconColor}>{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">10x</div>
              <p className="text-gray-700">Faster Bug Detection</p>
            </div>
            <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">99%</div>
              <p className="text-gray-700">Accuracy Rate</p>
            </div>
            <div className="space-y-2 p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">24/7</div>
              <p className="text-gray-700">Continuous Monitoring</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <Card className="p-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white border-0 shadow-2xl">
            <div className="space-y-6">
              <h2 className="text-white">Ready to eliminate UI bugs?</h2>
              <p className="text-purple-100 text-lg max-w-2xl mx-auto">
                Join thousands of developers who trust UI Bug Analyser to keep their interfaces pixel-perfect.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
