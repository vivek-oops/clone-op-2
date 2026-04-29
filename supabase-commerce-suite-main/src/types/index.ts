export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  other_details: string | null;
  images: string[];
  video: string | null;
  category_id: string | null;
  availability: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Banner {
  id: string;
  image: string | null;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  display_order: number;
  visible: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  notes: string | null;
  payment_method: string;
  order_status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  quality_rating: number;
  performance_rating: number;
  value_rating: number;
  design_rating: number;
  status: string;
  is_featured: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author_name: string;
  status: string;
  published_at: string | null;
  linked_product_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface AdminSettings {
  site_title: string;
  id: string;
  telegram_username: string;
  currency_symbol: string;
  upi_qr_image: string | null;
  shipping_cost: number;
  free_shipping_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
