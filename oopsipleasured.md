# oops!Pleasured — Complete Project Blueprint (A to Z)

> **Purpose**: This document is a comprehensive, prompt-ready blueprint to recreate the entire `oops!Pleasured` e-commerce platform from scratch. It covers architecture, database schema, RLS policies, authentication, every page, every component, API layer, design system, edge functions, storage, and deployment. Use this as a context file for AI builders (Lovable, Antigravity, Bolt, etc.) to reproduce the full experience.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Design System & Theming](#3-design-system--theming)
4. [Supabase Backend Setup](#4-supabase-backend-setup)
   - 4.1 [Database Tables](#41-database-tables)
   - 4.2 [Enums](#42-enums)
   - 4.3 [Row-Level Security Policies](#43-row-level-security-policies)
   - 4.4 [Database Functions](#44-database-functions)
   - 4.5 [Database Triggers](#45-database-triggers)
   - 4.6 [Storage Buckets](#46-storage-buckets)
   - 4.7 [Auth Configuration](#47-auth-configuration)
   - 4.8 [Realtime](#48-realtime)
5. [Environment Variables & Secrets](#5-environment-variables--secrets)
6. [Application Architecture](#6-application-architecture)
   - 6.1 [Routing](#61-routing)
   - 6.2 [State Management](#62-state-management)
   - 6.3 [API Layer](#63-api-layer)
7. [Pages — Detailed Specification](#7-pages--detailed-specification)
   - 7.1 [Homepage (Index)](#71-homepage-index)
   - 7.2 [Product Detail Page](#72-product-detail-page)
   - 7.3 [Cart Page](#73-cart-page)
   - 7.4 [Checkout Page](#74-checkout-page)
   - 7.5 [Auth Page (Login/Signup)](#75-auth-page-loginsignup)
   - 7.6 [User Dashboard](#76-user-dashboard)
   - 7.7 [Wishlist Page](#77-wishlist-page)
   - 7.8 [Blog Listing](#78-blog-listing)
   - 7.9 [Blog Article](#79-blog-article)
   - 7.10 [Admin Login](#710-admin-login)
   - 7.11 [Admin Panel](#711-admin-panel)
   - 7.12 [404 Not Found](#712-404-not-found)
8. [Components — Detailed Specification](#8-components--detailed-specification)
   - 8.1 [Landing Components](#81-landing-components)
   - 8.2 [Review Components](#82-review-components)
   - 8.3 [Admin Components](#83-admin-components)
9. [Edge Functions](#9-edge-functions)
10. [Utilities & Helpers](#10-utilities--helpers)
11. [SEO & Meta Configuration](#11-seo--meta-configuration)
12. [Deployment & Hosting](#12-deployment--hosting)
13. [Known Issues & Fixes](#13-known-issues--fixes)
14. [Admin Seed Data](#14-admin-seed-data)

---

## 1. Project Overview

**oops!Pleasured** is a premium adult wellness e-commerce platform built as a Single Page Application. It features:

- **Customer-facing storefront**: Product listings with category filtering, search, sorting, cart, checkout (UPI + COD), wishlist, user accounts, blog
- **Admin Panel**: Full CRUD for products, categories, banners, blog posts, reviews, orders, and settings
- **Privacy-first**: Discreet packaging messaging, private billing ("OPS Retail"), unmarked labels
- **Dark theme**: Navy/cyan aesthetic with glassmorphism effects
- **Mobile-first**: Fully responsive, optimized for 360px+ viewports
- **AI-powered blog generation**: Edge function using Google Gemini for auto-generating SEO blog posts
- **Indian market**: INR currency, Indian states for address, 10-digit phone validation, 6-digit pincode

**Brand Name**: oops!Pleasured  
**Logo**: Circular cyan gradient with letter "O"  
**Domain**: oopsipleasured.in  
**Billing appears as**: "OPS Retail"

---

## 2. Technology Stack & Dependencies

### Core Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5 (with SWC plugin)
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **Routing**: React Router DOM v6 (client-side SPA)
- **Server State**: @tanstack/react-query v5
- **Client State**: React Context (Cart, Auth)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Animations**: Framer Motion
- **Rich Text Editor**: react-quill-new
- **Icons**: lucide-react

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.97.0",
  "@tanstack/react-query": "^5.83.0",
  "framer-motion": "^12.34.3",
  "react-quill-new": "^3.8.3",
  "react-router-dom": "^6.30.1",
  "sonner": "^1.7.4",
  "embla-carousel-react": "^8.6.0",
  "embla-carousel-autoplay": "^8.6.0",
  "zod": "^3.25.76",
  "react-hook-form": "^7.61.1",
  "recharts": "^2.15.4",
  "date-fns": "^3.6.0"
}
```

### Dev Dependencies
```json
{
  "@tailwindcss/typography": "^0.5.16",
  "vitest": "^3.2.4",
  "@testing-library/react": "^16.0.0"
}
```

### Fonts (loaded via Google Fonts in CSS)
- **Display**: Cormorant Garamond (headings — serif, elegant)
- **Body**: Inter (body text — clean sans-serif)
- **Mono**: Space Mono (prices, badges, dates)

---

## 3. Design System & Theming

### Color Palette (HSL values in CSS variables)

The app uses a **dark navy + cyan/teal** theme. All colors are defined as HSL values in `index.css` `:root` and referenced via Tailwind's semantic token system.

```css
:root {
  --background: 216 50% 7%;          /* Deep navy */
  --foreground: 195 50% 94%;         /* Light cyan-white */
  --card: 215 45% 13%;               /* Navy card */
  --card-foreground: 195 50% 94%;
  --primary: 190 100% 42%;           /* Bright cyan */
  --primary-foreground: 216 50% 7%;  /* Dark on cyan */
  --secondary: 215 35% 18%;          /* Slightly lighter navy */
  --secondary-foreground: 195 50% 94%;
  --muted: 215 30% 16%;
  --muted-foreground: 195 20% 60%;   /* Subdued text */
  --accent: 185 100% 40%;            /* Teal accent */
  --destructive: 0 72% 51%;          /* Red */
  --border: 215 30% 20%;             /* Subtle borders */
  --ring: 190 100% 42%;
  --radius: 0.75rem;
  
  /* Custom tokens */
  --cyan: 190 100% 42%;
  --cyan-glow: 190 100% 50%;
  --teal: 185 100% 40%;
  --navy-deep: 216 50% 7%;
  --navy-dark: 214 60% 6%;
  --navy-card: 215 45% 13%;
}
```

### Custom Utility Classes (defined in `index.css @layer utilities`)
- `.glass` — Glassmorphism: `bg-card/80 backdrop-blur-xl border border-border/50`
- `.glow-cyan` — Large cyan glow box-shadow
- `.glow-cyan-sm` — Small cyan glow
- `.gradient-cyan` — `linear-gradient(135deg, cyan, teal)` background
- `.gradient-cyan-text` — Gradient text effect (background-clip: text)
- `.radial-glow` — Radial gradient spotlight effect

### Tailwind Config Extensions
- Custom font families: `font-display`, `font-body`, `font-mono`
- Custom animations: `fade-in`, `slide-in`, `glow-pulse`, `float`, `slide-up`, `marquee`
- Custom colors: `cyan`, `teal`, `navy` variants

### UI Component Library
Uses **shadcn/ui** with all standard components installed. Key customizations:
- Buttons use `gradient-cyan` class for primary CTAs
- Cards use dark navy backgrounds
- All inputs use `bg-secondary border-border`

---

## 4. Supabase Backend Setup

### 4.1 Database Tables

#### `products`
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  other_details TEXT,                    -- Rich text (HTML) for specifications
  images TEXT[] DEFAULT '{}'::TEXT[],    -- Array of image URLs
  video TEXT,                            -- Single video URL
  category_id UUID REFERENCES public.categories(id),
  availability TEXT NOT NULL DEFAULT 'available',  -- 'available' | 'out_of_stock'
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `categories`
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `banners`
```sql
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `orders`
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                         -- Nullable: guests can order
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',     -- 'cod' | 'upi'
  order_status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'confirmed' | 'payment_received' | 'shipped' | 'delivered' | 'cancelled'
  total_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `order_items`
```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `product_reviews`
```sql
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  user_id UUID,                         -- Nullable: anonymous reviews allowed
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,              -- 1-5 stars
  review_text TEXT,
  quality_rating INTEGER DEFAULT 5,     -- 0-10 scale
  performance_rating INTEGER DEFAULT 5,
  value_rating INTEGER DEFAULT 5,
  design_rating INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `blog_posts`
```sql
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,                          -- Rich HTML content
  featured_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'scheduled'
  published_at TIMESTAMPTZ,
  linked_product_ids UUID[] DEFAULT '{}'::UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- References auth.users(id) but no FK constraint
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `addresses`
```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `wishlists`
```sql
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `admin_settings`
```sql
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username TEXT DEFAULT '',
  currency_symbol TEXT DEFAULT '$',
  upi_qr_image TEXT,
  shipping_cost NUMERIC DEFAULT 99,
  free_shipping_threshold NUMERIC DEFAULT 999,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Pre-seed with one row:
INSERT INTO public.admin_settings (telegram_username, currency_symbol, shipping_cost, free_shipping_threshold) 
VALUES ('', '₹', 99, 999);
```

#### `user_roles`
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- References auth.users(id) but no FK constraint
  role app_role NOT NULL DEFAULT 'user'
);
```

### 4.2 Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 4.3 Row-Level Security Policies

**CRITICAL**: RLS must be enabled on ALL tables. Below are the exact policies:

#### products
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible products (or admin sees all)
CREATE POLICY "Public can read visible products" ON public.products FOR SELECT TO public USING (visible = true OR is_admin());
-- Admin CRUD
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (is_admin());
```

#### categories
```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (is_admin());
```

#### banners
```sql
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible banners" ON public.banners FOR SELECT TO public USING (visible = true OR is_admin());
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE TO authenticated USING (is_admin());
```

#### orders
```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT TO public USING (is_admin());
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO public USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO public USING (is_admin());
```

#### order_items
```sql
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read order items" ON public.order_items FOR SELECT TO public USING (is_admin());
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO public USING (is_admin());
```

#### product_reviews
```sql
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
-- CRITICAL: Allow both anon and authenticated users to insert
CREATE POLICY "Anyone can submit reviews" ON public.product_reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can read approved reviews" ON public.product_reviews FOR SELECT TO public USING (status = 'approved' OR is_admin());
CREATE POLICY "Admins can update reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete reviews" ON public.product_reviews FOR DELETE TO authenticated USING (is_admin());

-- IMPORTANT: Grant explicit permissions
GRANT SELECT, INSERT ON public.product_reviews TO anon, authenticated;
GRANT ALL ON public.product_reviews TO service_role;
```

#### blog_posts
```sql
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT TO public USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "Admins can read all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (is_admin());
```

#### profiles
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

#### addresses
```sql
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own addresses" ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

#### wishlists
```sql
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own wishlist" ON public.wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

#### admin_settings
```sql
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.admin_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can read settings" ON public.admin_settings FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated USING (is_admin());
```

#### user_roles
```sql
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read user_roles" ON public.user_roles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
```

### 4.4 Database Functions

```sql
-- Check if user has a specific role (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Shorthand to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 4.5 Database Triggers

```sql
-- Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps on products, orders, profiles, blog_posts, product_reviews, admin_settings
-- (Apply to each table that has an updated_at column)
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
-- ... (repeat for profiles, blog_posts, product_reviews, admin_settings)
```

### 4.6 Storage Buckets

```sql
-- Create a public storage bucket named "media"
-- Used for: product images, product videos, banner images, blog featured images, UPI QR codes
-- Structure:
--   media/products/{timestamp}-{filename}       — Product images
--   media/products/videos/{timestamp}-{filename} — Product videos (max 20MB)
--   media/banners/{timestamp}-{filename}         — Banner images
--   media/blog/{timestamp}-{filename}            — Blog featured images
--   media/settings/upi-qr-{timestamp}-{filename} — UPI QR code
```

The bucket `media` is **public** (no auth required to read).

### 4.7 Auth Configuration

- Email + password authentication enabled
- Auto-confirm email signups: Depends on project preference (currently user may need to verify)
- Session persistence: localStorage
- Auto-refresh tokens: enabled

### 4.8 Realtime

```sql
-- Enable realtime for banners table (used for live banner updates on homepage)
ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
```

---

## 5. Environment Variables & Secrets

### Frontend Environment Variables (`.env` — auto-generated, never edit manually)
```
VITE_SUPABASE_PROJECT_ID="<project_id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon_key>"
VITE_SUPABASE_URL="https://<project_id>.supabase.co"
```

### Edge Function Secrets (stored in Supabase Secrets)
- `LOVABLE_API_KEY` — For Lovable AI Gateway access
- `SUPABASE_URL` — Auto-provided
- `SUPABASE_PUBLISHABLE_KEY` — Auto-provided
- `SUPABASE_SERVICE_ROLE_KEY` — Auto-provided
- `SUPABASE_DB_URL` — Auto-provided

### API Keys used in Edge Functions
- Google Gemini API (for blog generation)
- OpenRouter API (alternative blog generation via Claude)
- These can be hardcoded in the edge function or stored as secrets

---

## 6. Application Architecture

### 6.1 Routing

All routes are client-side SPA routes handled by React Router:

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `Index` | Public | Homepage with hero, products, categories |
| `/product/:id` | `ProductDetail` | Public | Single product page with reviews |
| `/blog` | `BlogListing` | Public | All published blog posts |
| `/blog/:slug` | `BlogArticle` | Public | Single blog article |
| `/auth` | `Auth` | Public | Login/signup tabs |
| `/cart` | `Cart` | Public | Shopping cart |
| `/checkout` | `Checkout` | Public | Multi-step checkout (details → payment → success) |
| `/wishlist` | `Wishlist` | Public | Wishlist (localStorage for guests, DB for users) |
| `/dashboard` | `Dashboard` | Authenticated | User account (orders, wishlist, addresses, settings) |
| `/admin/login` | `AdminLogin` | Public | Admin login form |
| `/admin` | `AdminPanel` | Admin only | Full admin dashboard |
| `*` | `NotFound` | Public | 404 page |

**Important**: For Vercel/static hosting, add rewrite rule `/* → /index.html` (via `vercel.json` or `_redirects`).

### 6.2 State Management

#### Context Providers (wrap entire app in `App.tsx`)
1. **`QueryClientProvider`** — @tanstack/react-query for server state
2. **`AuthProvider`** — Auth state (user, session, isAdmin, signIn, signOut)
3. **`CartProvider`** — Cart state persisted to localStorage

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Uses `supabase.auth.getSession()` + `onAuthStateChange` listener
- Checks admin status via `supabase.rpc("has_role", { _user_id, _role: "admin" })`
- Caches admin status in a ref to avoid repeated RPC calls
- 5-second safety timeout to prevent infinite loading
- Exports: `session`, `user`, `isAdmin`, `loading`, `signIn`, `signOut`

#### CartContext (`src/contexts/CartContext.tsx`)
- Items stored in localStorage under key `"cart_items"`
- Each item: `{ product: Product, quantity: number }`
- Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`
- Computed: `itemCount`, `subtotal`

### 6.3 API Layer

All Supabase interactions are centralized in dedicated API files:

#### `src/lib/api.ts` — Products, Categories, Banners, Settings, Image Upload
- `fetchProducts(visibleOnly)` — with category join
- `fetchProduct(id)` — single product with category
- `createProduct`, `updateProduct`, `deleteProduct`
- `fetchCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- `fetchBanners(visibleOnly)`, `createBanner`, `updateBanner`, `deleteBanner`
- `fetchSettings`, `updateSettings`
- `uploadImage(file, path)` — uploads to "media" bucket, returns public URL

#### `src/lib/reviewApi.ts` — Product Reviews
- `fetchApprovedReviews(productId)` — filtered by status='approved', ordered by is_featured desc
- `fetchAllReviews()` — for admin (all statuses)
- `submitReview(review)` — inserts with status='pending'
- `updateReview(id, updates)` — admin use
- `deleteReview(id)` — admin use

#### `src/lib/blogApi.ts` — Blog Posts
- `fetchBlogPosts(publishedOnly)` — with date filtering
- `fetchBlogPost(slug)` — single post by slug
- `fetchBlogPostById(id)`
- `createBlogPost`, `updateBlogPost`, `deleteBlogPost`
- `generateSlug(title)` — URL-friendly slug generator
- `generateAIBlog(provider, title, prompt)` — calls edge function

#### `src/lib/imageUtils.ts` — Image Compression
- `compressImage(file, maxWidth=800, maxHeight=800, quality=0.7)`
- Skips files under 200KB
- Maintains aspect ratio
- Outputs JPEG/PNG/WebP based on input format

---

## 7. Pages — Detailed Specification

### 7.1 Homepage (Index)

**Layout stack**:
1. `AnnouncementBar` — Top strip with privacy/shipping trust messages
2. `Navbar` — Sticky navigation with logo, nav links, icons (search, wishlist, cart, user), Shop Now CTA
3. Search overlay (conditionally shown, full-width)
4. `HeroBanner` — Full-width carousel (70vh) with banners from DB, fallback to default
5. `TrustBadges` — 4-column grid: Discreet Packaging, Private Delivery, Secure Payment, Body Safe Materials
6. `CategoryDiscovery` — Horizontal scroll on mobile, grid on desktop. Each category is a clickable card
7. **Products Section** — Search input, category filter, sort dropdown, responsive grid (2-col mobile, 3-col lg, 4-col xl)
8. `PromoBanner` — Gradient cyan banner with countdown timer (fake 24h timer), "50% OFF" messaging
9. `LatestBlog` — Latest 3 published blog posts
10. `Testimonials` — 3 hardcoded customer testimonials
11. `BrandStory` — Brand values: Pleasure, Privacy, Quality
12. `Footer` — 4-column: brand info, quick links, support links, newsletter signup

**Data Fetching**: Products, categories, banners, settings (all via react-query)
**Realtime**: Subscribes to banner changes via Supabase realtime

### 7.2 Product Detail Page

**URL**: `/product/:id`

**Features**:
- Image gallery with zoom modal
- Thumbnail strip for multiple images
- Video player (if product has video)
- Category label, product name, description, price
- Trust badges (Discreet packaging, Secure checkout, Premium materials, Fast delivery)
- Add to Cart button (or Pre-order via Telegram if out of stock)
- Buy via Telegram button (opens t.me link with pre-filled message)
- Add to Wishlist button
- Tabs: Description, Specifications (rich HTML), Shipping info
- `ReviewsSection` — Review form + approved reviews display
- `RelatedProducts` — Products from same category
- `ImageZoomModal` — Full-screen image viewer

### 7.3 Cart Page

**Features**:
- List of cart items with image, name, category, price, quantity controls (+/-)
- Remove item button
- Order summary sidebar: subtotal, shipping (free above threshold), total
- "Proceed to Checkout" and "Continue Shopping" buttons
- Empty cart state with icon and CTA
- Shipping cost and free threshold from `admin_settings`

### 7.4 Checkout Page

**3-step flow**: Details → Payment → Success

**Step 1 — Details**:
- Order summary (items, shipping, total)
- Customer info: Full Name*, Phone* (10-digit), Email
- Address: House/Flat*, Street*, Landmark, City*, State* (dropdown of Indian states), Pincode* (6-digit)
- Notes textarea
- Payment method: UPI or Cash on Delivery (radio buttons styled as cards)
- Validation before proceeding

**Step 2 — Payment (UPI only)**:
- Shows UPI QR code image from admin_settings
- Amount display
- "I've Paid — Place Order" button
- Back button

**Step 3 — Success**:
- Green checkmark animation
- Order ID (first 8 chars)
- Thank you message
- "Continue Shopping" button

**Order creation**: Inserts into `orders` table, then `order_items` table. Clears cart on success.

### 7.5 Auth Page (Login/Signup)

**Features**:
- Tabs: Login / Sign Up
- Login: email, password → `supabase.auth.signInWithPassword`
- Signup: full name, email, password → `supabase.auth.signUp` with `data: { full_name }`
- Redirects to `/dashboard` on success
- Redirects away if already logged in

### 7.6 User Dashboard

**Protected route** — redirects to `/auth` if not logged in

**Tabs**:
1. **Orders** — List of user's orders with status badges, items, totals
2. **Wishlist** — Grid of wishlisted products using `ProductCard`
3. **Addresses** — List of saved addresses, add new address form (label, address, city, state, pincode)
4. **Settings** — Email (read-only), full name, phone. Saves to `profiles` table.

**Logout button** in header

### 7.7 Wishlist Page

- Shows wishlisted products in grid
- Uses `useWishlist` hook (localStorage for guests, DB for authenticated users)
- Empty state with heart icon
- Optimistic updates with rollback on error

### 7.8 Blog Listing

- Grid of published blog posts (3-col)
- Each card: featured image, date, title, excerpt, "Read More" link
- Framer Motion staggered animations

### 7.9 Blog Article

- Full article with rich HTML content (rendered with `dangerouslySetInnerHTML`)
- Featured image
- Author name, publish date
- Social sharing buttons (Facebook, Twitter, WhatsApp, Copy Link)
- Linked/featured products section
- Related articles section
- Prose styling with `@tailwindcss/typography`

### 7.10 Admin Login

- Simple email/password form
- Uses `supabase.auth.signInWithPassword`
- After login, checks admin role via `has_role` RPC
- If admin confirmed → redirect to `/admin` (uses `window.location.href` for hard reload)
- Shows error if user is not admin

### 7.11 Admin Panel

**Protected** — requires `isAdmin` to be true. Redirects to `/admin/login` otherwise.

**7 tabs**:

#### Orders Tab (`src/components/admin/OrdersTab.tsx`)
- List all orders with status badges, payment method badges
- Filter by status dropdown
- Change order status via inline dropdown (pending → confirmed → payment_received → shipped → delivered → cancelled)
- View order details in modal (customer info, address, items, totals)

#### Products Tab
- Table: checkbox, image thumbnail, name, category, price, visible toggle, availability toggle
- Select all / bulk select checkboxes
- Bulk update availability dropdown (Mark Available / Mark Out of Stock)
- Add Product button → modal form
- Edit/Delete actions per row

**Product Form Dialog**:
- Name, Description (textarea), Price (₹ prefix), Category (dropdown), Availability, Visible toggle
- Other Details (Rich text via ReactQuill)
- Image upload (multi-file, with compression, drag-and-drop)
- Video upload (single file, max 20MB, MP4/MOV/WebM)
- Image preview with remove button

#### Categories Tab
- Table with name and edit/delete actions
- Inline add category (text input + Add button)
- Inline edit (converts to input on click)

#### Banners Tab
- Card list with image preview, title, subtitle, display order, visibility
- Toggle visibility
- Add/Edit banner dialog: image upload, title, subtitle, CTA text/link, display order, visible toggle

#### Blog Tab (`src/components/admin/BlogTab.tsx`)
- Table: title with image, status badge, publish date, author, edit/delete
- AI generation panel: provider selector (Gemini/OpenRouter), custom prompt, generate button
- Blog post form dialog: title, slug (auto-generated), excerpt, content (ReactQuill), featured image, author, status, publish date, linked products (multi-select checkboxes)

#### Reviews Tab (`src/components/admin/ReviewsTab.tsx`)
- Table: product name, reviewer, star rating, status badge, featured toggle, actions
- Filter by status (all/pending/approved/rejected)
- Quick approve/reject buttons for pending reviews
- Edit review dialog: name, rating, text, status, verified purchase toggle
- "Add Sample" button: generates random review for random product (for testing/demo)

#### Settings Tab
- Telegram username (for Buy Now links)
- Currency symbol
- UPI QR code image upload
- Save button

### 7.12 404 Not Found

Simple centered page with "Not Found" message and link back to home.

---

## 8. Components — Detailed Specification

### 8.1 Landing Components

#### `AnnouncementBar`
- Horizontal bar at very top
- 3 items: Lock icon "100% Discreet Packaging", Package icon "Private Billing", Truck icon "Free Shipping Above ₹999"
- `bg-secondary`, `z-50`

#### `Navbar`
- `sticky top-0 z-40`
- Logo (cyan gradient circle with "O" + brand name)
- Desktop nav links: Home, Shop (#products), Categories (#categories), Blog (/blog), About (#brand)
- Hash links scroll to section, route links navigate. If on different page, navigate to / then scroll.
- Right icons: Search, Wishlist, Cart (with count badge), User (navigates to /dashboard or /auth)
- "Shop Now" button (desktop only)
- Mobile hamburger menu
- Scrolled state: more opaque background, border, shadow, tighter padding

#### `HeroBanner`
- Full-width 70vh section
- Animated carousel with crossfade (Framer Motion AnimatePresence)
- Gradient overlay (left to right, dark to transparent)
- Title, subtitle, CTA button
- Prev/next arrows, dot indicators
- Fallback content if no banners in DB

#### `ProductCard`
- Card with hover effects (scale image, show add-to-cart overlay)
- Image with lazy loading
- Wishlist heart icon (shows on hover, always visible if wishlisted)
- Stock badge (Available/Pre-order)
- Category label, product name, description (hidden on mobile), price
- Slide-up "Add to Cart" button on hover
- Click navigates to product detail

#### `ImageZoomModal`
- Full-screen overlay
- Large image display
- Navigation between images
- Close button

#### `RelatedProducts`
- Horizontal scrollable product cards
- Same category products

### 8.2 Review Components

#### `ReviewForm`
- Name input, 5-star rating (interactive stars with hover), feedback textarea
- 4 attribute sliders (Quality, Performance, Value, Design) — 0-10 scale
- Submit button
- Checks for logged-in user to attach user_id (optional)
- Shows success toast, mentions pending approval

#### `ReviewCard`
- Reviewer name, date, star rating
- "Verified Purchase" badge
- Review text
- Optional: attribute rating bars (quality, performance, value, design as progress bars)

#### `ReviewsSection`
- Combines ReviewForm + list of ReviewCards
- Shows featured reviews first (or top 2)
- Expandable "View All Feedback" button for remaining reviews
- Animated expand/collapse

### 8.3 Admin Components

(See Section 7.11 for detailed admin tab specifications)

---

## 9. Edge Functions

### `generate-blog` (`supabase/functions/generate-blog/index.ts`)

**Purpose**: AI-powered blog content generation

**Input** (POST body):
```json
{
  "provider": "gemini" | "openrouter",
  "title": "string",
  "prompt": "string (optional custom prompt)"
}
```

**Output**:
```json
{
  "content": "markdown string (800-1000 words with inline Pollinations images)",
  "excerpt": "first 150 chars of plain text",
  "featured_image": "URL from Pollinations or extracted from content"
}
```

**Behavior**:
- System prompt instructs AI to write sex-positive, educational, SEO-friendly blog posts
- Includes 2-3 inline images via Pollinations AI (`https://image.pollinations.ai/prompt/...`)
- Gemini provider: calls `generativelanguage.googleapis.com`
- OpenRouter provider: calls `openrouter.ai` with Claude model
- CORS headers for cross-origin access

---

## 10. Utilities & Helpers

### Image Compression (`src/lib/imageUtils.ts`)
- `compressImage(file, maxWidth, maxHeight, quality)`
- Uses Canvas API for client-side compression
- Maintains aspect ratio
- Converts to appropriate format (JPEG/PNG/WebP)
- Skips small files (<200KB) and already-small images

### Wishlist Hook (`src/hooks/useWishlist.ts`)
- Guest mode: localStorage (`guest_wishlist` key)
- Authenticated mode: Supabase `wishlists` table
- `isWishlisted(productId)`, `toggleWishlist(productId)`
- Optimistic updates with rollback

### Auth Hook (`src/hooks/useAuth.ts`)
- Re-exports from AuthContext

### Error Handling Pattern
```typescript
function friendlyError(e: any): string {
  const msg = e?.message || "Something went wrong";
  if (msg.includes("violates foreign key")) return "This item is linked to other data...";
  if (msg.includes("violates unique")) return "A record with this name already exists.";
  if (msg.includes("permission denied") || msg.includes("new row violates")) return "You don't have permission...";
  if (msg.includes("network") || msg.includes("Failed to fetch")) return "Network error...";
  if (msg.includes("JWT")) return "Your session has expired...";
  return msg;
}
```

---

## 11. SEO & Meta Configuration

### `index.html`
```html
<title>oops!Pleasured — Premium Adult Wellness Products</title>
<meta name="description" content="Shop premium adult wellness products with 100% discreet packaging and private billing. Free shipping above ₹999." />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### `public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://oopsipleasured.in/sitemap.xml
```

### `public/sitemap.xml`
Include all public routes: `/`, `/blog`, `/auth`, `/cart`, `/wishlist`

### `public/_redirects` (Netlify) / `vercel.json` (Vercel)
```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 12. Deployment & Hosting

### Frontend
- **Platform**: Vercel or any static hosting
- **Build**: `vite build` → outputs to `dist/`
- **SPA rewrite**: All routes → `/index.html`

### Backend
- **Platform**: Supabase (managed PostgreSQL, Auth, Storage, Edge Functions)
- **Edge Functions**: Auto-deployed from `supabase/functions/` directory

---

## 13. Known Issues & Fixes

### Fix: Review Submission RLS Error
**Problem**: Anonymous users get "new row violates row-level security policy" when submitting reviews.
**Solution**: 
1. Policy must be `TO public WITH CHECK (true)` (not just `TO authenticated`)
2. Must also `GRANT SELECT, INSERT ON public.product_reviews TO anon, authenticated`

### Fix: Vercel 404 on Direct Navigation
**Problem**: Direct URL access to `/admin/login` returns 404.
**Solution**: Add `vercel.json` with rewrite rule `/(.*) → /index.html`

### Fix: Navbar Overlapping Announcement Bar
**Problem**: Fixed navbar overlaps the announcement bar content.
**Solution**: Use `sticky top-0` instead of `fixed` for the navbar header.

---

## 14. Admin Seed Data

To set up the first admin user:
1. Create a user account via the Auth page or Supabase dashboard
2. Insert admin role:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-uuid-from-auth.users>', 'admin');
```
3. Insert initial admin_settings row:
```sql
INSERT INTO public.admin_settings (telegram_username, currency_symbol, shipping_cost, free_shipping_threshold)
VALUES ('', '₹', 99, 999);
```

---

## Summary Checklist for Recreation

- [ ] Set up Supabase project with all 11 tables
- [ ] Create enum `app_role`
- [ ] Apply all RLS policies (with GRANT for product_reviews)
- [ ] Create all 4 database functions
- [ ] Create trigger for auto-profile creation on signup
- [ ] Create `media` storage bucket (public)
- [ ] Enable realtime on `banners` table
- [ ] Set up frontend with React + Vite + Tailwind + shadcn/ui
- [ ] Implement dark navy/cyan design system in `index.css`
- [ ] Configure Tailwind with custom fonts, colors, animations
- [ ] Build all 12 pages
- [ ] Build all landing components (9 components)
- [ ] Build review system (3 components)
- [ ] Build admin panel with 7 tabs
- [ ] Implement cart with localStorage persistence
- [ ] Implement wishlist (dual mode: localStorage + DB)
- [ ] Implement auth with admin role checking
- [ ] Deploy edge function for AI blog generation
- [ ] Configure deployment with SPA rewrites
- [ ] Seed admin user and settings
- [ ] Test review submission (anon + authenticated)
- [ ] Test order placement (guest + authenticated)
- [ ] Test admin panel CRUD operations


