import { Heart, Lock, Award } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Pleasure', desc: 'We believe everyone deserves access to high-quality wellness products that enhance their intimate life.' },
  { icon: Lock, title: 'Privacy', desc: 'Your privacy is our priority. From discreet packaging to private billing, we protect your confidence.' },
  { icon: Award, title: 'Quality', desc: 'Every product is carefully curated to meet the highest standards of safety and performance.' },
];

const BrandStory = () => {
  return (
    <section id="brand" className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 radial-glow opacity-20" />
      <div className="container relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-5xl font-display font-bold mb-3 md:mb-4">
            Our <span className="gradient-cyan-text">Story</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            oops!Pleasured was born from a simple belief: wellness is a right, not a luxury.
            We provide premium adult wellness products with complete discretion and care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className="text-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full gradient-cyan mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <v.icon className="w-5 h-5 md:w-7 md:h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg md:text-xl font-bold mb-1.5 md:mb-2">{v.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
