import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Code2, Loader2, Home, Play, Save, Share2, GitCompare, Shield, Zap, Activity, Bug, Eye, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface DebugIssue {
  type: string;
  line: number;
  severity: string;
  description: string;
  fix: string;
}

const Editor = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [explanation, setExplanation] = useState("");
  const [optimization, setOptimization] = useState("");
  const [securityReport, setSecurityReport] = useState("");
  const [complexityAnalysis, setComplexityAnalysis] = useState("");
  const [debugIssues, setDebugIssues] = useState<DebugIssue[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOutput, setPreviewOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [convertingToLesson, setConvertingToLesson] = useState(false);
  const [activeTab, setActiveTab] = useState("explanation");
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure autocomplete
    editor.updateOptions({
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
      wordBasedSuggestions: "matchingDocuments",
      suggest: {
        showWords: true,
        showSnippets: true,
      }
    });
  };

  const handleDebug = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to debug");
      return;
    }

    setIsLoading(true);
    setActiveTab("explanation");

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

      setDebugIssues(data.issues || []);
      
      // Add decorations for errors in editor
      if (editorRef.current && data.issues) {
        const newDecorations = data.issues.map((issue: DebugIssue) => ({
          range: {
            startLineNumber: issue.line,
            startColumn: 1,
            endLineNumber: issue.line,
            endColumn: 1000
          },
          options: {
            isWholeLine: true,
            className: issue.severity === 'critical' || issue.severity === 'high' 
              ? 'bg-destructive/20' 
              : 'bg-warning/20',
            glyphMarginClassName: issue.severity === 'critical' || issue.severity === 'high'
              ? 'bg-destructive'
              : 'bg-warning',
            hoverMessage: { value: `**${issue.type}**: ${issue.description}\n\n**Fix**: ${issue.fix}` }
          }
        }));
        
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          newDecorations as any
        );
      }

      toast.success("Debug analysis complete!");
    } catch (err) {
      console.error('Error debugging code:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (!code.trim()) {
      toast.error("Please enter some code to preview");
      return;
    }

    try {
      // For JavaScript/TypeScript, try to execute safely
      if (language === 'javascript' || language === 'typescript') {
        const originalLog = console.log;
        let output = '';
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };
        
        try {
          // eslint-disable-next-line no-eval
          eval(code);
          console.log = originalLog;
          setPreviewOutput(output || 'Code executed successfully (no output)');
          setShowPreview(true);
        } catch (err) {
          console.log = originalLog;
          setPreviewOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setShowPreview(true);
        }
      } else {
        setPreviewOutput(`Preview is currently supported for JavaScript/TypeScript only.\n\nYour ${language} code:\n${code}`);
        setShowPreview(true);
      }
    } catch (err) {
      toast.error("Failed to preview code");
      console.error(err);
    }
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to explain");
      return;
    }

    setIsLoading(true);
    setExplanation("");

    try {
      const { data, error } = await supabase.functions.invoke('explain-code', {
        body: { code, language }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to explain code. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      setExplanation(data.explanation);
      setActiveTab("explanation");
      toast.success("Code explained successfully!");
    } catch (err) {
      console.error('Error explaining code:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to optimize");
      return;
    }

    setIsLoading(true);
    setOptimization("");

    try {
      const { data, error } = await supabase.functions.invoke('optimize-code', {
        body: { code, language }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to optimize code. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      setOptimization(data.optimization);
      setActiveTab("optimization");
      toast.success("Optimization suggestions generated!");
    } catch (err) {
      console.error('Error optimizing code:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityScan = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to scan");
      return;
    }

    setIsLoading(true);
    setSecurityReport("");

    try {
      const { data, error } = await supabase.functions.invoke('security-scan', {
        body: { code, language }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to scan code. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      setSecurityReport(data.securityReport);
      setActiveTab("security");
      toast.success("Security scan complete!");
    } catch (err) {
      console.error('Error scanning code:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplexityAnalysis = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to analyze");
      return;
    }

    setIsLoading(true);
    setComplexityAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke('complexity-analysis', {
        body: { code, language }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI credits depleted. Please add credits to continue.");
        } else {
          toast.error("Failed to analyze complexity. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      setComplexityAnalysis(data.complexityAnalysis);
      setActiveTab("complexity");
      toast.success("Complexity analysis complete!");
    } catch (err) {
      console.error('Error analyzing complexity:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToLesson = async () => {
    if (!code || !explanation) {
      toast.error('Please explain the code first');
      return;
    }

    setConvertingToLesson(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create lessons');
        return;
      }

      const { data: lessonData, error: lessonError } = await supabase.functions.invoke('generate-lesson', {
        body: { code, language, explanation }
      });

      if (lessonError) throw lessonError;

      const lesson = lessonData.lesson;

      const youtubeVideos = [];
      if (lesson.youtube_search_queries && lesson.youtube_search_queries.length > 0) {
        for (const query of lesson.youtube_search_queries.slice(0, 3)) {
          const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          youtubeVideos.push({
            title: query,
            url: searchUrl
          });
        }
      }

      const { data: savedLesson, error: saveError } = await supabase
        .from('lessons')
        .insert({
          user_id: user.id,
          title: lesson.title,
          summary: lesson.summary,
          code_snippet: code,
          language: language,
          concepts: lesson.concepts || [],
          youtube_videos: youtubeVideos,
          quiz_data: lesson.quiz || [],
          difficulty_level: lesson.difficulty_level,
          duration_minutes: lesson.duration_minutes,
          xp_points: lesson.xp_points,
          learning_objectives: lesson.learning_objectives || [],
          key_takeaways: lesson.key_takeaways || [],
          next_topics: lesson.next_topics || [],
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast.success('🎉 Lesson created successfully!');
      navigate(`/lesson/${savedLesson.id}`);

    } catch (error: any) {
      console.error('Error creating lesson:', error);
      toast.error(error.message || 'Failed to create lesson');
    } finally {
      setConvertingToLesson(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">IntelliCore</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              AI Code Tutor
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <GitCompare className="w-4 h-4" />
              Compare
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,500px] gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Code Editor */}
          <Card className="p-4 bg-card border-border flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
              </div>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px] bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handlePreview}
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4" />
                  Run
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleDebug}
                  disabled={isLoading}
                >
                  <Bug className="w-4 h-4" />
                  Debug
                </Button>
              </div>
            </div>

            <div className="flex-1 border border-border rounded-lg overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                  },
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  tabCompletion: "on",
                  wordBasedSuggestions: "matchingDocuments",
                }}
              />
            </div>

            {showPreview && (
              <Card className="mt-4 p-4 bg-secondary/50 border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Preview Output</h3>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                </div>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {previewOutput}
                </pre>
              </Card>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleExplain}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--glow-primary)]"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Explain Code
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Right Panel - AI Insights */}
          <Card className="p-4 bg-card border-border flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-secondary">
                <TabsTrigger value="explanation" className="gap-1 text-xs">
                  <Brain className="w-3 h-3" />
                  Explain
                </TabsTrigger>
                <TabsTrigger value="optimization" className="gap-1 text-xs">
                  <Zap className="w-3 h-3" />
                  Optimize
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-1 text-xs">
                  <Shield className="w-3 h-3" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="complexity" className="gap-1 text-xs">
                  <Activity className="w-3 h-3" />
                  Complexity
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden mt-4">
                <TabsContent value="explanation" className="h-full m-0">
                  <div className="h-full overflow-auto p-4 bg-secondary/50 rounded-lg border border-border">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Analyzing your code...</p>
                        </div>
                      </div>
                    ) : explanation ? (
                      <div className="space-y-6">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{explanation}</ReactMarkdown>
                        </div>
                        
                        {/* Convert to Lesson Card - Enhanced Visibility */}
                        <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/20">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                  🎓 Turn This Into a Learning Lesson!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Transform this code explanation into an interactive learning experience with curated YouTube videos, 
                                  concept breakdowns, interactive quizzes, and earn XP points for completing it!
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="gap-1">
                                  🎥 Video Resources
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                  ✅ Interactive Quizzes
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                  🏆 Earn XP
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                  📚 Progress Tracking
                                </Badge>
                              </div>
                              
                              <Button 
                                onClick={handleConvertToLesson}
                                disabled={convertingToLesson}
                                size="lg"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--glow-primary)]"
                              >
                                {convertingToLesson ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Creating Your Personal Lesson...
                                  </>
                                ) : (
                                  <>
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Create Interactive Lesson
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center">
                        <div className="space-y-2">
                          <Brain className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                          <p className="text-muted-foreground">
                            Write or paste code and click "Explain Code"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="optimization" className="h-full m-0">
                  <div className="h-full overflow-auto p-4 bg-secondary/50 rounded-lg border border-border">
                    {isLoading && activeTab === "optimization" ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Analyzing for optimizations...</p>
                        </div>
                      </div>
                    ) : optimization ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{optimization}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Zap className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Click below to get optimization suggestions
                        </p>
                        <Button onClick={handleOptimize} disabled={!code.trim()}>
                          <Zap className="mr-2 h-4 w-4" />
                          Optimize Code
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="security" className="h-full m-0">
                  <div className="h-full overflow-auto p-4 bg-secondary/50 rounded-lg border border-border">
                    {isLoading && activeTab === "security" ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Scanning for vulnerabilities...</p>
                        </div>
                      </div>
                    ) : securityReport ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{securityReport}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Shield className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Click below to scan for security issues
                        </p>
                        <Button onClick={handleSecurityScan} disabled={!code.trim()}>
                          <Shield className="mr-2 h-4 w-4" />
                          Security Scan
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="complexity" className="h-full m-0">
                  <div className="h-full overflow-auto p-4 bg-secondary/50 rounded-lg border border-border">
                    {isLoading && activeTab === "complexity" ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Analyzing complexity...</p>
                        </div>
                      </div>
                    ) : complexityAnalysis ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{complexityAnalysis}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <Activity className="w-12 h-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Click below to analyze code complexity
                        </p>
                        <Button onClick={handleComplexityAnalysis} disabled={!code.trim()}>
                          <Activity className="mr-2 h-4 w-4" />
                          Analyze Complexity
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Editor;
