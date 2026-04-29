import { Lock, Package, CreditCard, ShieldCheck } from 'lucide-react';

const badges = [
  { icon: Lock, label: 'Discreet Packaging', desc: 'Unmarked boxes, no product info visible' },
  { icon: Package, label: 'Private Delivery', desc: 'Billed as "OPS Retail"' },
  { icon: CreditCard, label: 'Secure Payment', desc: 'UPI & COD available' },
  { icon: ShieldCheck, label: 'Body Safe Materials', desc: 'Premium quality guaranteed' },
];

const TrustBadges = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="glass rounded-xl p-3 md:p-5 text-center group hover:glow-cyan-sm transition-shadow"
            >
              <badge.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
              <h2 className="font-display text-xs md:text-base font-semibold mb-0.5 md:mb-1">{badge.label}</h2>
              <p className="text-xs text-muted-foreground leading-tight">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
