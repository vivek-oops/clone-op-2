import { Category } from '@/types';
import { ImageIcon } from 'lucide-react';
import { useEffect } from 'react';

interface CategoryDiscoveryProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

const CategoryDiscovery = ({ categories, onCategoryClick }: CategoryDiscoveryProps) => {
  useEffect(() => {
    console.log('Categories data:', categories);
  }, [categories]);

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-8 md:py-16">
      <div className="container">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-2">
            Explore <span className="gradient-cyan-text">Categories</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="flex-shrink-0 flex flex-col items-center justify-center glass rounded-xl p-3 md:px-6 md:py-4 text-center hover:glow-cyan-sm hover:border-primary/30 transition-all h-[140px] sm:h-[160px] md:h-auto md:min-h-[48px] active:scale-95 group"
            >
              <div className="h-[70px] md:h-[80px] w-full flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="w-auto max-w-[70%] h-auto max-h-full object-contain block"
                  />
                ) : (
                  <ImageIcon className="w-1/2 h-1/2 text-muted-foreground opacity-50" />
                )}
              </div>
              <span className="font-display text-sm md:text-base font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryDiscovery;
