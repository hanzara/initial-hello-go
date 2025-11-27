-- Create add_funds_transactions table
CREATE TABLE IF NOT EXISTS public.add_funds_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_reference TEXT,
  provider_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('mpesa', 'card', 'bank_transfer', 'paypal', 'stripe')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE public.add_funds_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own add funds transactions"
  ON public.add_funds_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can create their own add funds transactions"
  ON public.add_funds_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_add_funds_user_created ON public.add_funds_transactions(user_id, created_at DESC);
CREATE INDEX idx_add_funds_status ON public.add_funds_transactions(status);

-- Create user wallets table if not exists
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Enable RLS on wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY "Users can view their own wallet"
  ON public.user_wallets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own wallet
CREATE POLICY "Users can update their own wallet"
  ON public.user_wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.user_wallets
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update wallet when transaction completes
CREATE TRIGGER on_add_funds_completed
  AFTER UPDATE ON public.add_funds_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();