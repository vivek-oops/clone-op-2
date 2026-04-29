
-- 1. ORDERS: Remove public read-all policy (exposes PII)
DROP POLICY IF EXISTS "Allow read orders" ON public.orders;

-- Remove duplicate insert policy
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;

-- 2. PRODUCTS: Remove overly permissive full access policy
DROP POLICY IF EXISTS "Admin full access products" ON public.products;

-- Remove redundant public view policy
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- 3. CATEGORIES: Remove overly permissive full access policy
DROP POLICY IF EXISTS "Admin full access categories" ON public.categories;

-- 4. PRODUCT REVIEWS: Remove overly permissive policies
DROP POLICY IF EXISTS "Admin full access reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON public.product_reviews;
