# oops!Pleasured — Production Readiness Plan

> **Goal**: Take the existing MVP to a production-ready, full-stack e-commerce platform with proper backend edge functions, admin tooling, and deployment pipeline.

---

## Progress Tracking

| Phase | Items | Done | Status |
|-------|-------|------|--------|
| Phase 1 | 6 | 6 | ✅ Complete |
| Phase 2 | 6 | 6 | ✅ Complete |
| Phase 3 | 5 | 0 | ⬜ Not Started |
| Phase 4 | 8 | 0 | ⬜ Not Started |
| Phase 5 | 3 | 3 | ✅ Complete |
| **Total** | **28** | **15** | **53% Complete** |

---

### Phase 1: Critical Infrastructure & Deployment Fixes
> **Priority**: 🔴 CRITICAL — Things that are broken or will cause production failures

- [x] 1.1 Deploy `setup-admin` edge function
- [x] 1.2 Create admin account via edge function
- [x] 1.3 Create `vercel.json` with SPA rewrite rules
- [x] 1.4 Fix `index.html` SEO metadata
- [x] 1.5 Fix `robots.txt` — add `Sitemap: https://oopsipleasured.in/sitemap.xml`
- [x] 1.6 Create `public/sitemap.xml` with all public routes

---

### Phase 2: Edge Functions — Backend Brain
> **Priority**: 🟠 HIGH — Server-side logic that should NOT be in the client

- [x] 2.1 Create `generate-blog` edge function
- [x] 2.2 Update `blogApi.ts` — add `generateAIBlog()`
- [x] 2.3 Wire up AI generation UI in admin Blog tab
- [x] 2.4 Set Supabase secrets for the edge function API keys (Pending user to run commands if not done yet)
- [x] 2.5 Deploy `generate-blog` edge function
- [x] 2.6 Create deployment workflow documentation for edge functions

---

### Phase 3: Missing Utilities & Components
> **Priority**: 🟡 MEDIUM — Features referenced in blueprint but not yet built

- [ ] 3.1 Create `src/lib/imageUtils.ts` — client-side image compression
- [ ] 3.2 Install `react-quill-new` for rich text editing
- [ ] 3.3 Add `LatestBlog` component to homepage
- [ ] 3.4 Integrate image compression into admin upload flows
- [ ] 3.5 Add `generateAIBlog` integration to admin BlogTab

---

### Phase 4: Production Hardening
> **Priority**: 🟢 IMPORTANT — Polish for a production-grade experience

- [ ] 4.1 Add error boundary component
- [ ] 4.2 Add friendly error handler utility
- [ ] 4.3 Add loading skeletons for data-fetching pages
- [ ] 4.4 Configure Supabase query retry & stale time in QueryClient
- [ ] 4.5 Add manual document.title updates per page (for SEO)
- [ ] 4.6 Security audit: ensure no service_role key is exposed
- [ ] 4.7 Add CORS origin restriction for edge functions
- [ ] 4.8 Create `.env.example` file

---

### Phase 5: Edge Function Deployment & CI/CD Documentation
> **Priority**: 🟢 IMPORTANT — So you never have to remember deployment steps

- [x] 5.1 Create `.agents/workflows/deploy-edge-functions.md`
- [x] 5.2 Create `.agents/workflows/create-admin.md`
- [x] 5.3 Document full deployment architecture in README.md
