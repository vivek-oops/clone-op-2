import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = useCallback((hash: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  const navLinks = [
    { label: 'Home', action: () => { navigate('/'); setMobileOpen(false); } },
    { label: 'Shop', action: () => handleNavClick('#products') },
    { label: 'Categories', action: () => handleNavClick('#categories') },
    { label: 'Blog', action: () => { navigate('/blog'); setMobileOpen(false); } },
    { label: 'About', action: () => handleNavClick('#brand') },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg py-2'
            : 'bg-background/70 backdrop-blur-sm py-2 md:py-3'
        }`}
      >
        <div className="container flex items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full gradient-cyan flex items-center justify-center font-display text-base md:text-lg font-bold text-primary-foreground group-hover:glow-cyan-sm transition-shadow">
              O
            </div>
            <span className="font-display text-base md:text-xl font-semibold">
              <span className="text-muted-foreground">oops!</span>
              <span className="gradient-cyan-text">Pleasured</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-12 h-12 md:w-10 md:h-10"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-12 h-12 md:w-10 md:h-10"
              onClick={() => navigate('/wishlist')}
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative w-12 h-12 md:w-10 md:h-10"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full gradient-cyan text-[9px] md:text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-12 h-12 md:w-10 md:h-10"
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              className="hidden lg:inline-flex gradient-cyan text-primary-foreground font-semibold hover:opacity-90 glow-cyan-sm"
              onClick={() => handleNavClick('#products')}
            >
              Shop Now
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground w-12 h-12"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav - slide down with animation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-card border-t border-border">
            <div className="container py-4 px-4 md:px-8 flex flex-col gap-1">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 py-3 px-4 text-left rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="gradient-cyan text-primary-foreground font-semibold mt-2"
                onClick={() => handleNavClick('#products')}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-0 z-[60] bg-background/95 backdrop-blur-lg border-b border-border p-4 animate-fade-in">
          <div className="container flex items-center gap-3 px-4 md:px-8">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base md:text-lg"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
