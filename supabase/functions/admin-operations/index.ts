import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw new Error("Unauthorized");

  // Check admin role
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.claims.sub)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) throw new Error("Forbidden: Admin access required");

  return { userId: data.claims.sub, supabaseAdmin };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, supabaseAdmin } = await verifyAdmin(req);
    const { action, payload } = await req.json();

    let result;

    switch (action) {
      case "update_order_status": {
        const { order_id, status } = payload;
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update({ order_status: status })
          .eq("id", order_id)
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "get_dashboard_stats": {
        const [ordersRes, productsRes, reviewsRes, usersRes] = await Promise.all([
          supabaseAdmin.from("orders").select("id, total_amount, order_status, created_at"),
          supabaseAdmin.from("products").select("id, visible"),
          supabaseAdmin.from("product_reviews").select("id, status"),
          supabaseAdmin.from("profiles").select("id"),
        ]);

        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
        const pendingOrders = orders.filter((o) => o.order_status === "pending").length;

        result = {
          total_orders: orders.length,
          total_revenue: totalRevenue,
          pending_orders: pendingOrders,
          total_products: (productsRes.data || []).length,
          pending_reviews: (reviewsRes.data || []).filter((r) => r.status === "pending").length,
          total_users: (usersRes.data || []).length,
        };
        break;
      }

      case "moderate_review": {
        const { review_id, status: reviewStatus, is_featured } = payload;
        const updates: Record<string, string | boolean> = {};
        if (reviewStatus !== undefined) updates.status = reviewStatus;
        if (is_featured !== undefined) updates.is_featured = is_featured;

        const { data, error } = await supabaseAdmin
          .from("product_reviews")
          .update(updates)
          .eq("id", review_id)
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status = msg === "Unauthorized" ? 401 : msg.startsWith("Forbidden") ? 403 : 500;
    return new Response(
      JSON.stringify({ error: msg }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
