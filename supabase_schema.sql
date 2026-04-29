-- oops!Pleasured Supabase Database Setup Script
-- Paste this entire script into your Supabase SQL Editor and run it.

--------------------------------------------------------------------------------
-- 1. ENUMS
--------------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

--------------------------------------------------------------------------------
-- 2. TABLES
--------------------------------------------------------------------------------

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
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

-- Banners
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

-- Orders
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

-- Order Items
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

-- Product Reviews
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

-- Blog Posts
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

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- References auth.users(id) but no FK constraint
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Addresses
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

-- Wishlists
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Settings
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

-- Pre-seed Admin Settings with one row:
INSERT INTO public.admin_settings (telegram_username, currency_symbol, shipping_cost, free_shipping_threshold) 
VALUES ('', '₹', 99, 999);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                -- References auth.users(id) but no FK constraint
  role app_role NOT NULL DEFAULT 'user'
);

--------------------------------------------------------------------------------
-- 3. FUNCTIONS
--------------------------------------------------------------------------------

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

--------------------------------------------------------------------------------
-- 4. TRIGGERS
--------------------------------------------------------------------------------

-- Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible products" ON public.products FOR SELECT TO public USING (visible = true OR is_admin());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (is_admin());

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (is_admin());

-- Banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible banners" ON public.banners FOR SELECT TO public USING (visible = true OR is_admin());
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE TO authenticated USING (is_admin());

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT TO public USING (is_admin());
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO public USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO public USING (is_admin());

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can read order items" ON public.order_items FOR SELECT TO public USING (is_admin());
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO public USING (is_admin());

-- Product Reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
-- CRITICAL: Allow both anon and authenticated users to insert
CREATE POLICY "Anyone can submit reviews" ON public.product_reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can read approved reviews" ON public.product_reviews FOR SELECT TO public USING (status = 'approved' OR is_admin());
CREATE POLICY "Admins can update reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete reviews" ON public.product_reviews FOR DELETE TO authenticated USING (is_admin());
-- IMPORTANT: Grant explicit permissions
GRANT SELECT, INSERT ON public.product_reviews TO anon, authenticated;
GRANT ALL ON public.product_reviews TO service_role;

-- Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT TO public USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "Admins can read all blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (is_admin());

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own addresses" ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own wishlist" ON public.wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin Settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.admin_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can read settings" ON public.admin_settings FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated USING (is_admin());

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read user_roles" ON public.user_roles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

--------------------------------------------------------------------------------
-- 6. REALTIME
--------------------------------------------------------------------------------

-- Enable realtime for banners table (used for live banner updates on homepage)
ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;

--------------------------------------------------------------------------------
-- 7. STORAGE BUCKETS
--------------------------------------------------------------------------------

-- Create bucket 'media'
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'media'
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'media' AND public.is_admin() );
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'media' AND public.is_admin() );
