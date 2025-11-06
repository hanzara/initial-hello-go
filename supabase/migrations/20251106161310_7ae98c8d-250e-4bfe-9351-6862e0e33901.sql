-- Create repositories table if not exists
CREATE TABLE IF NOT EXISTS public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create genomes table
CREATE TABLE IF NOT EXISTS public.genomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  version TEXT,
  total_modules INT DEFAULT 0,
  total_functions INT DEFAULT 0,
  total_dependencies INT DEFAULT 0,
  complexity_score FLOAT,
  health_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_modules table
CREATE TABLE IF NOT EXISTS public.genome_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT,
  lines_of_code INT DEFAULT 0,
  complexity INT DEFAULT 0,
  dependencies_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_functions table
CREATE TABLE IF NOT EXISTS public.genome_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.genome_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  complexity INT DEFAULT 0,
  lines_of_code INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_dependencies table
CREATE TABLE IF NOT EXISTS public.genome_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_packages table
CREATE TABLE IF NOT EXISTS public.genome_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  size_kb INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_health table
CREATE TABLE IF NOT EXISTS public.genome_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  score FLOAT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create genome_suggestions table
CREATE TABLE IF NOT EXISTS public.genome_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES public.genomes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  category TEXT,
  impact_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaigns table if not exists
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INT DEFAULT 0,
  goal_weights JSONB,
  max_variants INT DEFAULT 10,
  mode TEXT DEFAULT 'exploration',
  compute_budget FLOAT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mutations table if not exists
CREATE TABLE IF NOT EXISTS public.mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  mutation_type TEXT NOT NULL,
  description TEXT,
  confidence_score FLOAT,
  composite_score FLOAT,
  safety_score FLOAT,
  status TEXT DEFAULT 'pending',
  original_code TEXT,
  mutated_code TEXT,
  improvement_metrics JSONB,
  explain TEXT,
  diff TEXT,
  metrics_before JSONB,
  metrics_after JSONB,
  applied_at TIMESTAMPTZ,
  applied_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mutation_tests table if not exists
CREATE TABLE IF NOT EXISTS public.mutation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID REFERENCES public.mutations(id) ON DELETE CASCADE,
  test_results JSONB,
  cpu_usage FLOAT,
  memory_usage FLOAT,
  latency_ms FLOAT,
  pass_rate FLOAT,
  cost_per_request FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create mutation_history table if not exists
CREATE TABLE IF NOT EXISTS public.mutation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID REFERENCES public.mutations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  difficulty TEXT,
  category TEXT,
  xp_points INT DEFAULT 0,
  duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lesson_comments table
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  quiz_score INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (adjust as needed)
CREATE POLICY "Allow public read repositories" ON public.repositories FOR SELECT USING (true);
CREATE POLICY "Allow public read genomes" ON public.genomes FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_modules" ON public.genome_modules FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_functions" ON public.genome_functions FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_dependencies" ON public.genome_dependencies FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_packages" ON public.genome_packages FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_health" ON public.genome_health FOR SELECT USING (true);
CREATE POLICY "Allow public read genome_suggestions" ON public.genome_suggestions FOR SELECT USING (true);
CREATE POLICY "Allow public read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public read mutations" ON public.mutations FOR SELECT USING (true);
CREATE POLICY "Allow public read mutation_tests" ON public.mutation_tests FOR SELECT USING (true);
CREATE POLICY "Allow public read mutation_history" ON public.mutation_history FOR SELECT USING (true);
CREATE POLICY "Allow public read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read lesson_comments" ON public.lesson_comments FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can read their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Allow public insert for demo purposes (adjust for production)
CREATE POLICY "Allow public insert repositories" ON public.repositories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert genomes" ON public.genomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert mutations" ON public.mutations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert mutation_tests" ON public.mutation_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert mutation_history" ON public.mutation_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert lesson_comments" ON public.lesson_comments FOR INSERT WITH CHECK (true);

-- Allow public updates for demo purposes (adjust for production)
CREATE POLICY "Allow public update repositories" ON public.repositories FOR UPDATE USING (true);
CREATE POLICY "Allow public update campaigns" ON public.campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow public update mutations" ON public.mutations FOR UPDATE USING (true);