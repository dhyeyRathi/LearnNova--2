import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { Search, Clock, ArrowRight, Sparkles, BookOpen, User } from 'lucide-react';

const blogPosts = [
  {
    id: 'blog-1',
    title: 'The Future of Frontend Development in 2026',
    excerpt: 'React Server Components, AI-assisted coding, and the rise of edge computing are transforming how we build web apps. Here\'s what every frontend developer needs to know.',
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: 'Frontend',
    author: 'Sarah Williams',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    date: 'Mar 18, 2026',
    readTime: '8 min read',
  },
  {
    id: 'blog-2',
    title: 'Building Scalable APIs with Node.js and GraphQL',
    excerpt: 'Learn how to design and implement production-ready GraphQL APIs that scale gracefully under load with real-world patterns and best practices.',
    cover: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    category: 'Backend',
    author: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    date: 'Mar 15, 2026',
    readTime: '12 min read',
  },
  {
    id: 'blog-3',
    title: 'Getting Started with Machine Learning: A Beginner\'s Roadmap',
    excerpt: 'From Python basics to your first neural network — a practical, no-nonsense guide to entering the world of data science and AI.',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    category: 'Data Science',
    author: 'Priya Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    date: 'Mar 12, 2026',
    readTime: '10 min read',
  },
  {
    id: 'blog-4',
    title: 'Cybersecurity Essentials Every Developer Should Know',
    excerpt: 'XSS, CSRF, SQL injection, and more — understand the top security vulnerabilities and how to protect your applications from day one.',
    cover: 'https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGlnaXRhbCUyMGxvY2t8ZW58MXx8fHwxNzc0MTEyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cybersecurity',
    author: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: 'Mar 10, 2026',
    readTime: '7 min read',
  },
  {
    id: 'blog-5',
    title: 'Why Design Systems Matter for Developers',
    excerpt: 'Design systems aren\'t just for designers. Learn how adopting a shared component library can 10x your team\'s velocity and product consistency.',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    category: 'UI/UX',
    author: 'Sarah Williams',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    date: 'Mar 8, 2026',
    readTime: '6 min read',
  },
  {
    id: 'blog-6',
    title: 'DevOps in 2026: CI/CD, Containers, and Beyond',
    excerpt: 'Docker, Kubernetes, GitHub Actions, and the latest in cloud-native infrastructure. A comprehensive overview of the modern DevOps landscape.',
    cover: 'https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHNlcnZlciUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc0MDAyODY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'DevOps',
    author: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    date: 'Mar 5, 2026',
    readTime: '9 min read',
  },
];

const categories = ['All', 'Frontend', 'Backend', 'Data Science', 'Cybersecurity', 'UI/UX', 'DevOps'];

export default function BlogsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = blogPosts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">
        {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-100/15 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '-2s' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">Latest Articles</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-slate-800">Insights & </span>
            <span className="text-purple-600">Tutorials</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">Stay ahead with the latest in tech, tutorials, and industry insights from our expert community.</p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="pl-12 h-13 glass-card rounded-2xl border-white/40 shadow-lg" />
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} onClick={() => setActiveCategory(cat)}
              className={`rounded-xl ${activeCategory === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : ''}`}>
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {filtered.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto overflow-hidden">
                <img src={filtered[0].cover} alt={filtered[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="self-start bg-purple-50 text-purple-700 rounded-lg mb-4">{filtered[0].category}</Badge>
                <h2 className="text-3xl font-bold text-slate-800 mb-3 group-hover:text-purple-700 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{filtered[0].title}</h2>
                <p className="text-slate-500 mb-6 leading-relaxed">{filtered[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={filtered[0].authorAvatar} alt={filtered[0].author} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{filtered[0].author}</p>
                      <p className="text-xs text-slate-400">{filtered[0].date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{filtered[0].readTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1).map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-3xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all relative">
              <div className="h-48 overflow-hidden">
                <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-purple-700 rounded-lg shadow">{post.category}</Badge>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{post.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={post.authorAvatar} alt={post.author} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-xs text-slate-600 font-medium">{post.author}</span>
                  </div>
                  <span className="text-xs text-slate-400">{post.readTime}</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No articles found</h3>
            <p className="text-slate-500">Try a different search or category</p>
          </motion.div>
        )}
      </section>
      </div>
    </DashboardLayout>
  );
}