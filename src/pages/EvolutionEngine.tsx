import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SoftwareHealingSidebar } from "@/components/SoftwareHealingSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Zap, Loader2, Plus, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CampaignModal, CampaignData } from "@/components/CampaignModal";
import { MutationPreview } from "@/components/MutationPreview";

interface Campaign {
  id: string;
  name: string;
  status: string;
  progress: number;
  goal_weights: any;
  max_variants: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface Mutation {
  id: string;
  campaign_id?: string;
  mutation_type: string;
  description: string;
  confidence_score: number;
  composite_score?: number;
  safety_score?: number;
  status: string;
  improvement_metrics: any;
  explain?: string;
  diff?: string;
  metrics_before?: any;
  metrics_after?: any;
  mutation_tests?: any[];
  created_at: string;
}

export default function EvolutionEngine() {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [isRunningCampaign, setIsRunningCampaign] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadCampaigns(selectedRepo);
      loadMutations(selectedRepo);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedCampaign) {
      loadMutations(selectedRepo!, selectedCampaign);
    }
  }, [selectedCampaign]);

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

  const loadCampaigns = async (repoId: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("repository_id", repoId)
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
    if (data && data.length > 0 && !selectedCampaign) {
      setSelectedCampaign(data[0].id);
    }
  };

  const loadMutations = async (repoId: string, campaignId?: string) => {
    let query = supabase
      .from("mutations")
      .select("*, mutation_tests(*)")
      .eq("repository_id", repoId);
    
    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }
    
    const { data } = await query.order("composite_score", { ascending: false, nullsFirst: false });

    setMutations(data || []);
  };

  const handleCreateCampaign = async (data: CampaignData) => {
    try {
      const { data: campaign, error } = await supabase.functions.invoke("create-campaign", {
        body: data
      });

      if (error) throw error;

      toast.success(`Campaign "${data.name}" created!`);
      loadCampaigns(data.repositoryId);
      
      // Auto-run the campaign
      if (campaign?.campaign?.id) {
        handleRunCampaign(campaign.campaign.id);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create campaign");
    }
  };

  const handleRunCampaign = async (campaignId: string) => {
    setIsRunningCampaign(true);
    try {
      const { error } = await supabase.functions.invoke("run-campaign", {
        body: { campaignId }
      });

      if (error) throw error;

      toast.success("Campaign completed! Check the results below.");
      loadCampaigns(selectedRepo!);
      loadMutations(selectedRepo!, campaignId);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to run campaign");
      // Reload to show failed status
      loadCampaigns(selectedRepo!);
    } finally {
      setIsRunningCampaign(false);
    }
  };

  const handleApproveMutation = async (mutationId: string) => {
    const { error } = await supabase
      .from("mutations")
      .update({ status: "applied", applied_at: new Date().toISOString(), applied_by: "user" })
      .eq("id", mutationId);

    if (error) {
      toast.error("Failed to approve mutation");
      return;
    }

    // Log to history
    await supabase.from("mutation_history").insert({
      mutation_id: mutationId,
      action: "applied",
      actor: "user",
      metadata: { applied_via: "ui" }
    });

    toast.success("Mutation approved and applied!");
    loadMutations(selectedRepo!, selectedCampaign || undefined);
  };


  const handleRejectMutation = async (mutationId: string) => {
    const { error } = await supabase
      .from("mutations")
      .update({ status: "rejected" })
      .eq("id", mutationId);

    if (error) {
      toast.error("Failed to reject mutation");
      return;
    }

    // Log to history
    await supabase.from("mutation_history").insert({
      mutation_id: mutationId,
      action: "rejected",
      actor: "user"
    });

    toast.success("Mutation rejected");
    loadMutations(selectedRepo!, selectedCampaign || undefined);
  };

  const handleRollbackMutation = async (mutationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("rollback-mutation", {
        body: { mutationId }
      });

      if (error) throw error;

      toast.success("Mutation rolled back successfully");
      loadMutations(selectedRepo!, selectedCampaign || undefined);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to rollback mutation");
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const pendingMutations = mutations.filter(m => m.status === "pending");
  const appliedMutations = mutations.filter(m => m.status === "applied" || m.status === "approved");
  const rejectedMutations = mutations.filter(m => m.status === "rejected");

  const activeCampaign = campaigns.find(c => c.id === selectedCampaign);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SoftwareHealingSidebar />
        <main className="flex-1 p-8 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">Evolution Engine</h1>
                <p className="text-muted-foreground text-lg">
                  AI-powered mutation campaigns with composite scoring
                </p>
              </div>
              <Button 
                onClick={() => setCampaignModalOpen(true)} 
                disabled={!selectedRepo}
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
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

            {/* Campaign Selector & Status */}
            {campaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {campaigns.map((campaign) => (
                      <Button
                        key={campaign.id}
                        variant={selectedCampaign === campaign.id ? "default" : "outline"}
                        onClick={() => setSelectedCampaign(campaign.id)}
                        className="whitespace-nowrap"
                      >
                        <Badge 
                          variant={getCampaignStatusColor(campaign.status)} 
                          className="mr-2"
                        >
                          {campaign.status}
                        </Badge>
                        {campaign.name}
                      </Button>
                    ))}
                  </div>

                  {/* Campaign Progress */}
                  {activeCampaign && activeCampaign.status === "running" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Campaign Progress</span>
                        <span className="font-medium">{activeCampaign.progress}%</span>
                      </div>
                      <Progress value={activeCampaign.progress} />
                    </div>
                  )}

                  {/* Campaign Stats */}
                  {activeCampaign && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Max Variants</p>
                        <p className="text-2xl font-bold">{activeCampaign.max_variants}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Generated</p>
                        <p className="text-2xl font-bold">{mutations.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Top Goals</p>
                        <p className="text-sm font-medium">
                          {Object.entries(activeCampaign.goal_weights || {})
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 2)
                            .map(([k]) => k)
                            .join(", ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">
                          {activeCampaign.completed_at && activeCampaign.started_at
                            ? `${Math.round((new Date(activeCampaign.completed_at).getTime() - new Date(activeCampaign.started_at).getTime()) / 1000 / 60)}m`
                            : activeCampaign.started_at
                            ? "Running..."
                            : "Not started"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Mutations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mutations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">{pendingMutations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Applied</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{appliedMutations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{rejectedMutations.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Mutations Leaderboard */}
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending">Pending Review ({pendingMutations.length})</TabsTrigger>
                <TabsTrigger value="applied">Applied ({appliedMutations.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedMutations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {isRunningCampaign && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-6 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">Running mutation campaign...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generating and evaluating variants
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {pendingMutations.map((mutation) => (
                  <MutationPreview
                    key={mutation.id}
                    mutation={mutation}
                    onApprove={() => handleApproveMutation(mutation.id)}
                    onReject={() => handleRejectMutation(mutation.id)}
                  />
                ))}

                {pendingMutations.length === 0 && !isRunningCampaign && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">No pending mutations</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start a new campaign to generate AI-powered code improvements
                      </p>
                      <Button onClick={() => setCampaignModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Campaign
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applied" className="space-y-4">
                {appliedMutations.map((mutation) => (
                  <MutationPreview
                    key={mutation.id}
                    mutation={mutation}
                    onApprove={() => {}}
                    onReject={() => {}}
                    onRollback={() => handleRollbackMutation(mutation.id)}
                  />
                ))}

                {appliedMutations.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No applied mutations yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                {rejectedMutations.map((mutation) => (
                  <MutationPreview
                    key={mutation.id}
                    mutation={mutation}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}

                {rejectedMutations.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No rejected mutations</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Campaign Modal */}
            <CampaignModal
              open={campaignModalOpen}
              onOpenChange={setCampaignModalOpen}
              repositories={repositories}
              selectedRepo={selectedRepo}
              onCreateCampaign={handleCreateCampaign}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
