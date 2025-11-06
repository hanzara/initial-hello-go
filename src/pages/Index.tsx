import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Code2, Sparkles, Bug, Users, Users2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-pulse" style={{ animationDuration: '3s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Code Education</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Transform Code Into
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '2s' }}>
                Knowledge
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              IntelliCore uses advanced AI to explain any code, debug intelligently, and help you build with confidence. Stop copying code blindly — start understanding it deeply.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/editor">
                <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--glow-primary)] transition-all duration-300 hover:shadow-[var(--glow-secondary)]">
                  Start Explaining Code
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/software-healing">
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                  Software Healing
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            <Link to="/editor" className="block">
              <FeatureCard
                icon={<Brain className="w-8 h-8 text-primary" />}
                title="AI Code Tutor"
                description="Get line-by-line explanations, complexity analysis, and optimization suggestions for any code snippet."
              />
            </Link>
            <Link to="/debugger" className="block">
              <FeatureCard
                icon={<Bug className="w-8 h-8 text-primary" />}
                title="Smart Debugger"
                description="AI-powered debugging that identifies issues, suggests fixes, and explains why they work."
              />
            </Link>
            <Link to="/marketplace" className="block">
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="Mentor Marketplace"
                description="Connect with verified expert developers for personalized guidance and code reviews."
              />
            </Link>
          </div>

          {/* Secondary Features */}
          <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
            <Link to="/workspace" className="block">
              <FeatureCard
                icon={<Users2 className="w-8 h-8 text-primary" />}
                title="Team Workspace"
                description="Collaborate with your team on projects with real-time code sharing and AI assistance."
              />
            </Link>
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="Learning Mode"
              description="Transform code explanations into interactive lessons with quizzes and guided practice."
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <StatCard number="10K+" label="Code Explanations" />
            <StatCard number="95%" label="Accuracy Rate" />
            <StatCard number="50+" label="Languages Supported" />
            <StatCard number="24/7" label="AI Availability" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 h-full backdrop-blur-sm">
        <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

export default Index;
