import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      }
      // Navigation handled by useEffect when auth state updates
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm glass rounded-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full gradient-cyan mx-auto mb-3 flex items-center justify-center font-display text-xl font-bold text-primary-foreground">O</div>
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">oops!Pleasured Admin Panel</p>
        </div>
        <div className="space-y-3">
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <Button className="w-full gradient-cyan text-primary-foreground font-semibold" onClick={handleLogin} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
