import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Lock, Shield, Award, Truck, ChevronLeft, ExternalLink } from 'lucide-react';
import { fetchProduct, fetchProducts, fetchSettings } from '@/lib/api';
import { fetchApprovedReviews, submitReview } from '@/lib/reviewApi';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/landing/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchApprovedReviews(id!),
    enabled: !!id,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(true),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const relatedProducts = allProducts.filter(p => p.category_id === product?.category_id && p.id !== product?.id).slice(0, 4);

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) { toast.error('Please enter your name'); return; }
    try {
      await submitReview({
        product_id: id!,
        user_id: user?.id || null,
        reviewer_name: reviewName,
        rating: reviewRating,
        review_text: reviewText,
      });
      toast.success('Review submitted! It will appear after approval.');
      setReviewName(''); setReviewRating(5); setReviewText('');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-20 text-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-20 text-center"><p className="text-muted-foreground">Product not found</p></div>
    </div>
  );

  const trustItems = [
    { icon: Lock, label: 'Discreet packaging' },
    { icon: Shield, label: 'Secure checkout' },
    { icon: Award, label: 'Premium materials' },
    { icon: Truck, label: 'Fast delivery' },
  ];

  return (
    <>
      <Helmet>
        <title>{product.name} | oops! Pleasured</title>
      </Helmet>
      <ProductStructuredData product={{
        name: product.name,
        description: product.description,
        image: product.images?.[0] || '',
        price: product.price,
        availability: product.availability === 'available' ? 'InStock' : 'OutOfStock'
      }} />
      <BreadcrumbStructuredData items={[
        { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : 'https://oopsipleasured.in' },
        { name: 'Products', url: `${typeof window !== 'undefined' ? window.location.origin : 'https://oopsipleasured.in'}/#products` },
        { name: product.name, url: typeof window !== 'undefined' ? window.location.href : '' }
      ]} />
      <div className="min-h-screen bg-background">
        <AnnouncementBar /><Navbar />

      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {product.video && (
              <video controls className="w-full rounded-xl mt-4" src={product.video} />
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {product.category && (
              <p className="font-mono text-xs text-primary uppercase tracking-wider mb-2">{product.category.name}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{product.name}</h1>
            <p className="text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
            <p className="font-mono text-3xl font-bold text-primary mb-6">₹{product.price.toLocaleString('en-IN')}</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {trustItems.map(t => (
                <div key={t.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <t.icon className="w-3.5 h-3.5 text-primary" />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              <Button
                size="lg"
                className="flex-1 gradient-cyan text-primary-foreground font-semibold glow-cyan-sm"
                onClick={() => { addToCart(product); toast.success('Added to cart'); }}
                disabled={product.availability !== 'available'}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.availability === 'available' ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border"
                onClick={() => { toggleWishlist(product.id); toast.success(isWishlisted(product.id) ? 'Removed' : 'Added to wishlist'); }}
              >
                <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
            </div>

            {settings?.telegram_username && (
              <a
                href={`https://t.me/${settings.telegram_username}?text=Hi, I'm interested in ${product.name} (₹${product.price})`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4" /> Buy via Telegram
              </a>
            )}

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-6">
              <TabsList className="bg-secondary">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {product.description || 'No description available.'}
              </TabsContent>
              <TabsContent value="specs" className="mt-4">
                {product.other_details ? (
                  <div className="prose-brand text-sm" dangerouslySetInnerHTML={{ __html: product.other_details }} />
                ) : (
                  <p className="text-sm text-muted-foreground">No specifications available.</p>
                )}
              </TabsContent>
              <TabsContent value="shipping" className="text-sm text-muted-foreground mt-4 space-y-2">
                <p>📦 100% discreet packaging — unmarked box, no product labels</p>
                <p>🏷️ Billing appears as "OPS Retail"</p>
                <p>🚚 Free shipping on orders above ₹{settings?.free_shipping_threshold || 999}</p>
                <p>⏱️ Delivery in 3-7 business days</p>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">Customer Reviews</h2>

          {/* Review Form */}
          <div className="glass rounded-xl p-6 mb-8">
            <h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm mb-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(n => (
                <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(n)}>
                  <Star className={`w-6 h-6 ${n <= (hoverRating || reviewRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Your feedback..."
              rows={3}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm mb-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <Button className="gradient-cyan text-primary-foreground" onClick={handleSubmitReview}>Submit Review</Button>
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="glass rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display font-semibold text-sm">{r.reviewer_name}</span>
                    {r.is_verified_purchase && (
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  {r.review_text && <p className="text-sm text-muted-foreground">{r.review_text}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
          )}
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Read related blogs */}
        <div className="mt-16 glass rounded-xl p-8 text-center border border-border">
          <h2 className="text-xl font-display font-bold mb-3">Wellness & Tips</h2>
          <p className="text-muted-foreground mb-5 text-sm">Discover insights and guides related to your wellness journey.</p>
          <Link to="/blog" className="inline-flex items-center justify-center rounded-lg gradient-cyan px-6 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan-sm transition-all hover:opacity-90">
            Read related blogs
          </Link>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default ProductDetail;
