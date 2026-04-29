import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { fetchProducts } from '@/lib/api';
import { useWishlist } from '@/hooks/useWishlist';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/landing/ProductCard';

const Wishlist = () => {
  const { wishlistIds } = useWishlist();
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => fetchProducts(true) });

  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <AnnouncementBar /><Navbar />
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Wishlist</h1>
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {wishlistedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="font-display text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground">Save products you love for later</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Wishlist;
