import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="glass rounded-xl overflow-hidden transition-all hover:glow-cyan-sm">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <img
              src={getOptimizedImageUrl(product.images[0])}
              srcSet={`${product.images[0]} 400w, ${product.images[0]} 800w`}
              sizes="(max-width: 768px) 100vw, 400px"
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Eye className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          )}

          {/* Wishlist - always visible on mobile (touch devices) */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 md:top-3 md:right-3 w-12 h-12 md:w-8 md:h-8 rounded-full glass flex items-center justify-center transition-all ${
              wishlisted ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-destructive text-destructive' : 'text-foreground'
              }`}
            />
          </button>

          {/* Stock Badge */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
            <span
              className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${
                product.availability === 'available'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-destructive/20 text-destructive'
              }`}
            >
              {product.availability === 'available' ? 'Available' : 'Pre-order'}
            </span>
          </div>

          {/* Add to Cart - always visible on mobile, hover on desktop */}
          <div className="absolute inset-x-0 bottom-0 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full gradient-cyan text-primary-foreground py-3.5 flex items-center justify-center gap-2 font-semibold text-sm md:py-3 md:text-sm min-h-[48px]"
            >
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-4">
          {product.category && (
            <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}
          <p className="font-display text-sm md:text-base font-semibold line-clamp-1 mb-1 text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden md:block">
            {product.description}
          </p>
          <p className="font-mono text-base md:text-lg font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
