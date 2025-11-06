-- Create app_role enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'developer', 'viewer');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'developer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Genomes table (stores repository/project genomes)
CREATE TABLE genomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  repository_url TEXT,
  status TEXT DEFAULT 'pending',
  genome_data JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE genomes ENABLE ROW LEVEL SECURITY;

-- Genome suggestions table
CREATE TABLE genome_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES genomes(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.0,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  template_patch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE genome_suggestions ENABLE ROW LEVEL SECURITY;

-- Campaigns table (for testing campaigns)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genome_id UUID REFERENCES genomes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_metric TEXT NOT NULL,
  configuration JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Campaign runs table
CREATE TABLE campaign_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running',
  results JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE campaign_runs ENABLE ROW LEVEL SECURITY;

-- Mutations table (stores code mutations)
CREATE TABLE mutations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  genome_id UUID REFERENCES genomes(id) ON DELETE CASCADE,
  mutation_type TEXT NOT NULL,
  description TEXT,
  original_code TEXT,
  mutated_code TEXT,
  diff TEXT,
  explain TEXT,
  confidence_score DECIMAL(5,2) DEFAULT 0.0,
  composite_score DECIMAL(5,2) DEFAULT 0.0,
  safety_score DECIMAL(5,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending',
  metrics_before JSONB,
  metrics_after JSONB,
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mutations ENABLE ROW LEVEL SECURITY;

-- Mutation tests table
CREATE TABLE mutation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID REFERENCES mutations(id) ON DELETE CASCADE,
  test_results JSONB,
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(8,2),
  latency_ms DECIMAL(8,2),
  pass_rate DECIMAL(5,2),
  cost_per_request DECIMAL(8,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mutation_tests ENABLE ROW LEVEL SECURITY;

-- Mutation history table
CREATE TABLE mutation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mutation_id UUID REFERENCES mutations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mutation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own genomes"
  ON genomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own genomes"
  ON genomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genomes"
  ON genomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genomes"
  ON genomes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view suggestions for their genomes"
  ON genome_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = genome_suggestions.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert suggestions for their genomes"
  ON genome_suggestions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = genome_suggestions.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update suggestions for their genomes"
  ON genome_suggestions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = genome_suggestions.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view campaigns for their genomes"
  ON campaigns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = campaigns.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert campaigns for their genomes"
  ON campaigns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = campaigns.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view campaign runs for their campaigns"
  ON campaign_runs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM campaigns 
    JOIN genomes ON genomes.id = campaigns.genome_id 
    WHERE campaigns.id = campaign_runs.campaign_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view mutations for their genomes"
  ON mutations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = mutations.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert mutations for their genomes"
  ON mutations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = mutations.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update mutations for their genomes"
  ON mutations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM genomes WHERE genomes.id = mutations.genome_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view mutation tests for their mutations"
  ON mutation_tests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM mutations 
    JOIN genomes ON genomes.id = mutations.genome_id 
    WHERE mutations.id = mutation_tests.mutation_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view mutation history for their mutations"
  ON mutation_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM mutations 
    JOIN genomes ON genomes.id = mutations.genome_id 
    WHERE mutations.id = mutation_history.mutation_id AND genomes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert mutation history"
  ON mutation_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM mutations 
    JOIN genomes ON genomes.id = mutations.genome_id 
    WHERE mutations.id = mutation_history.mutation_id AND genomes.user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genomes_updated_at
  BEFORE UPDATE ON genomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();