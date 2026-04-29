import { useState, useEffect, useCallback } from 'react';
import { getOptimizedImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Banner } from '@/types';

interface HeroBannerProps {
  banners: Banner[];
}

const fallbackBanners = [
  {
    id: 'default-1',
    title: 'Premium Wellness',
    subtitle: 'Discover products designed for your pleasure & wellness',
    cta_text: 'Shop Now',
    cta_link: '#products',
    image: null,
  },
];

const HeroBanner = ({ banners }: HeroBannerProps) => {
  const [current, setCurrent] = useState(0);
  const items = banners.length > 0 ? banners : fallbackBanners;

  const next = useCallback(() => setCurrent(p => (p + 1) % items.length), [items.length]);
  const prev = () => setCurrent(p => (p - 1 + items.length) % items.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const item = items[current];

  return (
    <section className="relative h-[50vh] md:h-[70vh] min-h-[320px] md:min-h-[500px] overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {item.image ? (
            <img 
              src={getOptimizedImageUrl(item.image)} 
              srcSet={`${item.image} 800w, ${item.image} 1600w`}
              sizes="100vw"
              alt={item.title || 'Wellness Banner'} 
              width={1600}
              height={900}
              className="w-full h-full object-cover" 
              loading="eager" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary via-background to-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Radial glow */}
      <div className="absolute inset-0 radial-glow opacity-30" />

      {/* Content */}
      <div className="relative z-10 container h-full flex items-center px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-3 md:mb-4">
              {(item as Banner).title || 'Premium Wellness'}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              {(item as Banner).subtitle || 'Discover products designed for your pleasure & wellness'}
            </p>
            <Button
              size="lg"
              className="gradient-cyan text-primary-foreground font-semibold text-base md:text-lg px-6 md:px-8 py-5 md:py-6 glow-cyan-sm hover:opacity-90 transition-opacity"
              onClick={() => {
                const el = document.querySelector('#products');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {(item as Banner).cta_text || 'Shop Now'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-10 md:h-10 rounded-full glass flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-10 md:h-10 rounded-full glass flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
                  i === current ? 'bg-primary w-6 md:w-8' : 'bg-foreground/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
