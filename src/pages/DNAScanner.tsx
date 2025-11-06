import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dna, GitBranch, Play, Upload } from "lucide-react";
import { toast } from "sonner";
import { GenomeMetrics } from "@/components/GenomeMetrics";
import { GenomeSuggestions } from "@/components/GenomeSuggestions";
import { GenomeVisualization } from "@/components/GenomeVisualization";
import { GenomeTimeline } from "@/components/GenomeTimeline";
import { GenomeExport } from "@/components/GenomeExport";
import { GenomeDiff } from "@/components/GenomeDiff";
import { supabase } from "@/integrations/supabase/client";

export default function DNAScanner() {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [scanMode, setScanMode] = useState<"full" | "incremental" | "diff">("full");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);
  const [currentGenomeId, setCurrentGenomeId] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadGenomeHistory(selectedRepo);
    }
  }, [selectedRepo]);

  const loadRepositories = async () => {
    const { data, error } = await supabase
      .from("repositories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading repos:", error);
      return;
    }

    setRepositories(data || []);
    if (data && data.length > 0 && !selectedRepo) {
      setSelectedRepo(data[0].id);
    }
  };

  const loadGenomeHistory = async (repoId: string) => {
    const { data, error } = await supabase
      .from("genomes")
      .select("*")
      .eq("repository_id", repoId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading genome history:", error);
      return;
    }

    setScanHistory(data || []);
    if (data && data.length > 0) {
      setCurrentGenomeId(data[0].id);
      loadGenomeDetails(data[0].id);
    }
  };

  const loadGenomeDetails = async (genomeId: string) => {
    const [modulesRes, functionsRes, depsRes, packagesRes, healthRes, suggestionsRes] = await Promise.all([
      supabase.from("genome_modules").select("*").eq("genome_id", genomeId),
      supabase.from("genome_functions").select("*"),
      supabase.from("genome_dependencies").select("*").eq("genome_id", genomeId),
      supabase.from("genome_packages").select("*").eq("genome_id", genomeId),
      supabase.from("genome_health").select("*").eq("genome_id", genomeId).maybeSingle(),
      supabase.from("genome_suggestions").select("*").eq("repository_id", selectedRepo),
    ]);

    const genomeData = scanHistory.find(g => g.id === genomeId);
    
    setScanResults({
      genome: genomeData,
      modules: modulesRes.data || [],
      functions: functionsRes.data || [],
      dependencies: depsRes.data || [],
      packages: packagesRes.data || [],
      health: healthRes.data,
      suggestions: suggestionsRes.data || [],
    });
  };

  const handleStartUpload = () => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a repository URL");
      return;
    }

    startScan();
  };

  const startScan = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("genome-mapper", {
        body: { 
          repositoryId: selectedRepo,
          branch,
          mode: scanMode
        }
      });

      if (error) throw error;

      toast.success("Genome scan completed!");
      setScanResults(data);
      loadGenomeHistory(selectedRepo);
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan repository");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCompareScans = (scanId1: string, scanId2: string) => {
    // Generate mock diff for now - in production would compare actual genome data
    const mockDiff = {
      modules: {
        added: ['src/components/NewFeature.tsx', 'src/utils/helper.ts'],
        removed: ['src/legacy/OldComponent.tsx'],
        modified: ['src/App.tsx', 'src/main.tsx'],
      },
      functions: {
        added: 5,
        removed: 2,
        modified: 8,
      },
      complexity: {
        before: 12.5,
        after: 10.2,
        change: -2.3,
      },
      score: {
        before: 72,
        after: 78,
        change: 6,
      },
      vulnerabilities: {
        added: 0,
        fixed: 3,
      },
    };
    setSelectedComparison(mockDiff);
    toast.success("Comparison generated");
  };

  // Mock data for demonstration
  const mockModules = scanResults?.modules || [];
  const mockDependencies = scanResults?.dependencies || [];
  const mockSuggestions = scanResults?.suggestions || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SoftwareHealingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Dna className="h-10 w-10" />
                DNA Scanner
              </h1>
              <p className="text-muted-foreground">
                Deep code analysis and genome mapping for your repository
              </p>
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

            {/* Scanner Controls */}
            <Card className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Repository Scanner</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Repository URL
                    </label>
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Branch
                    </label>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="main"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Scan Mode
                    </label>
                    <Select value={scanMode} onValueChange={(v: any) => setScanMode(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Scan</SelectItem>
                        <SelectItem value="incremental">Incremental</SelectItem>
                        <SelectItem value="diff">Diff Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleStartUpload}
                  disabled={isScanning}
                  size="lg"
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isScanning ? "Scanning..." : "Start Genome Scan"}
                </Button>
              </div>
            </Card>

            {scanResults && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <GenomeMetrics
                    efficiencyScore={scanResults.genome?.efficiency_score || 0}
                    healthData={scanResults.health}
                    moduleCount={scanResults.modules?.length || 0}
                    functionCount={scanResults.functions?.length || 0}
                    dependencyCount={scanResults.dependencies?.length || 0}
                    packageCount={scanResults.packages?.length || 0}
                  />
                </TabsContent>

                <TabsContent value="visualization" className="space-y-4">
                  <GenomeVisualization
                    modules={mockModules}
                    dependencies={mockDependencies}
                    onModuleClick={(moduleId) => {
                      toast.info(`Selected module: ${moduleId}`);
                    }}
                  />
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  <GenomeSuggestions suggestions={mockSuggestions} />
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <GenomeTimeline 
                    scans={scanHistory}
                    onSelectScan={(scanId) => {
                      setCurrentGenomeId(scanId);
                      loadGenomeDetails(scanId);
                      toast.info("Loaded genome scan");
                    }}
                    onCompare={handleCompareScans}
                  />
                  {selectedComparison && (
                    <GenomeDiff diff={selectedComparison} />
                  )}
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                  <GenomeExport 
                    genomeData={{
                      genome_id: currentGenomeId || 'mock-id',
                      repository_name: repositories.find(r => r.id === selectedRepo)?.name || 'repository',
                      branch,
                      fingerprint: scanResults.genome?.fingerprint || 'genome:unknown',
                      efficiency_score: scanResults.genome?.efficiency_score || 0,
                      scan_date: scanResults.genome?.created_at || new Date().toISOString(),
                      modules: mockModules,
                      functions: scanResults.functions || [],
                      dependencies: mockDependencies,
                      packages: scanResults.packages || [],
                      health: scanResults.health || {},
                      suggestions: mockSuggestions,
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}

            {!scanResults && repositories.length === 0 && (
              <Card className="p-12 text-center">
                <Dna className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by uploading your first repository for genome analysis
                </p>
                <Button onClick={() => window.location.href = "/software-healing/upload"}>
                  Upload Repository
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}