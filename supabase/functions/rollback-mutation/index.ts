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
    const { mutationId } = await req.json();

    if (!mutationId) {
      return new Response(
        JSON.stringify({ error: "Mutation ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get mutation details
    const { data: mutation, error: mutationError } = await supabaseClient
      .from("mutations")
      .select("*")
      .eq("id", mutationId)
      .single();

    if (mutationError) throw mutationError;

    if (mutation.status !== "applied") {
      return new Response(
        JSON.stringify({ error: "Can only rollback applied mutations" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update mutation status
    await supabaseClient
      .from("mutations")
      .update({ 
        status: "rejected",
        applied_at: null,
        applied_by: null
      })
      .eq("id", mutationId);

    // Log rollback in history
    await supabaseClient
      .from("mutation_history")
      .insert({
        mutation_id: mutationId,
        action: "rolled_back",
        actor: "user",
        metadata: { 
          original_status: mutation.status,
          rollback_reason: "manual_rollback" 
        }
      });

    console.log("Rolled back mutation:", mutationId);

    return new Response(
      JSON.stringify({ success: true, message: "Mutation rolled back successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in rollback-mutation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
