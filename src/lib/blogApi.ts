import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types';

export const fetchBlogPosts = async (publishedOnly = true): Promise<BlogPost[]> => {
  let query = supabase.from('blog_posts').select('*');
  if (publishedOnly) {
    query = query.eq('status', 'published').lte('published_at', new Date().toISOString());
  }
  const { data, error } = await query.order('published_at', { ascending: false });
  if (error) throw error;
  return (data as BlogPost[]) || [];
};

export const fetchBlogPost = async (slug: string): Promise<BlogPost> => {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data as BlogPost;
};

export const fetchBlogPostById = async (id: string): Promise<BlogPost> => {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error) throw error;
  return data as BlogPost;
};

export const createBlogPost = async (post: Partial<BlogPost>) => {
  const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
  if (error) throw error;
  return data;
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>) => {
  const { data, error } = await supabase.from('blog_posts').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface GenerateBlogPayload {
  provider: 'gemini' | 'openrouter';
  title: string;
  prompt?: string;
}

interface GenerateBlogResponse {
  success: boolean;
  content: string;
  excerpt: string;
  featured_image: string;
  error?: string;
}

export const generateAIBlog = async (payload: GenerateBlogPayload): Promise<GenerateBlogResponse> => {
  // Get active session token to pass to Edge Function
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('You must be logged in to generate AI content.');
  }

  const { data, error } = await supabase.functions.invoke('generate-blog', {
    body: payload,
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate blog content');
  }

  if (!data.success) {
    throw new Error(data.error || 'AI Generation failed');
  }

  return data as GenerateBlogResponse;
};
