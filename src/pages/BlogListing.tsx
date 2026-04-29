import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { fetchBlogPosts } from '@/lib/blogApi';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const BlogListing = () => {
  const { data: posts = [] } = useQuery({ queryKey: ['blog-posts'], queryFn: () => fetchBlogPosts(true) });

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar /><Navbar />
      <div className="container py-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Our <span className="gradient-cyan-text">Blog</span></h1>
          <p className="text-muted-foreground">Tips, guides, and insights for your wellness journey</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="block glass rounded-xl overflow-hidden hover:glow-cyan-sm transition-shadow group">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      {post.published_at && new Date(post.published_at).toLocaleDateString('en-IN')}
                    </div>
                    <h2 className="font-display text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No blog posts yet. Check back soon!</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogListing;
