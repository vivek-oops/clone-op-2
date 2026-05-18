import { useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { fetchBlogPost } from '@/lib/blogApi';
import ProductCard from '@/components/landing/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { ArticleStructuredData } from '@/components/StructuredData';
import { renderBlogContent } from '@/lib/blogContent';

const BlogArticle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPost(slug!),
    enabled: !!slug,
});

  const linkedIds = post?.linked_product_ids?.filter(Boolean) ?? [];

  const { data: linkedProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['linked-products', linkedIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .in('id', linkedIds)
        .eq('visible', true);
      if (error) throw error;
      return (data as Product[]) || [];
    },
    enabled: linkedIds.length > 0,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!anchor?.getAttribute('href')) return;

    const rawHref = anchor.getAttribute('href')!;

    if (rawHref.startsWith('#')) {
      event.preventDefault();
      const section = document.getElementById(rawHref.slice(1));
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `${location.pathname}${rawHref}`);
      }
      return;
    }

    const absoluteUrl = new URL(anchor.href, window.location.origin);
    if (absoluteUrl.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(`${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`);
  };

  const renderedContent = renderBlogContent(post?.content);

  useEffect(() => {
    if (!location.hash || !renderedContent) return;
    const section = document.getElementById(location.hash.slice(1));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, renderedContent]);

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-20 text-center text-muted-foreground">Loading...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-20 text-center text-muted-foreground">Article not found</div>
    </div>
  );

  const articleUrl = `https://oopsipleasured.in/blog/${post.slug}`;
  const fallbackDescription = post.content
    ? post.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 152).trimEnd() + '...'
    : 'Expert wellness advice from oops!Pleasured.';
  const articleDescription = post.excerpt?.trim() || fallbackDescription;
  const articleImage = post.featured_image || 'https://oopsipleasured.in/default-og-image.jpg';
  const orderedLinkedProducts = linkedProducts
    .slice()
    .sort((a, b) => linkedIds.indexOf(a.id) - linkedIds.indexOf(b.id));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={articleDescription}
        canonicalUrl={articleUrl}
        ogImage={articleImage}
        ogType="article"
      />
      <ArticleStructuredData article={{
        headline: post.title,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        image: articleImage,
        author: post.author_name || 'oops!Pleasured',
        url: articleUrl,
        description: articleDescription,
      }} />
      <AnnouncementBar /><Navbar />
      <div className="container max-w-3xl py-8">
        <Link to="/blog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {post.featured_image && (
          <div className="aspect-video rounded-xl overflow-hidden mb-6">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author_name}</span>
          {post.published_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.published_at).toLocaleDateString('en-IN')}</span>}
          <button onClick={handleShare} className="ml-auto flex items-center gap-1 hover:text-primary">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

        {renderedContent && (
          <div
            className="prose-brand mb-12"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}


        {linkedIds.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-display text-2xl font-bold mb-6">Related Products</h2>
            {loadingProducts ? (
              <p className="text-sm text-muted-foreground">Loading products...</p>
            ) : orderedLinkedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {orderedLinkedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No related products available.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogArticle;
