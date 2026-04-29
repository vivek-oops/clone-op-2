import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const PromoBanner = () => {
  const [time, setTime] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="py-8 md:py-16">
      <div className="container">
        <div className="gradient-cyan rounded-2xl p-6 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent" />
          <div className="relative z-10">
            <p className="font-mono text-xs md:text-sm text-primary-foreground/80 uppercase tracking-wider mb-2">Limited Time Offer</p>
            <h2 className="text-3xl md:text-6xl font-display font-bold text-primary-foreground mb-3 md:mb-4">
              50% OFF
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/80 mb-4 md:mb-6">On selected premium products</p>
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
              {[
                { val: pad(time.hours), label: 'HRS' },
                { val: pad(time.minutes), label: 'MIN' },
                { val: pad(time.seconds), label: 'SEC' },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="font-mono text-2xl md:text-5xl font-bold text-primary-foreground">{t.val}</span>
                  <span className="text-[9px] md:text-[10px] text-primary-foreground/60 font-mono">{t.label}</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary font-semibold text-base md:text-lg px-6 md:px-8 hover:bg-primary-foreground/90"
              onClick={() => {
                const el = document.querySelector('#products');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop the Sale
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
