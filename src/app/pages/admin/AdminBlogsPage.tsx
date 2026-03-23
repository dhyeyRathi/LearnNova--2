import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { blogs } from '../../data/mockData';
import { Search, Plus, Eye, Calendar, User, Edit, Share2, Trash2, FileText, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type ViewMode = 'kanban' | 'list';

export default function AdminBlogsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogsList, setBlogsList] = useState(() => {
    try {
      const saved = localStorage.getItem('blogsList');
      const userBlogs = saved ? JSON.parse(saved) : [];
      return [...blogs, ...userBlogs];
    } catch {
      return blogs;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [createOpen, setCreateOpen] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogFeaturedImage, setNewBlogFeaturedImage] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Technology');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, []);

  useEffect(() => {
    localStorage.setItem('blogsList', JSON.stringify(blogsList.filter(b => b.id.startsWith('blog-'))));
  }, [blogsList]);

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
          <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Access Required</h2>
          <p className="text-[#7A766F] mb-6 text-sm">This dashboard is only accessible to administrators and instructors.</p>
          <Button onClick={() => navigate('/courses')} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-sm">Go to Blogs</Button>
        </div>
      </div>
    );
  }

  const filteredBlogs = blogsList.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
  });

  const publishedBlogs = filteredBlogs.filter(b => b.published);
  const draftBlogs = filteredBlogs.filter(b => !b.published);

  const handleCreate = () => {
    if (!newBlogTitle.trim()) {
      toast.error('Blog title is required');
      return;
    }
    if (!newBlogContent.trim()) {
      toast.error('Blog content is required');
      return;
    }
    if (!newBlogExcerpt.trim()) {
      toast.error('Blog excerpt is required');
      return;
    }

    const newBlog = {
      id: `blog-${Date.now()}`,
      title: newBlogTitle,
      excerpt: newBlogExcerpt,
      content: newBlogContent,
      featuredImage: newBlogFeaturedImage || 'https://via.placeholder.com/600x400?text=' + encodeURIComponent(newBlogTitle),
      category: newBlogCategory,
      authorId: user?.id || 'unknown',
      authorName: user?.email?.split('@')[0] || 'Author',
      published: false,
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTime: '5 min',
    };

    setBlogsList([...blogsList, newBlog]);

    toast.success(`Blog "${newBlogTitle}" created!`, {
      description: 'You can now edit and publish it',
    });

    setNewBlogTitle('');
    setNewBlogContent('');
    setNewBlogExcerpt('');
    setNewBlogFeaturedImage('');
    setNewBlogCategory('Technology');
    setCreateOpen(false);
  };

  const handleShare = (blogId: string, blogTitle: string) => {
    const url = `${window.location.origin}/blogs/${blogId}`;
    setShareUrl(url);
    setShareOpen(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteBlog = (blogId: string, blogTitle: string) => {
    setBlogToDelete({ id: blogId, title: blogTitle });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBlog = () => {
    if (blogToDelete) {
      setBlogsList(blogsList.filter(b => b.id !== blogToDelete.id));
      toast.success(`Blog "${blogToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const BlogCard = ({ blog, index }: { blog: typeof blogs[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
        <div className="relative h-40 overflow-hidden">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className={`${blog.published ? 'bg-[#2C3E6B]' : 'bg-[#7A766F]'} text-white rounded-md text-[10px] font-medium shadow-sm`}>
              {blog.published ? 'Published' : 'Draft'}
            </Badge>
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => handleShare(blog.id, blog.title)} className="bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white rounded-lg h-7 w-7 p-0 shadow-sm">
                <Share2 className="w-3 h-3" />
              </Button>
              <Button size="sm" onClick={() => handleDeleteBlog(blog.id, blog.title)} className="rounded-lg h-7 w-7 p-0 shadow-sm bg-white/90 backdrop-blur-sm text-purple-600 hover:bg-white">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Badge variant="secondary" className="text-[10px] rounded bg-[#2C3E6B]/[0.05] text-[#2C3E6B]/60 px-1.5 py-0.5 font-medium mb-2">{blog.category}</Badge>
          <h3 className="font-semibold text-[#1A1F2E] mb-1.5 line-clamp-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{blog.title}</h3>
          <p className="text-xs text-[#7A766F] line-clamp-2 mb-3">{blog.excerpt}</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <Eye className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E]">{blog.views}</span>
              <p className="text-[10px] text-[#7A766F]">Views</p>
            </div>
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <MessageSquare className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E]">{blog.comments}</span>
              <p className="text-[10px] text-[#7A766F]">Comments</p>
            </div>
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <Calendar className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E] text-[10px]">{blog.readTime}</span>
              <p className="text-[10px] text-[#7A766F]">Read Time</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BackButton />
                <h1 className="text-3xl font-bold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Manage Blogs</h1>
              </div>
              <p className="text-[#7A766F] text-sm">Create, manage, and publish blog posts</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg shadow-purple-600/20">
              <Plus className="w-4 h-4 mr-2" />New Blog Post
            </Button>
          </div>

          {/* Search & View Toggle */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A766F]" />
              <Input
                placeholder="Search blogs by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg border-slate-200 bg-white"
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                className={`rounded ${viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                onClick={() => setViewMode('kanban')}
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                className={`rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Published Blogs Section */}
        {publishedBlogs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <h2 className="text-lg font-bold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Published ({publishedBlogs.length})</h2>
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedBlogs.map((blog, i) => (
                  <BlogCard key={blog.id} blog={blog} index={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {publishedBlogs.map((blog) => (
                  <Card key={blog.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                    <img src={blog.featuredImage} alt={blog.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A1F2E] truncate">{blog.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#7A766F]">
                        <User className="w-3 h-3" />{blog.authorName}
                        <Calendar className="w-3 h-3" />{new Date(blog.createdAt).toLocaleDateString()}
                        <Badge variant="secondary" className="text-[10px]">{blog.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" onClick={() => handleShare(blog.id, blog.title)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteBlog(blog.id, blog.title)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Draft Blogs Section */}
        {draftBlogs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-lg font-bold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Drafts ({draftBlogs.length})</h2>
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftBlogs.map((blog, i) => (
                  <BlogCard key={blog.id} blog={blog} index={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {draftBlogs.map((blog) => (
                  <Card key={blog.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                    <img src={blog.featuredImage} alt={blog.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A1F2E] truncate">{blog.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#7A766F]">
                        <User className="w-3 h-3" />{blog.authorName}
                        <Calendar className="w-3 h-3" />{new Date(blog.createdAt).toLocaleDateString()}
                        <Badge variant="secondary" className="text-[10px]">{blog.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" onClick={() => handleShare(blog.id, blog.title)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteBlog(blog.id, blog.title)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-slate-50 rounded-2xl">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No blogs yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start creating blog posts to engage your audience</p>
            <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />Create First Blog
            </Button>
          </motion.div>
        )}
      </div>

      {/* Create Blog Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create New Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Blog Title *</Label>
              <Input
                value={newBlogTitle}
                onChange={(e) => setNewBlogTitle(e.target.value)}
                placeholder="Enter blog title..."
                className="rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Excerpt *</Label>
              <Textarea
                value={newBlogExcerpt}
                onChange={(e) => setNewBlogExcerpt(e.target.value)}
                placeholder="Brief summary of your blog post..."
                rows={3}
                className="rounded-lg border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={newBlogContent}
                onChange={(e) => setNewBlogContent(e.target.value)}
                placeholder="Write your blog content here..."
                rows={8}
                className="rounded-lg border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={newBlogCategory}
                  onChange={(e) => setNewBlogCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option>Technology</option>
                  <option>Education</option>
                  <option>Business</option>
                  <option>Lifestyle</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input
                  value={newBlogFeaturedImage}
                  onChange={(e) => setNewBlogFeaturedImage(e.target.value)}
                  placeholder="https://..."
                  className="rounded-lg border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleCreate} className="bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />Create Blog Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Share Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="rounded-lg border-slate-200" />
              <Button
                onClick={handleCopy}
                className={`${copied ? 'bg-green-500' : 'bg-purple-600'} text-white rounded-lg transition-colors`}
              >
                {copied ? '✓' : 'Copy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-purple-700 text-xl font-bold">Delete Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                Are you sure you want to delete <span className="font-semibold">"{blogToDelete?.title}"</span>?
              </p>
              <p className="text-xs text-purple-700 mt-2 font-medium">Warning: This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={confirmDeleteBlog} className="bg-purple-600 text-white rounded-lg hover:bg-purple-700">Delete Blog Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
