import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Cpu,
  Shield,
  AlertCircle,
  Brain,
  Zap,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";

interface Mutation {
  id: string;
  mutation_type: string;
  description: string;
  original_code: string;
  mutated_code: string;
  diff: string;
  explain: string;
  confidence_score: number;
  composite_score: number;
  safety_score: number;
  status: string;
  metrics_before: any;
  metrics_after: any;
  mutation_tests: any[];
}

export default function SmartMerge() {
  const [searchParams] = useSearchParams();
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [selectedMutation, setSelectedMutation] = useState<Mutation | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoTrustMode, setAutoTrustMode] = useState(false);

  useEffect(() => {
    fetchMutations();
  }, []);

  const fetchMutations = async () => {
    try {
      setLoading(true);
      const { data: mutationsData, error } = await supabase
        .from('mutations')
        .select(`
          *,
          mutation_tests (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMutations(mutationsData || []);
      
      const mutationId = searchParams.get('mutation');
      if (mutationId && mutationsData) {
        const mutation = mutationsData.find(m => m.id === mutationId);
        if (mutation) setSelectedMutation(mutation);
      } else if (mutationsData && mutationsData.length > 0) {
        setSelectedMutation(mutationsData[0]);
      }
    } catch (error) {
      console.error('Error fetching mutations:', error);
      toast.error('Failed to load mutations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMutation) return;

    try {
      const { error } = await supabase
        .from('mutations')
        .update({ 
          status: 'approved',
          applied_at: new Date().toISOString(),
        })
        .eq('id', selectedMutation.id);

      if (error) throw error;

      await supabase
        .from('mutation_history')
        .insert({
          mutation_id: selectedMutation.id,
          action: 'approved',
          actor: 'user',
          metadata: { approved_at: new Date().toISOString() }
        });

      toast.success('Mutation approved successfully');
      fetchMutations();
    } catch (error) {
      console.error('Error approving mutation:', error);
      toast.error('Failed to approve mutation');
    }
  };

  const handleReject = async () => {
    if (!selectedMutation) return;

    try {
      const { error } = await supabase
        .from('mutations')
        .update({ status: 'rejected' })
        .eq('id', selectedMutation.id);

      if (error) throw error;

      await supabase
        .from('mutation_history')
        .insert({
          mutation_id: selectedMutation.id,
          action: 'rejected',
          actor: 'user',
          metadata: { rejected_at: new Date().toISOString() }
        });

      toast.success('Mutation rejected');
      fetchMutations();
    } catch (error) {
      console.error('Error rejecting mutation:', error);
      toast.error('Failed to reject mutation');
    }
  };

  const handleRollback = async () => {
    if (!selectedMutation) return;

    try {
      const { data, error } = await supabase.functions.invoke('rollback-mutation', {
        body: { mutationId: selectedMutation.id }
      });

      if (error) throw error;

      toast.success('Mutation rolled back successfully');
      fetchMutations();
    } catch (error) {
      console.error('Error rolling back mutation:', error);
      toast.error('Failed to rollback mutation');
    }
  };

  const getRiskLevel = (safetyScore: number) => {
    if (safetyScore >= 90) return { label: 'Low', color: 'text-green-500' };
    if (safetyScore >= 80) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'High', color: 'text-red-500' };
  };

  const renderMetricChange = (before: number, after: number, unit: string, inverse = false) => {
    const change = ((after - before) / before) * 100;
    const isImprovement = inverse ? change < 0 : change > 0;
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{before}{unit}</span>
        {isImprovement ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${isImprovement ? 'text-green-500' : 'text-red-500'}`}>
          {after}{unit}
        </span>
        <span className={`text-xs ${isImprovement ? 'text-green-500' : 'text-red-500'}`}>
          ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <SoftwareHealingSidebar />
          <div className="flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">SmartMerge 🤖</h1>
            </header>
            <main className="flex items-center justify-center p-6">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
                <p className="text-muted-foreground">Loading mutations...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SoftwareHealingSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              SmartMerge 🤖
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={autoTrustMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoTrustMode(!autoTrustMode)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Auto-Trust {autoTrustMode ? 'ON' : 'OFF'}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            {mutations.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Mutations Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run a test campaign to generate code mutations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Panel - Mutation List */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Pending Patches ({mutations.filter(m => m.status === 'pending').length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[calc(100vh-200px)]">
                        <div className="space-y-2 p-4">
                          {mutations.map((mutation) => (
                            <div
                              key={mutation.id}
                              onClick={() => setSelectedMutation(mutation)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedMutation?.id === mutation.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant={
                                  mutation.status === 'pending' ? 'default' :
                                  mutation.status === 'approved' ? 'secondary' :
                                  'outline'
                                }>
                                  {mutation.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(mutation.confidence_score)}%
                                </span>
                              </div>
                              <h4 className="text-sm font-medium mb-1">{mutation.mutation_type}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {mutation.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Panel - Diff Viewer */}
                <div className="lg:col-span-5">
                  {selectedMutation && (
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          Explainable Diff Viewer
                        </CardTitle>
                        <CardDescription>{selectedMutation.mutation_type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="diff" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="diff">Code Diff</TabsTrigger>
                            <TabsTrigger value="explain">Explanation</TabsTrigger>
                            <TabsTrigger value="metrics">Metrics</TabsTrigger>
                          </TabsList>

                          <TabsContent value="diff">
                            <ScrollArea className="h-[500px]">
                              <div className="bg-muted rounded-lg p-4 font-mono text-xs">
                                {selectedMutation.diff ? (
                                  <pre className="whitespace-pre-wrap">{selectedMutation.diff}</pre>
                                ) : (
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-red-500 mb-2 flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Original Code:
                                      </p>
                                      <pre className="text-muted-foreground pl-4 bg-red-500/10 p-3 rounded">
                                        {selectedMutation.original_code}
                                      </pre>
                                    </div>
                                    <div>
                                      <p className="text-green-500 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Mutated Code:
                                      </p>
                                      <pre className="text-muted-foreground pl-4 bg-green-500/10 p-3 rounded">
                                        {selectedMutation.mutated_code}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="explain">
                            <ScrollArea className="h-[500px]">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <Alert>
                                  <Brain className="h-4 w-4" />
                                  <AlertDescription>
                                    {selectedMutation.explain || selectedMutation.description}
                                  </AlertDescription>
                                </Alert>

                                <div className="mt-4 space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Why this change?</h4>
                                    <p className="text-sm text-muted-foreground">
                                      This patch optimizes the code structure and improves overall performance metrics.
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Expected Impact</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      <li>• Enhanced code readability and maintainability</li>
                                      <li>• Reduced computational complexity</li>
                                      <li>• Improved runtime performance</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="metrics">
                            <ScrollArea className="h-[500px]">
                              <div className="space-y-4">
                                {selectedMutation.metrics_before?.latency_ms && selectedMutation.metrics_after?.latency_ms && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Latency
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {renderMetricChange(
                                        selectedMutation.metrics_before.latency_ms,
                                        selectedMutation.metrics_after.latency_ms,
                                        'ms',
                                        true
                                      )}
                                    </CardContent>
                                  </Card>
                                )}

                                {selectedMutation.metrics_before?.cost && selectedMutation.metrics_after?.cost && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Cost per Request
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {renderMetricChange(
                                        selectedMutation.metrics_before.cost,
                                        selectedMutation.metrics_after.cost,
                                        '$',
                                        true
                                      )}
                                    </CardContent>
                                  </Card>
                                )}

                                {selectedMutation.metrics_before?.memory_mb && selectedMutation.metrics_after?.memory_mb && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Cpu className="h-4 w-4" />
                                        Memory Usage
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {renderMetricChange(
                                        selectedMutation.metrics_before.memory_mb,
                                        selectedMutation.metrics_after.memory_mb,
                                        'MB',
                                        true
                                      )}
                                    </CardContent>
                                  </Card>
                                )}

                                {selectedMutation.metrics_before?.security_score && selectedMutation.metrics_after?.security_score && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Security Score
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {renderMetricChange(
                                        selectedMutation.metrics_before.security_score,
                                        selectedMutation.metrics_after.security_score,
                                        '/100',
                                        false
                                      )}
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Panel - AI Justification */}
                <div className="lg:col-span-4">
                  {selectedMutation && (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            AI Justification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertDescription>
                              {selectedMutation.explain || 
                                `This patch optimizes ${selectedMutation.mutation_type}. Estimated improvement: ${Math.round(selectedMutation.composite_score)}%.`}
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Confidence Score</span>
                                <span className="text-sm font-bold">{Math.round(selectedMutation.confidence_score)}%</span>
                              </div>
                              <Progress value={selectedMutation.confidence_score} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Composite Score</span>
                                <span className="text-sm font-bold">{Math.round(selectedMutation.composite_score)}/100</span>
                              </div>
                              <Progress value={selectedMutation.composite_score} className="h-2" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Safety Score</span>
                                <span className={`text-sm font-bold ${getRiskLevel(selectedMutation.safety_score).color}`}>
                                  {Math.round(selectedMutation.safety_score)}/100
                                </span>
                              </div>
                              <Progress 
                                value={selectedMutation.safety_score} 
                                className="h-2"
                              />
                            </div>

                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Risk Level</span>
                                <Badge variant={
                                  selectedMutation.safety_score >= 90 ? 'secondary' :
                                  selectedMutation.safety_score >= 80 ? 'default' :
                                  'destructive'
                                }>
                                  {getRiskLevel(selectedMutation.safety_score).label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {autoTrustMode && selectedMutation.confidence_score >= 90 && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Auto-Trust Mode: This patch will be automatically applied due to high confidence (≥90%)
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            {selectedMutation.status === 'pending' && (
                              <>
                                <Button 
                                  className="w-full" 
                                  size="lg"
                                  onClick={handleApprove}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve & Apply Patch
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  className="w-full" 
                                  size="lg"
                                  onClick={handleReject}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject Patch
                                </Button>
                              </>
                            )}

                            {selectedMutation.status === 'approved' && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                size="lg"
                                onClick={handleRollback}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Rollback Patch
                              </Button>
                            )}

                            <Button variant="ghost" className="w-full">
                              <Brain className="mr-2 h-4 w-4" />
                              Ask AI to Explain Further
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Test Results */}
                      {selectedMutation.mutation_tests && selectedMutation.mutation_tests.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Test Results</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">CPU Usage</p>
                                <p className="font-medium">{selectedMutation.mutation_tests[0].cpu_usage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Memory</p>
                                <p className="font-medium">{selectedMutation.mutation_tests[0].memory_usage} MB</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Latency</p>
                                <p className="font-medium">{selectedMutation.mutation_tests[0].latency_ms} ms</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Pass Rate</p>
                                <p className="font-medium">{selectedMutation.mutation_tests[0].pass_rate}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}