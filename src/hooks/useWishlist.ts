import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const GUEST_WISHLIST_KEY = 'guest_wishlist';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const loadWishlist = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);
      setWishlistIds(data?.map(w => w.product_id) || []);
    } else {
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        setWishlistIds(stored ? JSON.parse(stored) : []);
      } catch {
        setWishlistIds([]);
      }
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    const wasWishlisted = isWishlisted(productId);
    // Optimistic update
    setWishlistIds(prev =>
      wasWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      if (user) {
        if (wasWishlisted) {
          await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
        } else {
          await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
        }
      } else {
        const updated = wasWishlisted
          ? wishlistIds.filter(id => id !== productId)
          : [...wishlistIds, productId];
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
      }
    } catch {
      // Rollback
      setWishlistIds(prev =>
        wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  };

  return { wishlistIds, isWishlisted, toggleWishlist };
};
