import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, generateSlug } from '@/lib/blogApi';
import { uploadImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BlogPost } from '@/types';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-500/20 text-green-400',
};

const BlogManager = () => {
  const queryClient = useQueryClient();
  const { data: blogPosts = [] } = useQuery({ queryKey: ['admin-blogs'], queryFn: () => fetchBlogPosts(false) });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: 'Admin',
    status: 'draft' as string,
  });

  const resetForm = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', featured_image: '', author_name: 'Admin', status: 'draft' });
    setEditingPost(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      author_name: post.author_name,
      status: post.status,
    });
    setDialogOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, 'blog');
      setForm(prev => ({ ...prev, featured_image: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<BlogPost> = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        content: form.content || null,
        featured_image: form.featured_image || null,
        author_name: form.author_name,
        status: form.status,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
        toast.success('Blog post updated');
      } else {
        await createBlogPost(payload);
        toast.success('Blog post created');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      setDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await deleteBlogPost(id);
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await updateBlogPost(post.id, {
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    });
    queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    toast.success(`Post ${newStatus}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Blog Posts ({blogPosts.length})</h2>
        <Button onClick={openCreate} className="gradient-cyan text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Blog Post
        </Button>
      </div>

      {blogPosts.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          <p>No blog posts yet. Click "Add Blog Post" to create your first one.</p>
        </div>
      ) : (
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
                <p className="text-xs text-muted-foreground">{post.author_name} • {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full shrink-0 ${statusColors[post.status] || ''}`}>
                {post.status.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(post)} title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                  {post.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Blog post title" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="url-friendly-slug" />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Brief summary..." rows={2} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Full blog content..." rows={8} />
            </div>
            <div>
              <Label>Featured Image</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {form.featured_image && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={form.featured_image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Author Name</Label>
              <Input value={form.author_name} onChange={e => setForm(prev => ({ ...prev, author_name: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="gradient-cyan text-primary-foreground">
                {saving ? 'Saving...' : editingPost ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManager;
