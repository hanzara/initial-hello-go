import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Home, Search, Star, CheckCircle2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Mentor {
  id: string;
  name: string;
  bio: string;
  specialization: string;
  languages_known: string[];
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  profile_image_url: string;
  verified: boolean;
}

const Marketplace = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchQuery, specializationFilter, mentors]);

  const fetchMentors = async () => {
    try {
      // Placeholder: mentors table doesn't exist yet
      // const { data, error } = await supabase
      //   .from('mentors')
      //   .select('*')
      //   .order('rating', { ascending: false });

      // if (error) throw error;
      setMentors([]);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error("Failed to load mentors");
    } finally {
      setIsLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    if (specializationFilter !== "all") {
      filtered = filtered.filter(m => m.specialization === specializationFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.languages_known.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMentors(filtered);
  };

  const getSpecializationColor = (spec: string) => {
    const colors: Record<string, string> = {
      'fullstack': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'ai_ml': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'cybersecurity': 'bg-red-500/10 text-red-400 border-red-500/30',
      'backend': 'bg-green-500/10 text-green-400 border-green-500/30',
      'frontend': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'mobile': 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      'devops': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    };
    return colors[spec] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search and Filters */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-secondary border-border">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="fullstack">Full-Stack</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="ai_ml">AI/ML</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading mentors...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
                <div className="space-y-4">
                  {/* Mentor Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={mentor.profile_image_url} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{mentor.name}</h3>
                        {mentor.verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-foreground">{mentor.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({mentor.total_sessions} sessions)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialization */}
                  <Badge className={getSpecializationColor(mentor.specialization) + " border"}>
                    {mentor.specialization.replace('_', ' ').toUpperCase()}
                  </Badge>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages_known.slice(0, 4).map((lang, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-lg font-bold text-primary">
                      ${mentor.hourly_rate}/hr
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => toast.success(`Contact request sent to ${mentor.name}`)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Hire Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredMentors.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No mentors found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
