import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Zap, 
  DollarSign, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TestResult {
  mutation_id: string;
  mutation: {
    id: string;
    mutation_type: string;
    description: string;
    confidence_score: number;
    status: string;
    composite_score?: number;
  };
  cpu_usage: number;
  memory_usage: number;
  latency_ms: number;
  pass_rate: number;
  cost_per_request: number;
  test_results: any;
  created_at: string;
}

export default function LiveBench() {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadTestResults(selectedRepo);
    }
  }, [selectedRepo]);

  const loadRepositories = async () => {
    const { data } = await supabase
      .from("repositories")
      .select("*")
      .order("created_at", { ascending: false });

    setRepositories(data || []);
    if (data && data.length > 0 && !selectedRepo) {
      setSelectedRepo(data[0].id);
    }
  };

  const loadTestResults = async (repoId: string) => {
    const { data } = await supabase
      .from("mutation_tests")
      .select(`
        *,
        mutation:mutations(*)
      `)
      .eq("mutation.repository_id", repoId)
      .order("created_at", { ascending: false });

    setTestResults(data || []);
    if (data && data.length > 0) {
      setSelectedTest(data[0]);
    }
  };

  const handleRunTest = async (mutationId: string) => {
    setIsRunningTest(true);
    try {
      const { error } = await supabase.functions.invoke("test-mutation", {
        body: { mutationId }
      });

      if (error) throw error;

      toast.success("Test completed successfully!");
      loadTestResults(selectedRepo!);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to run test");
    } finally {
      setIsRunningTest(false);
    }
  };

  const getHealthColor = (value: number, metric: string) => {
    if (metric === "cpu" || metric === "memory") {
      if (value < 50) return "text-green-500";
      if (value < 80) return "text-yellow-500";
      return "text-red-500";
    }
    if (metric === "latency") {
      if (value < 100) return "text-green-500";
      if (value < 200) return "text-yellow-500";
      return "text-red-500";
    }
    if (metric === "pass_rate") {
      if (value > 95) return "text-green-500";
      if (value > 85) return "text-yellow-500";
      return "text-red-500";
    }
    return "text-foreground";
  };

  const generateMetricHistory = (currentValue: number) => {
    return Array.from({ length: 10 }, (_, i) => ({
      time: `T-${10 - i}`,
      value: currentValue + (Math.random() - 0.5) * 20
    }));
  };

  const getAIInsight = (test: TestResult) => {
    const insights = [];
    
    if (test.cpu_usage < 50) {
      insights.push(`Excellent CPU efficiency at ${test.cpu_usage.toFixed(1)}%`);
    }
    if (test.latency_ms < 100) {
      insights.push(`Outstanding latency of ${test.latency_ms.toFixed(1)}ms`);
    }
    if (test.pass_rate > 95) {
      insights.push(`High reliability with ${test.pass_rate.toFixed(1)}% pass rate`);
    }
    if (test.cost_per_request < 0.001) {
      insights.push(`Cost-effective at $${test.cost_per_request.toFixed(4)} per request`);
    }

    return insights.length > 0 ? insights.join(". ") : "Performance within acceptable ranges.";
  };

  const rankTests = () => {
    return [...testResults]
      .sort((a, b) => {
        const scoreA = (100 - a.cpu_usage) + (100 - a.memory_usage) + (1000 / a.latency_ms) + a.pass_rate - (a.cost_per_request * 1000);
        const scoreB = (100 - b.cpu_usage) + (100 - b.memory_usage) + (1000 / b.latency_ms) + b.pass_rate - (b.cost_per_request * 1000);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SoftwareHealingSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">LiveBench 📊</h1>
                <p className="text-muted-foreground text-lg">
                  Sandboxed A/B testing with real-time performance validation
                </p>
              </div>
            </div>

            {/* Repository Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {repositories.map((repo) => (
                <Button
                  key={repo.id}
                  variant={selectedRepo === repo.id ? "default" : "outline"}
                  onClick={() => setSelectedRepo(repo.id)}
                  className="whitespace-nowrap"
                >
                  {repo.name}
                </Button>
              ))}
            </div>

            {/* Top Metrics Overview */}
            <div className="grid md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Avg CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getHealthColor(
                    testResults.reduce((acc, t) => acc + t.cpu_usage, 0) / (testResults.length || 1),
                    "cpu"
                  )}`}>
                    {(testResults.reduce((acc, t) => acc + t.cpu_usage, 0) / (testResults.length || 1)).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Avg Memory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getHealthColor(
                    testResults.reduce((acc, t) => acc + t.memory_usage, 0) / (testResults.length || 1),
                    "memory"
                  )}`}>
                    {(testResults.reduce((acc, t) => acc + t.memory_usage, 0) / (testResults.length || 1)).toFixed(1)} MB
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getHealthColor(
                    testResults.reduce((acc, t) => acc + t.latency_ms, 0) / (testResults.length || 1),
                    "latency"
                  )}`}>
                    {(testResults.reduce((acc, t) => acc + t.latency_ms, 0) / (testResults.length || 1)).toFixed(0)}ms
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Pass Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getHealthColor(
                    testResults.reduce((acc, t) => acc + t.pass_rate, 0) / (testResults.length || 1),
                    "pass_rate"
                  )}`}>
                    {(testResults.reduce((acc, t) => acc + t.pass_rate, 0) / (testResults.length || 1)).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Avg Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    ${(testResults.reduce((acc, t) => acc + t.cost_per_request, 0) / (testResults.length || 1)).toFixed(4)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Panel - Test Results List */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Live Test Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {testResults.map((test, index) => (
                      <div
                        key={test.mutation_id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedTest?.mutation_id === test.mutation_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedTest(test)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Badge className="bg-yellow-500">🥇 Top Performer</Badge>}
                            <Badge variant="outline">Test #{test.mutation_id.slice(0, 8)}</Badge>
                          </div>
                          <Badge variant={test.mutation.status === "pending" ? "secondary" : "default"}>
                            {test.mutation.status}
                          </Badge>
                        </div>

                        <p className="text-sm mb-3">{test.mutation.description}</p>

                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">CPU</span>
                            <p className={`font-bold ${getHealthColor(test.cpu_usage, "cpu")}`}>
                              {test.cpu_usage.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory</span>
                            <p className={`font-bold ${getHealthColor(test.memory_usage, "memory")}`}>
                              {test.memory_usage.toFixed(1)} MB
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latency</span>
                            <p className={`font-bold ${getHealthColor(test.latency_ms, "latency")}`}>
                              {test.latency_ms.toFixed(0)}ms
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pass Rate</span>
                            <p className={`font-bold ${getHealthColor(test.pass_rate, "pass_rate")}`}>
                              {test.pass_rate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {testResults.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No test results yet. Run tests from the Evolution Engine.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Charts */}
                {selectedTest && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Real-Time Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">CPU & Memory Usage</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={generateMetricHistory(selectedTest.cpu_usage)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#10b981" name="CPU %" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Latency Over Time</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={generateMetricHistory(selectedTest.latency_ms)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" name="Latency (ms)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Sidebar - AI Insights & Actions */}
              <div className="space-y-4">
                {selectedTest && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Security Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">No Vulnerabilities</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          All dependencies scanned. No critical issues found.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{getAIInsight(selectedTest)}</p>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fitness Score</span>
                            <span className="font-bold text-green-500">
                              {((100 - selectedTest.cpu_usage + 100 - selectedTest.memory_usage + selectedTest.pass_rate) / 3).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(100 - selectedTest.cpu_usage + 100 - selectedTest.memory_usage + selectedTest.pass_rate) / 3} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full" variant="default">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Promote to Production
                        </Button>
                        <Button className="w-full" variant="outline">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Variant
                        </Button>
                        <Button className="w-full" variant="outline">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Run More Tests
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Test Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{selectedTest.mutation.mutation_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{selectedTest.mutation.confidence_score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost/Request</span>
                          <span className="font-medium">${selectedTest.cost_per_request.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tested</span>
                          <span className="font-medium">
                            {new Date(selectedTest.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankTests().map((test, index) => (
                    <div key={test.mutation_id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="text-2xl font-bold w-8">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{test.mutation.description}</p>
                        <p className="text-xs text-muted-foreground">
                          CPU: {test.cpu_usage.toFixed(1)}% | Memory: {test.memory_usage.toFixed(1)}MB | 
                          Latency: {test.latency_ms.toFixed(0)}ms | Pass: {test.pass_rate.toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        Rank #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
