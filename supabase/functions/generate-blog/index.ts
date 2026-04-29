// supabase/functions/generate-blog/index.ts
// AI Blog Generation Edge Function using Gemini or OpenRouter

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

interface GenerateBlogRequest {
  provider: "gemini" | "openrouter";
  title: string;
  prompt?: string;
}

serve(async (req) => {
  // ── Handle CORS Preflight ─────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Verify Authorization (Admin only) ─────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized access: " + authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: isAdmin, error: rpcError } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (rpcError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access only." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse Request Body ────────────────────────────────────────
    const { provider, title, prompt } = (await req.json()) as GenerateBlogRequest;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Construct System Prompt ───────────────────────────────────
    const basePrompt = `You are a professional blog writer for 'oops!Pleasured', a premium adult wellness and pleasure e-commerce platform.
Your tone should be sex-positive, educational, inclusive, engaging, and professional. 
Write a comprehensive SEO-friendly blog post (800-1000 words) about: "${title}".

Requirements:
- Structure the content with clear H2 and H3 headings.
- Format the output in clean, plain HTML (not markdown). Do not include <html> or <body> tags, just the inner HTML content.
- Include 2-3 relevant placeholder images seamlessly mixed within the content using the Pollinations AI image service. 
  Example format for adding an image: <img src="https://image.pollinations.ai/prompt/aesthetic_modern_bedroom_soft_lighting_high_quality" alt="Placeholder description" class="w-full rounded-xl my-6 object-cover" />
  Make sure the prompts are safe, aesthetic, and relevant to wellness, self-care, or romantic intimacy (avoid purely explicit prompts as they may be blocked).
- DO NOT wrap the output in markdown code blocks (\`\`\`html). Output strictly the raw HTML.

${prompt ? `Additional instructions from the user: ${prompt}` : ""}`;

    let content = "";

    // ── Generate Content via Selected Provider ────────────────────
    if (provider === "gemini") {
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      if (!geminiKey) {
        throw new Error("GEMINI_API_KEY secret is not configured.");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: basePrompt }] }],
            generationConfig: { temperature: 0.7 },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Gemini API Error: ${JSON.stringify(data)}`);
      }
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (provider === "openrouter") {
      const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
      if (!openRouterKey) {
        throw new Error("OPENROUTER_API_KEY secret is not configured.");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://oopsipleasured.in", // Optional, for OpenRouter tracking
          "X-Title": "oops!Pleasured App", // Optional
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet:beta",
          messages: [{ role: "user", content: basePrompt }],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${JSON.stringify(data)}`);
      }
      content = data.choices?.[0]?.message?.content || "";
    } else {
      throw new Error(`Invalid provider selected: ${provider}`);
    }

    // Clean up potential markdown formatting if the AI still included it
    content = content.replace(/^```html\n?|```$/gm, "").trim();

    // ── Post-processing: Generate Excerpt & Featured Image ────────
    // Strip HTML tags for the excerpt
    const plainText = content.replace(/<[^>]+>/g, "");
    const excerpt = plainText.substring(0, 150).trim() + "...";

    // Extract the first image to use as the featured image
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const featured_image = imgMatch ? imgMatch[1] : `https://image.pollinations.ai/prompt/abstract_elegant_wellness_gradient_${encodeURIComponent(title.substring(0,20))}`;

    return new Response(
      JSON.stringify({
        success: true,
        content,
        excerpt,
        featured_image,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Error generating blog:", err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
