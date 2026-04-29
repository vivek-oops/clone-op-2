import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Banner, AdminSettings } from '@/types';

export const fetchProducts = async (visibleOnly = true): Promise<Product[]> => {
  let query = supabase.from('products').select('*, category:categories(*)');
  if (visibleOnly) query = query.eq('visible', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Product[]) || [];
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Product;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return (data as Category[]) || [];
};

export const fetchBanners = async (visibleOnly = true): Promise<Banner[]> => {
  let query = supabase.from('banners').select('*');
  if (visibleOnly) query = query.eq('visible', true);
  const { data, error } = await query.order('display_order');
  if (error) throw error;
  return (data as Banner[]) || [];
};

export const fetchSettings = async (): Promise<AdminSettings | null> => {
  const { data, error } = await supabase.from('admin_settings').select('*').limit(1).single();
  if (error) return null;
  return data as AdminSettings;
};

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${path}/${fileName}`;
  const { error } = await supabase.storage.from('media').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
};

export const createProduct = async (product: Partial<Product>) => {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

export const createCategory = async (name: string) => {
  const { data, error } = await supabase.from('categories').insert({ name }).select().single();
  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, name: string) => {
  const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

export const createBanner = async (banner: Partial<Banner>) => {
  const { data, error } = await supabase.from('banners').insert(banner).select().single();
  if (error) throw error;
  return data;
};

export const updateBanner = async (id: string, updates: Partial<Banner>) => {
  const { data, error } = await supabase.from('banners').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteBanner = async (id: string) => {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
};

export const updateSettings = async (id: string, updates: Partial<AdminSettings>) => {
  const { data, error } = await supabase.from('admin_settings').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};
