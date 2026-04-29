import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSettings } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', street: '', landmark: '', city: '', state: '', pincode: '',
    notes: '', paymentMethod: 'cod',
  });

  const shippingCost = settings?.shipping_cost || 99;
  const freeThreshold = settings?.free_shipping_threshold || 999;
  const shipping = subtotal >= freeThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  const validate = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return false; }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter valid 10-digit phone'); return false; }
    if (!form.address.trim() || !form.city.trim() || !form.state || !form.pincode.trim()) {
      toast.error('Please fill all address fields'); return false;
    }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter valid 6-digit pincode'); return false; }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (form.paymentMethod === 'upi') { setStep(2); } else { placeOrder(); }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const fullAddress = `${form.address}, ${form.street}${form.landmark ? ', ' + form.landmark : ''}, ${form.city}, ${form.state} - ${form.pincode}`;
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        delivery_address: fullAddress,
        notes: form.notes || null,
        payment_method: form.paymentMethod,
        total_amount: total,
      }).select().single();
      if (error) throw error;

      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || null,
        price: product.price,
        quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderId(order.id);
      clearCart();
      setStep(3);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  if (items.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <AnnouncementBar /><Navbar />
      <div className="container py-8 max-w-3xl">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Details', 'Payment', 'Success'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step > i + 1 ? 'gradient-cyan text-primary-foreground' :
                step === i + 1 ? 'border-2 border-primary text-primary' : 'border border-border text-muted-foreground'
              }`}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden md:block ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-xl p-6 mb-6">
              <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between">
                    <span className="text-muted-foreground">{product.name} × {quantity}</span>
                    <span className="font-mono">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span><span className="font-mono text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Full Name *" value={form.name} onChange={(e) => updateField('name', e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <input placeholder="Phone (10 digits) *" value={form.phone} onChange={(e) => updateField('phone', e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <input placeholder="Email (optional)" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />

              <h3 className="font-display font-semibold mt-4">Delivery Address</h3>
              <input placeholder="House/Flat Number *" value={form.address} onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Street/Area *" value={form.street} onChange={(e) => updateField('street', e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Landmark" value={form.landmark} onChange={(e) => updateField('landmark', e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="City *" value={form.city} onChange={(e) => updateField('city', e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <select value={form.state} onChange={(e) => updateField('state', e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                  <option value="">State *</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Pincode (6 digits) *" value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />

              <h3 className="font-display font-semibold mt-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'upi', label: 'UPI' }, { value: 'cod', label: 'Cash on Delivery' }].map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => updateField('paymentMethod', pm.value)}
                    className={`glass rounded-xl p-4 text-center text-sm font-semibold transition-all ${
                      form.paymentMethod === pm.value ? 'border-primary glow-cyan-sm text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              <Button
                className="w-full mt-4 gradient-cyan text-primary-foreground font-semibold glow-cyan-sm"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : form.paymentMethod === 'upi' ? 'Continue to Payment' : 'Place Order'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: UPI Payment */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 text-center">
            <h2 className="font-display text-xl font-bold mb-4">UPI Payment</h2>
            <p className="text-muted-foreground mb-4">Scan the QR code and pay</p>
            <p className="font-mono text-2xl font-bold text-primary mb-6">₹{total.toLocaleString('en-IN')}</p>
            {settings?.upi_qr_image ? (
              <img src={settings.upi_qr_image} alt="UPI QR" className="mx-auto w-64 h-64 rounded-xl mb-6" />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-xl mx-auto mb-6 flex items-center justify-center text-muted-foreground text-sm">
                UPI QR not configured
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button className="gradient-cyan text-primary-foreground" onClick={placeOrder} disabled={loading}>
                {loading ? 'Processing...' : "I've Paid — Place Order"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 rounded-full gradient-cyan mx-auto mb-6 flex items-center justify-center animate-glow-pulse">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-2">Order ID: <span className="font-mono text-primary">{orderId.slice(0, 8)}</span></p>
            <p className="text-sm text-muted-foreground mb-8">Thank you for your order! You'll receive updates on delivery.</p>
            <Button className="gradient-cyan text-primary-foreground" onClick={() => navigate('/')}>Continue Shopping</Button>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Checkout;
