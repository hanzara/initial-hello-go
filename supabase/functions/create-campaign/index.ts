import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      repositoryId,
      name,
      targetModule,
      goalWeights,
      scope,
      mode,
      testSuite,
      maxVariants,
      computeBudget
    } = await req.json();

    if (!repositoryId || !name) {
      return new Response(
        JSON.stringify({ error: "Repository ID and campaign name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create campaign
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .insert({
        repository_id: repositoryId,
        name,
        target_module: targetModule,
        goal_weights: goalWeights || { speed: 40, cost: 20, memory: 15, security: 15, maintainability: 10 },
        scope: scope || 'function',
        mode: mode || 'guided',
        test_suite: testSuite,
        max_variants: maxVariants || 20,
        compute_budget: computeBudget || 100,
        status: 'pending'
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    console.log("Created campaign:", campaign.id);

    return new Response(
      JSON.stringify({ success: true, campaign }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-campaign:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
