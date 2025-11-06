import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Github, GitBranch, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function UploadApp() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [provider, setProvider] = useState("github");
  const [branch, setBranch] = useState("main");
  const [isUploading, setIsUploading] = useState(false);

  const handleConnect = async () => {
    if (!repoUrl || !repoName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to connect a repository");
        return;
      }

      // Insert repository
      const { data: repo, error } = await supabase
        .from("repositories")
        .insert({
          user_id: user.id,
          name: repoName,
          url: repoUrl,
          provider: provider,
          default_branch: branch,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Repository connected! Starting DNA analysis...");
      
      // Trigger genome mapping
      const { error: genomeError } = await supabase.functions.invoke("genome-mapper", {
        body: { repositoryId: repo.id, branch: branch }
      });

      if (genomeError) {
        console.error("Genome mapping error:", genomeError);
        toast.warning("Repository connected, but genome mapping failed. Try scanning manually.");
      } else {
        toast.success("Digital genome mapping completed successfully!");
      }

      navigate("/software-healing/scanner");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to connect repository");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SoftwareHealingSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Connect Your Repository</h1>
              <p className="text-muted-foreground text-lg">
                Upload your app to begin DNA analysis and evolution
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repository Details
                </CardTitle>
                <CardDescription>
                  Connect your GitHub, GitLab, or other repository
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Repository URL</label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Repository Name</label>
                  <Input
                    placeholder="my-awesome-app"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider</label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="gitlab">GitLab</SelectItem>
                        <SelectItem value="bitbucket">Bitbucket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Default Branch
                    </label>
                    <Input
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleConnect} 
                  disabled={isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting & Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Connect Repository
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Digital Genome Mapping Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Code Analysis & AST Parsing</p>
                    <p className="text-sm text-muted-foreground">
                      Extract functions, modules, and dependencies using advanced parsing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Fingerprinting & Genome Construction</p>
                    <p className="text-sm text-muted-foreground">
                      Generate unique fingerprints for every function and build dependency graph
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Security & Quality Scanning</p>
                    <p className="text-sm text-muted-foreground">
                      Detect vulnerabilities, compute complexity metrics, and assess health
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">AI Suggestions & Industry Comparison</p>
                    <p className="text-sm text-muted-foreground">
                      ML-powered recommendations based on industry best practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <p className="font-medium">Evolution Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Digital genome ready for mutation experiments and optimization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">GitHub OAuth Setup Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  For full repository analysis, you'll need to create a GitHub App with read-only access:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Go to GitHub Settings → Developer Settings → GitHub Apps</li>
                  <li>Create a new GitHub App with <code className="bg-secondary px-1 rounded">repository read</code> permissions</li>
                  <li>Configure OAuth callback URL to this app's domain</li>
                  <li>Save the Client ID and Client Secret securely</li>
                </ol>
                <p className="text-muted-foreground">
                  Current implementation uses repository URL input as a starting point.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
