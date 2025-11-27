import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction_id, phone_number, amount } = await req.json();

    console.log('M-Pesa STK Push initiated:', { transaction_id, phone_number, amount });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // TODO: Integrate with M-Pesa Daraja API
    // This is a placeholder for the actual M-Pesa integration
    // You'll need to:
    // 1. Get M-Pesa access token
    // 2. Send STK push request to M-Pesa API
    // 3. Handle M-Pesa callback
    // 4. Update transaction status

    // For now, we'll simulate a successful request
    const mpesaRequestId = `MPX${Date.now()}`;

    // Update transaction with M-Pesa reference
    const { error: updateError } = await supabase
      .from('add_funds_transactions')
      .update({
        status: 'processing',
        provider_reference: mpesaRequestId,
        metadata: {
          phone_number,
          mpesa_request_id: mpesaRequestId,
          initiated_at: new Date().toISOString()
        }
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'STK push sent successfully',
        mpesa_request_id: mpesaRequestId,
        transaction_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process M-Pesa payment',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});