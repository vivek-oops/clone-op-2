import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { fetchSettings } from '@/lib/api';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });

  const shippingCost = settings?.shipping_cost || 99;
  const freeThreshold = settings?.free_shipping_threshold || 999;
  const shipping = subtotal >= freeThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <AnnouncementBar /><Navbar />
        <div className="container py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Discover our premium products</p>
          <Button className="gradient-cyan text-primary-foreground" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <AnnouncementBar /><Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="glass rounded-xl p-4 flex gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] text-primary uppercase">{product.category?.name}</p>
                  <h3 className="font-display font-semibold line-clamp-1">{product.name}</h3>
                  <p className="font-mono text-primary font-bold mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 glass rounded-lg">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 hover:text-primary">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-sm w-8 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1.5 hover:text-primary">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono">{shipping === 0 ? <span className="text-primary">FREE</span> : `₹${shipping}`}</span>
              </div>
              {subtotal < freeThreshold && (
                <p className="text-xs text-primary">Add ₹{(freeThreshold - subtotal).toLocaleString('en-IN')} more for free shipping</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Total</span><span className="font-mono text-primary text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <Button className="w-full mt-6 gradient-cyan text-primary-foreground font-semibold glow-cyan-sm" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Cart;
