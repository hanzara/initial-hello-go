-- Create repositories table
CREATE TABLE IF NOT EXISTS public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  github_url TEXT,
  description TEXT,
  language TEXT,
  framework TEXT,
  size_kb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create genome_analyses table
CREATE TABLE IF NOT EXISTS public.genome_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  efficiency_score DECIMAL,
  security_issues JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  complexity_score DECIMAL,
  genome_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_module TEXT,
  goal_weights JSONB DEFAULT '{"speed": 40, "cost": 20, "memory": 15, "security": 15, "maintainability": 10}'::jsonb,
  scope TEXT DEFAULT 'function' CHECK (scope IN ('function', 'module', 'config')),
  mode TEXT DEFAULT 'guided' CHECK (mode IN ('guided', 'auto')),
  test_suite TEXT,
  max_variants INTEGER DEFAULT 20,
  compute_budget INTEGER DEFAULT 100,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress DECIMAL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mutations table (if not exists, with all new fields)
CREATE TABLE IF NOT EXISTS public.mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  mutation_type TEXT NOT NULL,
  original_code TEXT,
  mutated_code TEXT,
  description TEXT,
  confidence_score DECIMAL,
  improvement_metrics JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'approved', 'rejected', 'applied')),
  composite_score DECIMAL,
  safety_score DECIMAL DEFAULT 98,
  parent_mutations UUID[],
  explain TEXT,
  metrics_before JSONB,
  metrics_after JSONB,
  diff TEXT,
  applied_at TIMESTAMPTZ,
  applied_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mutation_tests table
CREATE TABLE IF NOT EXISTS public.mutation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID NOT NULL REFERENCES public.mutations(id) ON DELETE CASCADE,
  test_results JSONB,
  cpu_usage DECIMAL,
  memory_usage DECIMAL,
  latency_ms DECIMAL,
  pass_rate DECIMAL,
  cost_per_request DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mutation history table
CREATE TABLE IF NOT EXISTS public.mutation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID NOT NULL REFERENCES public.mutations(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'applied', 'rolled_back')),
  actor TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mutation lineage table
CREATE TABLE IF NOT EXISTS public.mutation_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.mutations(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.mutations(id) ON DELETE CASCADE,
  crossover_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Enable RLS
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genome_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutation_lineage ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now)
CREATE POLICY "Allow all on repositories" ON public.repositories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on genome_analyses" ON public.genome_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mutations" ON public.mutations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mutation_tests" ON public.mutation_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mutation_history" ON public.mutation_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mutation_lineage" ON public.mutation_lineage FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_repositories_created ON public.repositories(created_at);
CREATE INDEX IF NOT EXISTS idx_genome_analyses_repo ON public.genome_analyses(repository_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_repository ON public.campaigns(repository_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mutations_repository ON public.mutations(repository_id);
CREATE INDEX IF NOT EXISTS idx_mutations_campaign ON public.mutations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mutations_status ON public.mutations(status);
CREATE INDEX IF NOT EXISTS idx_mutation_tests_mutation ON public.mutation_tests(mutation_id);
CREATE INDEX IF NOT EXISTS idx_mutation_history_mutation ON public.mutation_history(mutation_id);
CREATE INDEX IF NOT EXISTS idx_mutation_lineage_parent ON public.mutation_lineage(parent_id);
CREATE INDEX IF NOT EXISTS idx_mutation_lineage_child ON public.mutation_lineage(child_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER repositories_updated_at BEFORE UPDATE ON public.repositories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();