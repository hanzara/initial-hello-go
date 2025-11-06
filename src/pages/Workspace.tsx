import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users2, Home, Plus, FolderOpen, UserPlus, MessageSquare, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const Workspace = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchProjects(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to access workspace");
        return;
      }

      // Placeholder: teams table doesn't exist yet
      // const { data, error } = await supabase
      //   .from('teams')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      setTeams([]);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async (teamId: string) => {
    try {
      // Placeholder: projects table doesn't exist yet
      // const { data, error } = await supabase
      //   .from('projects')
      //   .select('*')
      //   .eq('team_id', teamId)
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      setProjects([]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Failed to load projects");
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a team");
        return;
      }

      // Placeholder: teams table doesn't exist yet
      toast.info("Team creation feature coming soon!");
      // const { data, error } = await supabase
      //   .from('teams')
      //   .insert([{
      //     name: newTeamName,
      //     description: newTeamDesc,
      //     created_by: user.id
      //   }])
      //   .select()
      //   .single();

      // if (error) throw error;

      // Add creator as admin
      // await supabase.from('team_members').insert([{
      //   team_id: data.id,
      //   user_id: user.id,
      //   role: 'admin'
      // }]);

      // toast.success("Team created successfully!");
      setNewTeamName("");
      setNewTeamDesc("");
      // fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error("Failed to create team");
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim() || !selectedTeam) {
      toast.error("Please enter a project name and select a team");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a project");
        return;
      }

      // Placeholder: projects table doesn't exist yet
      toast.info("Project creation feature coming soon!");
      // const { error } = await supabase
      //   .from('projects')
      //   .insert([{
      //     team_id: selectedTeam,
      //     name: newProjectName,
      //     description: newProjectDesc,
      //     created_by: user.id
      //   }]);

      // if (error) throw error;

      // toast.success("Project created successfully!");
      setNewProjectName("");
      setNewProjectDesc("");
      // fetchProjects(selectedTeam);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams Sidebar */}
          <Card className="p-6 bg-card border-border h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Teams</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Team Name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="bg-secondary"
                    />
                    <Textarea
                      placeholder="Team Description (optional)"
                      value={newTeamDesc}
                      onChange={(e) => setNewTeamDesc(e.target.value)}
                      className="bg-secondary"
                    />
                    <Button onClick={createTeam} className="w-full">Create Team</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTeam === team.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-secondary border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTeam(team.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-primary/20">
                      <AvatarFallback>{team.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{team.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{team.description || 'No description'}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {teams.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No teams yet. Create one to get started!
                </p>
              )}
            </div>
          </Card>

          {/* Projects Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toolbar */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={!selectedTeam}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Project Name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="bg-secondary"
                      />
                      <Textarea
                        placeholder="Project Description (optional)"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="bg-secondary"
                      />
                      <Button onClick={createProject} className="w-full">Create Project</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" disabled={!selectedTeam}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
                <Button size="sm" variant="outline" disabled={!selectedTeam}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Team Chat
                </Button>
              </div>
            </Card>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderOpen className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">{project.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary/10">
                        <Rocket className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTeam && projects.length === 0 && (
              <Card className="p-12 bg-card border-border">
                <div className="text-center">
                  <FolderOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first project to start collaborating</p>
                </div>
              </Card>
            )}

            {!selectedTeam && (
              <Card className="p-12 bg-card border-border">
                <div className="text-center">
                  <Users2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select a Team</h3>
                  <p className="text-muted-foreground">Choose a team from the sidebar to view projects</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
