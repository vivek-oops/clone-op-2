import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Package, Heart as HeartIcon, MapPin, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Order, Address } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return (data as Order[]) || [];
    },
    enabled: !!user,
  });

  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['user-addresses', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return (data as Address[]) || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
        if (data) { setFullName(data.full_name || ''); setPhone(data.phone || ''); }
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('user_id', user!.id);
    if (error) toast.error('Failed to save'); else toast.success('Profile saved');
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-destructive/20 text-destructive',
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">My Account</h1>
          <Button variant="outline" className="border-border text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="orders"><Package className="w-4 h-4 mr-1.5" /> Orders</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-4 h-4 mr-1.5" /> Addresses</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1.5" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${statusColors[order.order_status] || 'bg-muted text-muted-foreground'}`}>
                        {order.order_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                      <span className="font-mono font-bold text-primary">₹{order.total_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.payment_method.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            {addresses.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No saved addresses</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="glass rounded-xl p-5">
                    <p className="font-semibold text-sm mb-1">{addr.label}</p>
                    <p className="text-sm text-muted-foreground">{addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="max-w-md">
            <div className="glass rounded-xl p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <input value={user.email || ''} disabled className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <Button className="gradient-cyan text-primary-foreground" onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
