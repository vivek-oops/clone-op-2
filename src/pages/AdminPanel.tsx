import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Package, ShoppingCart, LayoutGrid, Image, FileText, Star, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProducts, fetchCategories, fetchBanners, fetchSettings, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, createBanner, updateBanner, deleteBanner, uploadImage } from '@/lib/api';
import { fetchAllReviews, updateReview, deleteReview } from '@/lib/reviewApi';

import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, generateSlug, generateAIBlog } from '@/lib/blogApi';

import BlogManager from '@/components/admin/BlogManager';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Order, OrderItem, Product, Category, BlogPost, Banner } from '@/types';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/admin/login');
  }, [isAdmin, authLoading, navigate]);

  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => fetchProducts(false) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return (data as Order[]) || [];
    },
  });
  const { data: reviews = [] } = useQuery({ queryKey: ['admin-reviews'], queryFn: fetchAllReviews });
  const { data: blogPosts = [] } = useQuery({ queryKey: ['admin-blogs'], queryFn: () => fetchBlogPosts(false) });
  const { data: banners = [] } = useQuery({ queryKey: ['admin-banners'], queryFn: () => fetchBanners(false) });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Banner State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '', subtitle: '', cta_text: '', cta_link: '', display_order: 0, visible: true, image: '',
  });
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerForm({ title: '', subtitle: '', cta_text: '', cta_link: '', display_order: 0, visible: true, image: '' });
  };

  const openCreateBanner = () => { resetBannerForm(); setIsBannerModalOpen(true); };

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || '', subtitle: banner.subtitle || '', cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '', display_order: banner.display_order, visible: banner.visible,
      image: banner.image || '',
    });
    setIsBannerModalOpen(true);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBannerImage(true);
    const toastId = toast.loading('Uploading banner image...');
    try {
      const url = await uploadImage(file, 'banners');
      setBannerForm(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded', { id: toastId });
    } catch { toast.error('Failed to upload image', { id: toastId }); }
    finally { setIsUploadingBannerImage(false); }
  };

  const handleSaveBanner = async () => {
    setSavingBanner(true);
    const toastId = toast.loading(editingBanner ? 'Updating banner...' : 'Creating banner...');
    try {
      const payload: Partial<Banner> = {
        title: bannerForm.title || null, subtitle: bannerForm.subtitle || null,
        cta_text: bannerForm.cta_text || null, cta_link: bannerForm.cta_link || null,
        display_order: bannerForm.display_order, visible: bannerForm.visible,
        image: bannerForm.image || null,
      };
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
        toast.success('Banner updated', { id: toastId });
      } else {
        await createBanner(payload);
        toast.success('Banner created', { id: toastId });
      }
      setIsBannerModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      resetBannerForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save banner', { id: toastId });
    } finally { setSavingBanner(false); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    toast.success('Banner deleted');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory(newCategoryName.trim());
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
      toast.success('Category added');
    } catch { toast.error('Failed to add category'); }
  };

  // Order Detail State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setLoadingOrderItems(true);
    try {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      setOrderItems((data as OrderItem[]) || []);
    } catch {
      setOrderItems([]);
    } finally {
      setLoadingOrderItems(false);
    }
  };

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    availability: 'available',
    visible: true,
    images: [] as string[],
  });
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category_id: '', availability: 'available', visible: true, images: [] });
  };

  const openCreateProduct = () => {
    resetProductForm();
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category_id: product.category_id || '',
      availability: product.availability,
      visible: product.visible,
      images: product.images || [],
    });
    setIsProductModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploadingProductImage(true);
    const toastId = toast.loading('Uploading image(s)...');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, 'products');
        urls.push(url);
      }
      setProductForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success('Image(s) uploaded', { id: toastId });
    } catch (err: unknown) {
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploadingProductImage(false);
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) { toast.error('Product name is required'); return; }
    if (!productForm.price || isNaN(Number(productForm.price))) { toast.error('Valid price is required'); return; }
    setSavingProduct(true);
    const toastId = toast.loading(editingProduct ? 'Updating product...' : 'Creating product...');
    try {
      const payload: Partial<Product> = {
        name: productForm.name,
        description: productForm.description || null,
        price: Number(productForm.price),
        category_id: productForm.category_id || null,
        availability: productForm.availability,
        visible: productForm.visible,
        images: productForm.images,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success('Product updated', { id: toastId });
      } else {
        await createProduct(payload);
        toast.success('Product created', { id: toastId });
      }
      setIsProductModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      resetProductForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product', { id: toastId });
    } finally {
      setSavingProduct(false);
    }
  };

  // AI Blog Generation State
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [aiTitle, setAiTitle] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Blog Form State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);

  const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.order_status === orderStatusFilter);
  const filteredReviews = reviewStatusFilter === 'all' ? reviews : reviews.filter(r => r.status === reviewStatusFilter);

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const url = await uploadImage(file, 'blog');
      setFeaturedImage(url);
      toast.success('Image uploaded', { id: toastId });
    } catch (err: unknown) {
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveBlog = async (status: 'draft' | 'published' = 'draft') => {
    if (!blogTitle.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    const toastId = toast.loading(`Saving blog as ${status}...`);
    try {
      const payload: Partial<BlogPost> = {
        title: blogTitle,
        excerpt: blogExcerpt.trim() || null,
        content: blogContent,
        status,
        featured_image: featuredImage,
        linked_product_ids: linkedProductIds,
      };

      if (status === 'published' && (!editingBlog || !editingBlog.published_at)) {
        payload.published_at = new Date().toISOString();
      }

      if (editingBlog) {
        await updateBlogPost(editingBlog.id, payload);
        toast.success(status === 'published' ? 'Blog published' : 'Draft saved', { id: toastId });
      } else {
        await createBlogPost({
          ...payload,
          slug: generateSlug(blogTitle),
        });
        toast.success(status === 'published' ? 'Blog published' : 'Draft saved', { id: toastId });
      }
      setIsBlogModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      resetBlogForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save blog', { id: toastId });
    }
  };

  const resetBlogForm = () => {
    setEditingBlog(null);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setFeaturedImage('');
    setLinkedProductIds([]);
  };

  const openCreateBlog = () => {
    resetBlogForm();
    setIsBlogModalOpen(true);
  };

  const openEditBlog = (post: BlogPost) => {
    setEditingBlog(post);
    setBlogTitle(post.title || '');
    setBlogExcerpt(post.excerpt || '');
    setBlogContent(post.content || '');
    setFeaturedImage(post.featured_image || '');
    setLinkedProductIds(post.linked_product_ids || []);
    setIsBlogModalOpen(true);
  };

  const handleGenerateBlog = async () => {
    if (!aiTitle.trim()) {
      toast.error('Please enter a title for the blog post');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating AI blog post... This may take a minute.');

    try {
      const response = await generateAIBlog({
        provider: aiProvider,
        title: aiTitle,
        prompt: aiPrompt,
      });

      // Save the generated blog as a draft
      await createBlogPost({
        title: aiTitle,
        slug: generateSlug(aiTitle),
        content: response.content,
        excerpt: response.excerpt,
        featured_image: response.featured_image,
        status: 'draft',
      });

      toast.success('AI Blog generated and saved as draft!', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });

      // Reset form
      setAiTitle('');
      setAiPrompt('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate blog', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    toast.success('Order status updated');
  };

  const handleReviewStatus = async (reviewId: string, status: string) => {
    await updateReview(reviewId, { status } as Record<string, string>);
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    toast.success('Review ' + status);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success('Product deleted');
  };

  const handleDeleteReview = async (id: string) => {
    await deleteReview(id);
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    toast.success('Review deleted');
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    payment_received: 'bg-cyan-500/20 text-cyan-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-destructive/20 text-destructive',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-destructive/20 text-destructive',
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-green-500/20 text-green-400',
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center font-display text-sm font-bold text-primary-foreground">O</div>
            <span className="font-display font-semibold">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate('/'); }} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Products', value: products.length, icon: Package },
            { label: 'Orders', value: orders.length, icon: ShoppingCart },
            { label: 'Reviews', value: reviews.length, icon: Star },
            { label: 'Blog Posts', value: blogPosts.length, icon: FileText },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <stat.icon className="w-5 h-5 text-primary mb-2" />
              <p className="font-mono text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="all">All Orders</option>
                {['pending', 'confirmed', 'payment_received', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div key={order.id} className="glass rounded-xl p-4 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => openOrderDetail(order)}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      <p className="font-semibold text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone} • {order.payment_method.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-primary">₹{order.total_amount.toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${statusColors[order.order_status] || ''}`}>
                        {order.order_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{order.delivery_address}</p>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="glass rounded-xl p-6 text-center text-muted-foreground">No orders found.</div>
              )}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display">Products</h2>
              <Button onClick={openCreateProduct} className="gradient-cyan text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="font-mono text-xs text-primary">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${product.visible ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {product.visible ? 'Visible' : 'Hidden'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="glass rounded-xl p-6 text-center text-muted-foreground">No products yet. Click "Add Product" to create one.</div>
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                className="max-w-xs"
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="gradient-cyan text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="glass rounded-xl p-4 flex items-center justify-between gap-2">
                  {editingCategoryId === cat.id ? (
                    <Input
                      value={editingCategoryName}
                      onChange={e => setEditingCategoryName(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter') {
                          await updateCategory(cat.id, editingCategoryName);
                          queryClient.invalidateQueries({ queryKey: ['categories'] });
                          setEditingCategoryId(null);
                          toast.success('Category updated');
                        }
                      }}
                      autoFocus
                      className="max-w-xs"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{cat.name}</span>
                  )}
                  <div className="flex items-center gap-1">
                    {editingCategoryId === cat.id ? (
                      <>
                        <Button variant="outline" size="sm" onClick={async () => {
                          await updateCategory(cat.id, editingCategoryName);
                          queryClient.invalidateQueries({ queryKey: ['categories'] });
                          setEditingCategoryId(null);
                          toast.success('Category updated');
                        }}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}>Edit</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                      await deleteCategory(cat.id);
                      queryClient.invalidateQueries({ queryKey: ['categories'] });
                      toast.success('Category deleted');
                    }}>Delete</Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="glass rounded-xl p-8 text-center text-muted-foreground">No categories yet.</div>
              )}
            </div>
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display">Banners</h2>
              <Button onClick={openCreateBanner} className="gradient-cyan text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Banner
              </Button>
            </div>
            <div className="space-y-3">
              {banners.map(banner => (
                <div key={banner.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {banner.image && <img src={banner.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{banner.title || '(No title)'}</p>
                    <p className="text-xs text-muted-foreground">Order: {banner.display_order}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${banner.visible ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {banner.visible ? 'Visible' : 'Hidden'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditBanner(banner)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteBanner(banner.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="glass rounded-xl p-6 text-center text-muted-foreground">No banners yet. Click "Add Banner" to create one.</div>
              )}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <select value={reviewStatusFilter} onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="all">All Reviews</option>
                {['pending', 'approved', 'rejected'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              {filteredReviews.map(review => (
                <div key={review.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{review.reviewer_name}</p>
                      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      ))}</div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${statusColors[review.status] || ''}`}>
                      {review.status.toUpperCase()}
                    </span>
                  </div>
                  {review.review_text && <p className="text-xs text-muted-foreground mb-2">{review.review_text}</p>}
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button size="sm" className="gradient-cyan text-primary-foreground text-xs" onClick={() => handleReviewStatus(review.id, 'approved')}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => handleReviewStatus(review.id, 'rejected')}>Reject</Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blog" className="mt-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-display">Manage Blogs</h2>
              <Button onClick={openCreateBlog} className="gradient-cyan text-primary-foreground">
                + Create Manual Post
              </Button>
            </div>

            <div className="glass rounded-xl p-6 mb-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center text-primary-foreground">AI</div>
                Generate Blog Post
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center transition-colors ${aiProvider === 'gemini' ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:bg-secondary/80'}`} onClick={() => setAiProvider('gemini')}>
                    <span className="font-bold">Google Gemini</span>
                    <span className="text-xs text-muted-foreground mt-1">Fast & Creative</span>
                  </label>
                  <label className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center transition-colors ${aiProvider === 'openrouter' ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:bg-secondary/80'}`} onClick={() => setAiProvider('openrouter')}>
                    <span className="font-bold">Claude (via OpenRouter)</span>
                    <span className="text-xs text-muted-foreground mt-1">High Quality</span>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Blog Title (e.g., Top 5 Wellness Benefits of Regular Self-Care)"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                />

                <textarea
                  placeholder="Optional custom instructions for the AI (e.g., 'Focus specifically on couples and include tips for beginners.')"
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                />

                <Button
                  className="w-full gradient-cyan text-primary-foreground font-semibold"
                  onClick={handleGenerateBlog}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Post'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {blogPosts.map(post => (
                <div key={post.id} className="glass rounded-xl p-4 flex items-center gap-4">
                  {post.featured_image && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.author_name}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${statusColors[post.status] || ''}`}>
                    {post.status.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditBlog(post)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                      if (!confirm('Delete this blog post?')) return;
                      await deleteBlogPost(post.id);
                      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
                      toast.success('Blog deleted');
                    }}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>


          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
              {settings?.upi_qr_image && (
                <div className="glass rounded-xl p-6 flex flex-col items-center gap-3 w-full">
                  <p className="text-sm font-semibold text-foreground">Scan to Pay</p>
                  <img
                    src={settings.upi_qr_image}
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain rounded-lg border border-border"
                  />
                </div>
              )}
              {settings?.telegram_username && (
                <a
                  href={`https://t.me/${settings.telegram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl p-4 w-full flex items-center justify-center gap-2 text-primary hover:opacity-80 transition-opacity"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  <span className="font-semibold text-sm">Contact on Telegram</span>
                </a>
              )}
              {settings?.currency_symbol && (
                <div className="glass rounded-xl p-4 w-full text-center">
                  <p className="text-xs text-muted-foreground">Currency Symbol</p>
                  <p className="text-lg font-mono font-bold text-foreground">{settings.currency_symbol}</p>
                </div>
              )}
              {!settings && (
                <div className="glass rounded-xl p-6 w-full text-center">
                  <p className="text-sm text-muted-foreground">No settings configured yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isBlogModalOpen} onOpenChange={setIsBlogModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label>Meta Description / Excerpt</Label>
                <span className="text-xs text-muted-foreground">{blogExcerpt.length}/160</span>
              </div>
              <Textarea
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value.slice(0, 160))}
                placeholder="Write a concise 120-160 character summary for search and social previews."
                rows={3}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <Input type="file" accept="image/*" onChange={handleBlogImageUpload} disabled={isUploadingImage} />
              {featuredImage && (
                <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown or HTML)</Label>
              <Textarea
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Write your blog content here..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown like <code>## Heading</code>, <code>- bullet</code>, <code>[Product link](/product/id)</code>, or <code>[Jump to FAQ](#faq)</code>.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linked-products">Link Products</Label>
              <select
                id="linked-products"
                multiple
                value={linkedProductIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setLinkedProductIds(options);
                }}
                className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground">Hold Ctrl (Cmd on Mac) to select multiple products.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlogModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleSaveBlog('draft')}>Save as Draft</Button>
            <Button onClick={() => handleSaveBlog('published')}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" value={productForm.price} onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={productForm.category_id} onValueChange={(val) => setProductForm(prev => ({ ...prev, category_id: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={productForm.availability} onValueChange={(val) => setProductForm(prev => ({ ...prev, availability: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visible</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={productForm.visible} onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, visible: checked }))} />
                  <span className="text-sm text-muted-foreground">{productForm.visible ? 'Shown to customers' : 'Hidden'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <Input type="file" accept="image/*" multiple onChange={handleProductImageUpload} disabled={isUploadingProductImage} />
              {productForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {productForm.images.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeProductImage(i)}
                        className="absolute inset-0 bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={savingProduct}>
              {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id.slice(0, 8)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {/* Customer Info */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</p>
                  <p className="text-sm font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                  <p className="text-sm">{selectedOrder.delivery_address}</p>
                </div>

                {/* Payment */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Method</p>
                  <p className="text-sm font-mono">{selectedOrder.payment_method.toUpperCase()}</p>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</p>
                  {loadingOrderItems ? (
                    <p className="text-sm text-muted-foreground">Loading items...</p>
                  ) : orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {orderItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                          {item.product_image && (
                            <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-mono font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No items found.</p>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-lg font-mono font-bold text-primary">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</p>
                </div>

                {/* Status Update */}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={async (e) => {
                      await handleOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, order_status: e.target.value });
                    }}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  >
                    {['pending', 'confirmed', 'payment_received', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] text-muted-foreground">Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Banner Modal */}
      <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <Input type="file" accept="image/*" onChange={handleBannerImageUpload} disabled={isUploadingBannerImage} />
              {bannerForm.image && (
                <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img src={bannerForm.image} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={bannerForm.title} onChange={e => setBannerForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Banner title" />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={bannerForm.subtitle} onChange={e => setBannerForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Banner subtitle" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input value={bannerForm.cta_text} onChange={e => setBannerForm(prev => ({ ...prev, cta_text: e.target.value }))} placeholder="Shop Now" />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input value={bannerForm.cta_link} onChange={e => setBannerForm(prev => ({ ...prev, cta_link: e.target.value }))} placeholder="/products" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={bannerForm.display_order} onChange={e => setBannerForm(prev => ({ ...prev, display_order: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Visible</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={bannerForm.visible} onCheckedChange={checked => setBannerForm(prev => ({ ...prev, visible: checked }))} />
                  <span className="text-sm text-muted-foreground">{bannerForm.visible ? 'Shown' : 'Hidden'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBannerModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBanner} disabled={savingBanner}>
              {savingBanner ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default AdminPanel;
