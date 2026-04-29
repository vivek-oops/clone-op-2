import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) toast.error(error.message);
    else { toast.success('Welcome back!'); navigate('/dashboard'); }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!signupName.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (error) toast.error(error.message);
    else toast.success('Account created! Check your email to verify.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container max-w-md py-16">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full gradient-cyan mx-auto mb-4 flex items-center justify-center font-display text-xl font-bold text-primary-foreground">O</div>
          <h1 className="font-display text-3xl font-bold">Welcome</h1>
          <p className="text-muted-foreground mt-1">Sign in or create an account</p>
        </div>

        <div className="glass rounded-xl p-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3 mt-4">
              <input placeholder="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <Button className="w-full gradient-cyan text-primary-foreground font-semibold" onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 mt-4">
              <input placeholder="Full Name" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <input placeholder="Password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <Button className="w-full gradient-cyan text-primary-foreground font-semibold" onClick={handleSignup} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
