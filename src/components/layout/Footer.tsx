import { Link } from 'react-router-dom';
import { Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-secondary/50 border-t border-border mt-12 md:mt-20">
      <div className="container py-8 md:py-16">
        {/* Request a Product CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 mb-10 md:mb-16 gap-6 text-center md:text-left transition-all hover:border-primary/30">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">Can't find what you're looking for?</h3>
            <p className="text-sm text-muted-foreground mt-2">Message us directly on Telegram to request specific items.</p>
          </div>
          <a
            href="https://t.me/beinguniique?text=Hi%2C%20I%20would%20like%20to%20request%20a%20product."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button className="gradient-cyan text-primary-foreground font-semibold px-8 py-5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
              Request a Product
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full gradient-cyan flex items-center justify-center font-display text-xs md:text-sm font-bold text-primary-foreground">
                O
              </div>
              <span className="font-display text-base md:text-lg font-semibold">
                <span className="text-muted-foreground">oops!</span>
                <span className="gradient-cyan-text">Pleasured</span>
              </span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Elevating personal wellness with uncompromising privacy and premium design. We curate modern intimate essentials in meticulously discreet packaging, ensuring your comfort, confidence, and complete peace of mind.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.instagram.com/oopsipleasured" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/share/1CdWXFqhic/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm md:text-lg font-semibold mb-3 md:mb-4 text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {[
                { label: 'Shop', href: '/#products' },
                { label: 'Blog', href: '/blog' },
                { label: 'About Us', href: '/about' },
                { label: 'My Account', href: '/dashboard' },
              ].map(l => (
                <Link key={l.label} to={l.href} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-sm md:text-lg font-semibold mb-3 md:mb-4 text-foreground">Support</h3>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {[
                { label: 'Shipping & Delivery', href: '/shipping' },
                { label: 'Returns & Refunds', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
              ].map(l => (
                <Link key={l.label} to={l.href} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-display text-sm md:text-lg font-semibold mb-3 md:mb-4 text-foreground">Stay Updated</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">Get exclusive offers & new arrivals.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 min-w-0 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="icon" className="gradient-cyan text-primary-foreground shrink-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 md:mt-10 pt-4 md:pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OPS Retail. All rights reserved. Billing appears as "OPS Retail".
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
