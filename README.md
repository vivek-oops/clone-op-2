# oops!Pleasured 

oops!Pleasured MVP E-commerce Platform. 

## Deployment Architecture

The platform architecture is designed to be fully scalable and split across two major infrastructure areas:

### 1. The Frontend (Vercel)
The storefront applications are built with standard **Vite + React (TypeScript)**.
To deploy, push the source code into a GitHub repository and link the repository to a Vercel project with the Root Directory selected (or simply at the root). 

Vercel will build the frontend automatically. The app makes use of an SPA (Single Page Application) router, so it includes a `vercel.json` file to rewrite all paths (`/*`) to `/index.html`. This ensures direct links to `/shop` or `/product/...` work seamlessly.

### 2. The Backend (Supabase)
We use a hosted **PostgreSQL** Database on Supabase as the single-source-of-truth backend.

- **Storage**: Media buckets handle image uploads safely with integrated CDN caches.
- **Auth**: Fully handled by Supabase Auth (JWT). 
    * To distinguish an `admin`, there is a `.user_roles` secure table and an RPC logic wrapper.
- **Edge Functions**: The backend brain lives in `supabase/functions/`. Edge functions handle secure tasks like AI Blog Content generation safely preventing API keys from leaking to the frontend JS files.

*To learn how to manage the edge functions independently from Vercel via the Supabase CLI, see the `.agents/workflows/deploy-edge-functions.md` document.*
