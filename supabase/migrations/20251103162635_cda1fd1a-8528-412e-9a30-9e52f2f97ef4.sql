-- Create enum for mentor specializations
CREATE TYPE public.mentor_specialization AS ENUM (
  'backend',
  'frontend',
  'fullstack',
  'ai_ml',
  'data_science',
  'cybersecurity',
  'mobile',
  'devops'
);

-- Create enum for help request status
CREATE TYPE public.help_request_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create enum for team member roles
CREATE TYPE public.team_role AS ENUM (
  'admin',
  'editor',
  'viewer'
);

-- Mentors table
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  specialization mentor_specialization NOT NULL,
  languages_known TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  profile_image_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Help requests table
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code_snippet TEXT,
  language TEXT,
  specialization mentor_specialization,
  status help_request_status DEFAULT 'open',
  assigned_mentor_id UUID REFERENCES public.mentors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentor sessions table
CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  total_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentor reviews table
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mentor_sessions(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role team_role DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Debug sessions table
CREATE TABLE public.debug_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  issues_found JSONB,
  fixes_applied JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentors (public read, mentors can update own profile)
CREATE POLICY "Anyone can view mentors"
  ON public.mentors FOR SELECT
  USING (true);

CREATE POLICY "Mentors can update own profile"
  ON public.mentors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mentor profiles"
  ON public.mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for help_requests
CREATE POLICY "Users can view own help requests"
  ON public.help_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view assigned requests"
  ON public.help_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors
      WHERE mentors.id = help_requests.assigned_mentor_id
      AND mentors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create help requests"
  ON public.help_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own help requests"
  ON public.help_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view own sessions"
  ON public.mentor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view their sessions"
  ON public.mentor_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors
      WHERE mentors.id = mentor_sessions.mentor_id
      AND mentors.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can create sessions"
  ON public.mentor_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentors
      WHERE mentors.id = mentor_id
      AND mentors.user_id = auth.uid()
    )
  );

-- RLS Policies for mentor_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.mentor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their sessions"
  ON public.mentor_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- RLS Policies for team_members
CREATE POLICY "Team members can view team membership"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- RLS Policies for projects
CREATE POLICY "Team members can view team projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors and admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Team editors and admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = projects.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('admin', 'editor')
    )
  );

-- RLS Policies for debug_sessions
CREATE POLICY "Users can view own debug sessions"
  ON public.debug_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create debug sessions"
  ON public.debug_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_mentors_updated_at
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample mentors
INSERT INTO public.mentors (name, bio, specialization, languages_known, hourly_rate, rating, total_sessions, verified, profile_image_url) VALUES
  ('Sarah Chen', 'Full-stack developer with 8+ years experience in React, Node.js, and AWS. Passionate about teaching clean code principles.', 'fullstack', ARRAY['JavaScript', 'TypeScript', 'Python'], 85.00, 4.9, 127, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('Marcus Johnson', 'AI/ML engineer specializing in LLMs and computer vision. Former Google researcher, now helping developers build intelligent systems.', 'ai_ml', ARRAY['Python', 'TensorFlow', 'PyTorch'], 120.00, 4.95, 89, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'),
  ('Elena Rodriguez', 'Cybersecurity expert with CISSP certification. 10+ years securing enterprise applications and teaching security best practices.', 'cybersecurity', ARRAY['Python', 'Go', 'JavaScript'], 95.00, 4.85, 156, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'),
  ('David Kim', 'Backend architect specializing in microservices, databases, and scalable systems. Love optimizing performance at scale.', 'backend', ARRAY['Go', 'Java', 'PostgreSQL', 'Redis'], 90.00, 4.8, 203, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
  ('Aisha Patel', 'Mobile development expert for iOS and Android. Published 20+ apps with millions of downloads. React Native specialist.', 'mobile', ARRAY['Swift', 'Kotlin', 'React Native'], 80.00, 4.88, 145, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha'),
  ('Thomas Berg', 'DevOps engineer passionate about CI/CD, Kubernetes, and infrastructure as code. Making deployments painless.', 'devops', ARRAY['Python', 'Bash', 'YAML', 'Terraform'], 100.00, 4.92, 98, true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas');
