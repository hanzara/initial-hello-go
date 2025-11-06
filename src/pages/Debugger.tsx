import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bug, Code2, Loader2, Home, CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Issue {
  type: "syntax" | "logic" | "runtime" | "security";
  line: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  fix: string;
}

interface TestCase {
  description: string;
  input: string;
  expectedOutput: string;
}

interface DebugResult {
  issues: Issue[];
  testCases: TestCase[];
  overallAssessment: string;
}

const Debugger = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDebug = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to debug");
      return;
    }

    setIsLoading(true);
    setDebugResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('debug-code', {
        body: { code, language }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to debug code. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      setDebugResult(data);
      toast.success("Code analyzed successfully!");
    } catch (err) {
      console.error('Error debugging code:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'syntax': return <XCircle className="w-4 h-4" />;
      case 'logic': return <AlertTriangle className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Input Panel */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Code Input
                </h2>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for debugging..."
                className="min-h-[500px] font-mono text-sm bg-secondary border-border resize-none"
              />

              <Button
                onClick={handleDebug}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bug className="mr-2 h-5 w-5" />
                    Run Debug Analysis
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Debug Results Panel */}
          <Card className="p-6 bg-card border-border">
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary">
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="tests">Test Cases</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : debugResult?.issues.length ? (
                  <div className="space-y-3 max-h-[500px] overflow-auto">
                    {debugResult.issues.map((issue, idx) => (
                      <Card key={idx} className="p-4 bg-secondary border-border">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getTypeIcon(issue.type)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{issue.type}</Badge>
                              <Badge variant="outline">Line {issue.line}</Badge>
                            </div>
                            <p className="text-sm text-foreground">{issue.description}</p>
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Suggested Fix:</p>
                              <code className="text-xs text-foreground">{issue.fix}</code>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20 text-center">
                    <div className="space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                      <p className="text-muted-foreground">
                        {debugResult ? "No issues found!" : "Run analysis to see issues"}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tests" className="mt-4">
                {debugResult?.testCases.length ? (
                  <div className="space-y-3 max-h-[500px] overflow-auto">
                    {debugResult.testCases.map((test, idx) => (
                      <Card key={idx} className="p-4 bg-secondary border-border">
                        <h4 className="font-medium text-foreground mb-2">{test.description}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Input: </span>
                            <code className="text-foreground">{test.input}</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected: </span>
                            <code className="text-foreground">{test.expectedOutput}</code>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground">No test cases generated yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="assessment" className="mt-4">
                {debugResult?.overallAssessment ? (
                  <Card className="p-6 bg-secondary border-border">
                    <p className="text-foreground leading-relaxed">{debugResult.overallAssessment}</p>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground">No assessment available yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Debugger;
