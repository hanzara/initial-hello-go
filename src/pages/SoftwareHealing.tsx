import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Dna, Activity, Zap, Shield, TrendingUp, CheckCircle2, Upload, Scan, Brain, Rocket, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";

const SoftwareHealing = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SoftwareHealingSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Dna className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">TDG Platform</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="sm">
                Documentation
              </Button>
              <Button size="sm">
                Get Started
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
              <div className="relative container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Dna className="w-3 h-3 mr-1" />
              Digital DNA Technology
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              TDG: Digital DNA for
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Software Evolution
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An AI-powered software evolution engine that tests, diagnoses, and evolves your apps automatically. 
              Like a genetic lab for software — your code learns, heals, and optimizes itself.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="group">
                Start Evolution
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

            {/* Core Features */}
            <div className="py-20">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    How TDG Works
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Five-step process to evolve your software automatically
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
                  <ProcessStep
                    icon={<Upload className="w-6 h-6" />}
                    number="01"
                    title="Upload"
                    description="Connect your GitHub, GitLab, or Bitbucket repository"
                  />
                  <ProcessStep
                    icon={<Scan className="w-6 h-6" />}
                    number="02"
                    title="DNA Scan"
                    description="Map your app's digital genome and architecture"
                  />
                  <ProcessStep
                    icon={<Brain className="w-6 h-6" />}
                    number="03"
                    title="AI Analysis"
                    description="Simulate millions of optimizations automatically"
                  />
                  <ProcessStep
                    icon={<Activity className="w-6 h-6" />}
                    number="04"
                    title="Evolution"
                    description="Apply improvements and track health metrics"
                  />
                  <ProcessStep
                    icon={<Rocket className="w-6 h-6" />}
                    number="05"
                    title="Deploy"
                    description="Auto-deploy optimized code to production"
                  />
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 bg-card/50">
              <div className="container mx-auto px-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <FeatureCard
                    icon={<Dna className="w-8 h-8 text-primary" />}
                    title="Digital Genome Mapping"
                    description="Scan and visualize your app's complete architecture, dependencies, and behavior patterns as a living DNA structure."
                  />
                  <FeatureCard
                    icon={<Brain className="w-8 h-8 text-primary" />}
                    title="AI Self-Healing"
                    description="Automatically detect and fix performance issues, security vulnerabilities, and code inefficiencies using machine learning."
                  />
                  <FeatureCard
                    icon={<TrendingUp className="w-8 h-8 text-primary" />}
                    title="Continuous Evolution"
                    description="Your app learns and improves over time through AI-driven mutations and selection algorithms."
                  />
                  <FeatureCard
                    icon={<Activity className="w-8 h-8 text-primary" />}
                    title="Real-Time Monitoring"
                    description="Track efficiency scores, health metrics, and evolution progress on an intuitive dashboard."
                  />
                  <FeatureCard
                    icon={<Shield className="w-8 h-8 text-primary" />}
                    title="Security Optimization"
                    description="Identify and patch security risks automatically with AI-powered threat detection and remediation."
                  />
                  <FeatureCard
                    icon={<Zap className="w-8 h-8 text-primary" />}
                    title="Performance Boost"
                    description="Optimize API calls, database queries, and resource usage for lightning-fast performance."
                  />
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="py-20">
              <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      Evolution Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                      Monitor your app's health and track improvements in real-time
                    </p>
                  </div>
                  
                  <Tabs defaultValue="developer" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                      <TabsTrigger value="developer">Developer</TabsTrigger>
                      <TabsTrigger value="startup">Startup</TabsTrigger>
                      <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                      <TabsTrigger value="student">Student</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="developer" className="space-y-4 mt-6">
                      <DashboardCard
                        title="Code Efficiency"
                        description="Real-time analysis of code quality and performance"
                        metrics={[
                          { label: "Efficiency Score", value: "87/100", trend: "+12" },
                          { label: "Bugs Detected", value: "23", trend: "-8" },
                          { label: "Optimizations Applied", value: "156", trend: "+45" }
                        ]}
                      />
                    </TabsContent>
                    
                    <TabsContent value="startup" className="space-y-4 mt-6">
                      <DashboardCard
                        title="Business Performance"
                        description="System uptime, speed, and stability metrics"
                        metrics={[
                          { label: "Uptime", value: "99.9%", trend: "+0.2%" },
                          { label: "Response Time", value: "120ms", trend: "-40ms" },
                          { label: "User Satisfaction", value: "4.8/5", trend: "+0.3" }
                        ]}
                      />
                    </TabsContent>
                    
                    <TabsContent value="enterprise" className="space-y-4 mt-6">
                      <DashboardCard
                        title="Compliance & Security"
                        description="Enterprise-grade monitoring and reporting"
                        metrics={[
                          { label: "Security Score", value: "A+", trend: "Improved" },
                          { label: "Vulnerabilities", value: "0", trend: "-12" },
                          { label: "Compliance Level", value: "100%", trend: "Maintained" }
                        ]}
                      />
                    </TabsContent>
                    
                    <TabsContent value="student" className="space-y-4 mt-6">
                      <DashboardCard
                        title="Learning Mode"
                        description="Guided optimization and real-time AI training"
                        metrics={[
                          { label: "Lessons Completed", value: "12/20", trend: "+3" },
                          { label: "Skills Learned", value: "8", trend: "+2" },
                          { label: "Code Quality", value: "B+", trend: "Improved" }
                        ]}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="py-20 bg-card/50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Choose Your Evolution Plan
                  </h2>
                  <p className="text-muted-foreground">
                    From individual developers to enterprise solutions
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  <PricingCard
                    name="Free"
                    price="$0"
                    description="For small projects"
                    features={[
                      "Up to 1,000 lines of code",
                      "Basic DNA scanning",
                      "Weekly optimization reports",
                      "Community support"
                    ]}
                  />
                  <PricingCard
                    name="Developer"
                    price="$29"
                    description="For individual developers"
                    features={[
                      "Unlimited code lines",
                      "Daily AI optimization",
                      "Real-time monitoring",
                      "Priority support",
                      "GitHub integration"
                    ]}
                    highlighted
                  />
                  <PricingCard
                    name="Startup"
                    price="$99"
                    description="For growing teams"
                    features={[
                      "Everything in Developer",
                      "Team workspaces",
                      "Advanced analytics",
                      "API access",
                      "Custom mutations"
                    ]}
                  />
                  <PricingCard
                    name="Enterprise"
                    price="Custom"
                    description="For large organizations"
                    features={[
                      "Everything in Startup",
                      "Private cloud deployment",
                      "Custom AI training",
                      "SLA guarantees",
                      "Dedicated support"
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="py-20">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Ready to Evolve Your Software?
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Join developers and companies using TDG to build faster, more reliable applications
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button size="lg" className="group">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const ProcessStep = ({ icon, number, title, description }: { 
  icon: React.ReactNode; 
  number: string; 
  title: string; 
  description: string;
}) => (
  <div className="relative text-center space-y-4">
    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div className="text-xs font-bold text-primary">{number}</div>
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <Card className="border-border hover:border-primary/50 transition-all duration-300">
    <CardHeader>
      <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DashboardCard = ({ title, description, metrics }: {
  title: string;
  description: string;
  metrics: { label: string; value: string; trend: string }[];
}) => (
  <Card className="border-border">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            <p className="text-xs text-primary">{metric.trend}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const PricingCard = ({ name, price, description, features, highlighted }: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) => (
  <Card className={`border-border ${highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
    <CardHeader>
      <CardTitle className="text-2xl">{name}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <div className="pt-4">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        {price !== "Custom" && <span className="text-muted-foreground">/month</span>}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button className="w-full" variant={highlighted ? "default" : "outline"}>
        Get Started
      </Button>
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SoftwareHealing;