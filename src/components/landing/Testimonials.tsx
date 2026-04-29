import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya M.',
    text: 'Absolutely love the discreet packaging! No one could tell what was inside. The quality is incredible.',
    rating: 5,
  },
  {
    name: 'Rahul S.',
    text: 'Fast delivery and great products. The billing as "OPS Retail" gives total peace of mind.',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    text: 'Best quality I\'ve found online. The customer support team is also very helpful and understanding.',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-8 md:py-16">
      <div className="container">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-2">
            What Our <span className="gradient-cyan-text">Customers</span> Say
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">Real reviews from real people</p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible scrollbar-none scroll-smooth-touch">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 md:p-6 flex-shrink-0 w-[280px] md:w-auto"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <p className="font-display font-semibold text-sm">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
