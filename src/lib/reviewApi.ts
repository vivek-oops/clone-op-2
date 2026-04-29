import { supabase } from '@/integrations/supabase/client';
import { ProductReview } from '@/types';

export const fetchApprovedReviews = async (productId: string): Promise<ProductReview[]> => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ProductReview[]) || [];
};

export const fetchAllReviews = async (): Promise<ProductReview[]> => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ProductReview[]) || [];
};

export const submitReview = async (review: Partial<ProductReview>) => {
  const { data, error } = await supabase.from('product_reviews').insert({ ...review, status: 'pending' }).select().single();
  if (error) throw error;
  return data;
};

export const updateReview = async (id: string, updates: Partial<ProductReview>) => {
  const { data, error } = await supabase.from('product_reviews').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteReview = async (id: string) => {
  const { error } = await supabase.from('product_reviews').delete().eq('id', id);
  if (error) throw error;
};
