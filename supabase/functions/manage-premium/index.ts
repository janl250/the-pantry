import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "jan.j.leonhardt@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { action, userId } = await req.json();

    if (action === "list-users") {
      // Get all profiles with subscription status
      const { data: profiles, error: profilesError } = await serviceClient
        .from("profiles")
        .select("id, display_name, created_at");

      if (profilesError) throw profilesError;

      // Get auth users for emails
      const { data: { users: authUsers }, error: usersError } = await serviceClient.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Get active subscriptions
      const { data: subs } = await serviceClient
        .from("subscriptions")
        .select("user_id, status, current_period_end");

      const enriched = profiles?.map((p) => {
        const authUser = authUsers.find((u) => u.id === p.id);
        const sub = subs?.find((s) => s.user_id === p.id && s.status === "active");
        return {
          id: p.id,
          email: authUser?.email || "unknown",
          display_name: p.display_name,
          created_at: p.created_at,
          is_premium: !!sub,
        };
      });

      return new Response(JSON.stringify({ users: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "grant-premium") {
      // Upsert subscription
      const { error } = await serviceClient.from("subscriptions").upsert(
        { user_id: userId, status: "active", current_period_end: null },
        { onConflict: "user_id" }
      );
      if (error) {
        // If upsert fails due to no unique constraint, try delete+insert
        await serviceClient.from("subscriptions").delete().eq("user_id", userId);
        const { error: insertError } = await serviceClient.from("subscriptions").insert({
          user_id: userId,
          status: "active",
          current_period_end: null,
        });
        if (insertError) throw insertError;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "revoke-premium") {
      await serviceClient.from("subscriptions").delete().eq("user_id", userId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
