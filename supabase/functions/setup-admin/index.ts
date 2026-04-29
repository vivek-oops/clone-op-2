// supabase/functions/setup-admin/index.ts
// Supabase Edge Function to securely create the initial admin account.
//
// This function:
// 1. Creates a new user via the Supabase Admin Auth API
// 2. Assigns the 'admin' role in the user_roles table
// 3. Is protected by a SETUP_SECRET to prevent unauthorized use
//
// Environment variables (auto-available in Supabase Edge Functions):
//   SUPABASE_URL           - Your project URL
//   SUPABASE_SERVICE_ROLE_KEY - Service role key (full DB access)
//
// You must set these secrets via:
//   npx supabase secrets set SETUP_SECRET=your_secret_here

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: Verify the setup secret ──────────────────────────────
    const setupSecret = Deno.env.get("SETUP_SECRET");
    if (!setupSecret) {
      return new Response(
        JSON.stringify({ error: "SETUP_SECRET not configured on server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, full_name, secret } = await req.json();

    if (!secret || secret !== setupSecret) {
      return new Response(
        JSON.stringify({ error: "Invalid setup secret. Unauthorized." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create Supabase Admin Client ───────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ── Step 1: Create the user ────────────────────────────────────
    let userId: string;

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm — no verification email needed
        user_metadata: { full_name: full_name || "Admin" },
      });

    if (createError) {
      // If user already exists, find them and continue
      if (createError.message?.includes("already been registered")) {
        const { data: listData, error: listError } =
          await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

        if (listError) {
          return new Response(
            JSON.stringify({ error: "User exists but couldn't be found: " + listError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const existing = listData.users.find((u) => u.email === email);
        if (!existing) {
          return new Response(
            JSON.stringify({ error: "User reportedly exists but was not found in user list." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = existing.id;
        console.log(`User already exists: ${userId}`);
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to create user: " + createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      userId = newUser.user.id;
      console.log(`User created: ${userId}`);
    }

    // ── Step 2: Check if admin role already assigned ───────────────
    const { data: existingRoles } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin");

    if (existingRoles && existingRoles.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin account already exists and has admin role.",
          user_id: userId,
          email,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 3: Assign admin role ──────────────────────────────────
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      return new Response(
        JSON.stringify({ error: "User created but failed to assign admin role: " + roleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin role assigned to user: ${userId}`);

    // ── Success ────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin account created successfully!",
        user_id: userId,
        email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error: " + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
