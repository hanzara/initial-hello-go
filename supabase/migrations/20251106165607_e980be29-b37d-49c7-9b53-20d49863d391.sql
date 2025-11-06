-- Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Fix search_path for update function (drop trigger first)
DROP TRIGGER IF EXISTS update_genomes_updated_at ON genomes;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_genomes_updated_at
  BEFORE UPDATE ON genomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();