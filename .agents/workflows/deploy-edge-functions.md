---
description: Deploying Edge Functions to Supabase
---

# Deploying Edge Functions

This workflow describes the process for deploying edge functions to the production Supabase backend. It requires having the Supabase CLI installed and an access token from Supabase.

### 1. Set the Access Token

If you are running the command from a terminal, you need to set the `SUPABASE_ACCESS_TOKEN` environment variable, or configure it globally via `npx supabase login`.

### 2. Configure API Secrets 

For functions that rely on external APIs (like `generate-blog`), you must upload secrets to Supabase. This only needs to be done once per secret.

```powershell
# Set Gemini API Key
npx supabase secrets set GEMINI_API_KEY=your-api-key-here

# Set OpenRouter (Claude) API Key 
npx supabase secrets set OPENROUTER_API_KEY=your-api-key-here

# Set the secure setup secret for admin scripts
npx supabase secrets set SETUP_SECRET=oops_admin_setup_2026
```

### 3. Deploy the Functions

Once the project is linked and your access token is configured, deploy the functions:

```powershell
# Deploy the setup-admin function
npx supabase functions deploy setup-admin --no-verify-jwt

# Deploy the AI generating blog function
npx supabase functions deploy generate-blog --no-verify-jwt
```

> **Note:** The `--no-verify-jwt` flag is important here. Our functions handle authorization internally (e.g., validating an admin role via the Supabase Javascript Client).
