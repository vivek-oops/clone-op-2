import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchProducts, fetchCategories, fetchBanners, fetchSettings } from '@/lib/api';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/landing/HeroBanner';
import TrustBadges from '@/components/landing/TrustBadges';
import CategoryDiscovery from '@/components/landing/CategoryDiscovery';
import ProductCard from '@/components/landing/ProductCard';
import PromoBanner from '@/components/landing/PromoBanner';
import Testimonials from '@/components/landing/Testimonials';
import BrandStory from '@/components/landing/BrandStory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===== SEO CHANGE 1/2: Import the SEO component =====
import { SEO } from '@/components/SEO';
import { WebSiteStructuredData, BreadcrumbStructuredData, OrganizationStructuredData } from '@/components/StructuredData';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => fetchProducts(true) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: banners = [] } = useQuery({ queryKey: ['banners'], queryFn: () => fetchBanners(true) });

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === selectedCategory);
    }
    switch (sortBy) {
      case 'price-low': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-high': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'name': result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <>
      {/* ===== SEO CHANGE 2/2: Add SEO component with homepage meta ===== */}
      <SEO
        title="Premium Intimate Wellness Products in India"
        description="Shop premium adult wellness products. 100% discreet packaging, private billing, free shipping above ₹999."
        canonicalUrl="https://oopsipleasured.in/" 
        // ogImage="/home-og.jpg" (optional)
      />
      <WebSiteStructuredData />
      <OrganizationStructuredData />
      <BreadcrumbStructuredData items={[
        { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : 'https://oopsipleasured.in' }
      ]} />

      {/* All existing JSX remains completely unchanged below this line */}
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Navbar />
        <HeroBanner banners={banners} />
        <TrustBadges />
        <CategoryDiscovery categories={categories} onCategoryClick={(id) => {
          setSelectedCategory(id);
          document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
        }} />

        {/* Products Section */}
        <section id="products" className="py-8 md:py-16">
          <div className="container">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-2">
                Our <span className="gradient-cyan-text">Products</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">Premium quality, discreet delivery</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-6 md:mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 md:py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1 md:w-[180px] bg-secondary border-border text-xs md:text-sm">
                    <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2 shrink-0" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 md:w-[160px] bg-secondary border-border text-xs md:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low→High</SelectItem>
                    <SelectItem value="price-high">Price: High→Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search</p>
              </div>
            )}
          </div>
        </section>

        <PromoBanner />
        <Testimonials />
        <BrandStory />
        <section className="py-8 md:py-12 bg-secondary/30">
          <div className="container text-center">
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4">Wellness Insights & Tips</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
              Explore our latest articles on intimacy, wellness, and self-care.
            </p>
            <Link to="/blog" className="inline-flex items-center justify-center rounded-lg gradient-cyan px-6 md:px-8 py-2.5 md:py-3 text-sm font-semibold text-primary-foreground glow-cyan-sm transition-all hover:opacity-90">
              Read our blog
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default Index;