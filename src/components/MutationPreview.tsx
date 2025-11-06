import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  DollarSign,
  Cpu,
  Shield,
  FileCode,
  RotateCcw
} from "lucide-react";

interface MutationPreviewProps {
  mutation: any;
  onApprove: () => void;
  onReject: () => void;
  onRollback?: () => void;
}

export function MutationPreview({ mutation, onApprove, onReject, onRollback }: MutationPreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "applied": return "default";
      case "rejected": return "destructive";
      case "testing": return "secondary";
      default: return "outline";
    }
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

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileCode className="h-5 w-5" />
              {mutation.mutation_type}
            </CardTitle>
            <CardDescription>{mutation.description}</CardDescription>
          </div>
          <Badge variant={getStatusColor(mutation.status)} className="capitalize">
            {mutation.status}
          </Badge>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Composite Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${mutation.composite_score || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(mutation.composite_score || 0).toFixed(1)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Confidence</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${mutation.confidence_score || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(mutation.confidence_score || 0).toFixed(0)}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Safety Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (mutation.safety_score || 0) >= 90 ? 'bg-green-500' : 
                    (mutation.safety_score || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${mutation.safety_score || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(mutation.safety_score || 0).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="explanation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="diff">Code Diff</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="explanation" className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="text-sm font-medium mb-2">Why this change?</h4>
              <p className="text-sm text-muted-foreground">
                {mutation.explain || mutation.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Performance Metrics */}
              {mutation.metrics_before?.latency_ms && mutation.metrics_after?.latency_ms && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Latency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMetricChange(
                      mutation.metrics_before.latency_ms,
                      mutation.metrics_after.latency_ms,
                      'ms',
                      true
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cost Metrics */}
              {mutation.metrics_before?.cost && mutation.metrics_after?.cost && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost per Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMetricChange(
                      mutation.metrics_before.cost,
                      mutation.metrics_after.cost,
                      '$',
                      true
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Memory Metrics */}
              {mutation.metrics_before?.memory_mb && mutation.metrics_after?.memory_mb && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMetricChange(
                      mutation.metrics_before.memory_mb,
                      mutation.metrics_after.memory_mb,
                      'MB',
                      true
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Security Score */}
              {mutation.metrics_before?.security_score && mutation.metrics_after?.security_score && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMetricChange(
                      mutation.metrics_before.security_score,
                      mutation.metrics_after.security_score,
                      '/100',
                      false
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="diff" className="space-y-4">
            <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
              {mutation.diff ? (
                <pre className="whitespace-pre-wrap">{mutation.diff}</pre>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-red-500 mb-2">- Original Code:</p>
                    <pre className="text-muted-foreground pl-4">{mutation.original_code}</pre>
                  </div>
                  <div>
                    <p className="text-green-500 mb-2">+ Mutated Code:</p>
                    <pre className="text-muted-foreground pl-4">{mutation.mutated_code}</pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            {mutation.mutation_tests && mutation.mutation_tests.length > 0 ? (
              <div className="space-y-4">
                {mutation.mutation_tests.map((test: any, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">CPU Usage</p>
                          <p className="text-lg font-medium">{test.cpu_usage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Memory</p>
                          <p className="text-lg font-medium">{test.memory_usage} MB</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Latency</p>
                          <p className="text-lg font-medium">{test.latency_ms} ms</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pass Rate</p>
                          <p className="text-lg font-medium">{test.pass_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cost/Request</p>
                          <p className="text-lg font-medium">${test.cost_per_request}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No test results available yet
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-6 border-t">
          {mutation.status === "pending" && (
            <>
              <Button variant="default" onClick={onApprove} className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Apply
              </Button>
              <Button variant="destructive" onClick={onReject} className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          
          {mutation.status === "applied" && onRollback && (
            <Button variant="outline" onClick={onRollback} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Rollback Mutation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
