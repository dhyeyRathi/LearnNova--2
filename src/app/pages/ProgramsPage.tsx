import { useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { Search, Clock, Star, Users, ArrowRight, Sparkles, Code, Server, Smartphone, Database, Shield, Palette, Cloud, Cpu, BookOpen } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  cover: string;
  category: string;
  courseCount: number;
  duration: string;
  level: string;
  rating: number;
  students: number;
  icon: React.ElementType;
  color: string;
  courses: { title: string; duration: string }[];
}

const programs: Program[] = [
  {
    id: 'prog-frontend',
    title: 'Frontend Development',
    description: 'Master modern UI development with React, TypeScript, Next.js, and advanced CSS. Build stunning, performant web applications from scratch.',
    cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    category: 'Frontend',
    courseCount: 8,
    duration: '60 hours',
    level: 'Beginner to Advanced',
    rating: 4.9,
    students: 3420,
    icon: Code,
    color: 'from-red-500 to-amber-500',
    courses: [
      { title: 'HTML & CSS Fundamentals', duration: '6h' },
      { title: 'JavaScript Essentials', duration: '8h' },
      { title: 'React & TypeScript', duration: '12h' },
      { title: 'Advanced React Patterns', duration: '8h' },
      { title: 'Next.js Full-Stack', duration: '10h' },
      { title: 'CSS Animations & Motion', duration: '5h' },
      { title: 'Testing with Jest & RTL', duration: '6h' },
      { title: 'Frontend Capstone Project', duration: '5h' },
    ],
  },
  {
    id: 'prog-backend',
    title: 'Backend Development',
    description: 'Learn to build robust server-side applications with Node.js, Express, databases, REST APIs, GraphQL, and microservices architecture.',
    cover: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    category: 'Backend',
    courseCount: 7,
    duration: '55 hours',
    level: 'Intermediate',
    rating: 4.8,
    students: 2890,
    icon: Server,
    color: 'from-emerald-500 to-green-500',
    courses: [
      { title: 'Node.js Fundamentals', duration: '8h' },
      { title: 'Express.js & REST APIs', duration: '8h' },
      { title: 'PostgreSQL & Database Design', duration: '7h' },
      { title: 'MongoDB & NoSQL', duration: '6h' },
      { title: 'GraphQL API Development', duration: '8h' },
      { title: 'Authentication & Security', duration: '6h' },
      { title: 'Microservices Architecture', duration: '12h' },
    ],
  },
  {
    id: 'prog-fullstack',
    title: 'Full-Stack Development',
    description: 'Become a complete developer. Combine frontend and backend skills to build end-to-end applications with modern tech stacks.',
    cover: 'https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZyUyMGRldmVsb3BlcnxlbnwxfHx8fDE3NzQxMTIxMTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Full-Stack',
    courseCount: 10,
    duration: '80 hours',
    level: 'Beginner to Advanced',
    rating: 4.9,
    students: 4150,
    icon: Cpu,
    color: 'from-red-500 to-amber-500',
    courses: [
      { title: 'Web Development Bootcamp', duration: '10h' },
      { title: 'React Frontend', duration: '10h' },
      { title: 'Node.js Backend', duration: '8h' },
      { title: 'Database Integration', duration: '7h' },
      { title: 'API Design Patterns', duration: '6h' },
      { title: 'DevOps Basics for Devs', duration: '6h' },
      { title: 'Real-time Apps with WebSockets', duration: '5h' },
      { title: 'Performance Optimization', duration: '5h' },
      { title: 'Testing & CI/CD', duration: '8h' },
      { title: 'Full-Stack Capstone', duration: '15h' },
    ],
  },
  {
    id: 'prog-mobile',
    title: 'Mobile App Development',
    description: 'Build cross-platform mobile apps with React Native and Flutter. Deploy to iOS and Android with a single codebase.',
    cover: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    category: 'Mobile',
    courseCount: 6,
    duration: '45 hours',
    level: 'Intermediate',
    rating: 4.7,
    students: 1870,
    icon: Smartphone,
    color: 'from-red-500 to-amber-500',
    courses: [
      { title: 'React Native Essentials', duration: '10h' },
      { title: 'Navigation & State', duration: '7h' },
      { title: 'Native APIs & Permissions', duration: '6h' },
      { title: 'Animations & Gestures', duration: '5h' },
      { title: 'App Store Deployment', duration: '5h' },
      { title: 'Mobile Capstone Project', duration: '12h' },
    ],
  },
  {
    id: 'prog-data',
    title: 'Data Science & AI',
    description: 'Dive into data analysis, machine learning, and AI with Python. From pandas to TensorFlow, master the tools of data science.',
    cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    category: 'Data Science',
    courseCount: 8,
    duration: '70 hours',
    level: 'Intermediate to Advanced',
    rating: 4.8,
    students: 3210,
    icon: Database,
    color: 'from-amber-500 to-orange-500',
    courses: [
      { title: 'Python for Data Science', duration: '8h' },
      { title: 'Statistics & Probability', duration: '7h' },
      { title: 'Pandas & Data Wrangling', duration: '8h' },
      { title: 'Data Visualization', duration: '6h' },
      { title: 'Machine Learning Fundamentals', duration: '12h' },
      { title: 'Deep Learning with TensorFlow', duration: '10h' },
      { title: 'NLP & Text Analysis', duration: '8h' },
      { title: 'AI Capstone Project', duration: '11h' },
    ],
  },
  {
    id: 'prog-devops',
    title: 'DevOps & Cloud',
    description: 'Master CI/CD pipelines, Docker, Kubernetes, AWS, and cloud-native infrastructure. Automate everything.',
    cover: 'https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHNlcnZlciUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc0MDAyODY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'DevOps',
    courseCount: 6,
    duration: '50 hours',
    level: 'Intermediate',
    rating: 4.7,
    students: 1560,
    icon: Cloud,
    color: 'from-red-500 to-amber-500',
    courses: [
      { title: 'Linux & Command Line', duration: '6h' },
      { title: 'Docker & Containerization', duration: '8h' },
      { title: 'Kubernetes in Action', duration: '10h' },
      { title: 'CI/CD with GitHub Actions', duration: '7h' },
      { title: 'AWS Cloud Essentials', duration: '10h' },
      { title: 'Monitoring & Observability', duration: '9h' },
    ],
  },
  {
    id: 'prog-cyber',
    title: 'Cybersecurity',
    description: 'Protect applications and networks. Learn ethical hacking, penetration testing, and security best practices.',
    cover: 'https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGlnaXRhbCUyMGxvY2t8ZW58MXx8fHwxNzc0MTEyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cybersecurity',
    courseCount: 5,
    duration: '40 hours',
    level: 'Intermediate',
    rating: 4.6,
    students: 1340,
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    courses: [
      { title: 'Network Security Basics', duration: '7h' },
      { title: 'Web Application Security', duration: '8h' },
      { title: 'Ethical Hacking & Pen Testing', duration: '10h' },
      { title: 'Cryptography Essentials', duration: '7h' },
      { title: 'Incident Response & Forensics', duration: '8h' },
    ],
  },
  {
    id: 'prog-uiux',
    title: 'UI/UX Design',
    description: 'Design beautiful, user-friendly interfaces. Master Figma, design systems, prototyping, and user research.',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    category: 'Design',
    courseCount: 6,
    duration: '42 hours',
    level: 'Beginner',
    rating: 4.9,
    students: 2780,
    icon: Palette,
    color: 'from-red-500 to-amber-500',
    courses: [
      { title: 'Design Principles & Theory', duration: '5h' },
      { title: 'Figma Mastery', duration: '8h' },
      { title: 'Typography & Color Theory', duration: '6h' },
      { title: 'User Research & Testing', duration: '7h' },
      { title: 'Design Systems', duration: '8h' },
      { title: 'Prototyping & Handoff', duration: '8h' },
    ],
  },
];

const categoryFilters = ['All', 'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'Data Science', 'DevOps', 'Cybersecurity', 'Design'];

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const filtered = programs.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-10 left-20 w-72 h-72 bg-red-100/10 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/15 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '-3s' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-6">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Professional Programs</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-slate-800">Structured </span>
            <span className="text-red-500">learning paths</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">Comprehensive, career-focused programs designed by industry experts. From beginner to job-ready in months, not years.</p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..." className="pl-12 h-13 glass-card rounded-2xl border-white/40 shadow-lg" />
          </div>
        </motion.div>
      </section>

      {/* Category Filters */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categoryFilters.map(cat => (
            <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} onClick={() => setActiveCategory(cat)}
              className={`rounded-xl text-sm ${activeCategory === cat ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : ''}`}>
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Programs Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="space-y-6">
          {filtered.map((program, i) => (
            <motion.div key={program.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="glass-card rounded-3xl overflow-hidden group hover:shadow-xl transition-all">
                <div className="grid md:grid-cols-[320px_1fr]">
                  {/* Image */}
                  <div className="h-56 md:h-auto overflow-hidden relative">
                    <img src={program.cover} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:bg-gradient-to-t md:from-black/50 md:to-transparent" />
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg`}>
                      <program.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className="bg-red-50 text-red-600 rounded-lg mb-2">{program.category}</Badge>
                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {program.title}
                        </h2>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-700">{program.rating}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 mb-4 leading-relaxed">{program.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-red-400" /><span>{program.courseCount} courses</span></div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /><span>{program.duration}</span></div>
                      <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-red-400" /><span>{program.students.toLocaleString()} students</span></div>
                      <Badge variant="secondary" className="rounded-lg">{program.level}</Badge>
                    </div>

                    {/* Expandable course list */}
                    {expandedProgram === program.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                        <div className="bg-slate-50/80 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Courses Included</p>
                          {program.courses.map((course, ci) => (
                            <div key={ci} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">{ci + 1}</span>
                                <span className="text-sm text-slate-700">{course.title}</span>
                              </div>
                              <span className="text-xs text-slate-400">{course.duration}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-center gap-3">
                      <Button onClick={() => navigate('/courses')} className={`bg-gradient-to-r ${program.color} text-white rounded-xl shadow-lg hover:shadow-xl`}>
                        Explore Program <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)} className="rounded-xl">
                        {expandedProgram === program.id ? 'Hide Courses' : 'View Courses'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-red-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No programs found</h3>
            <p className="text-slate-500">Try a different search or category</p>
          </motion.div>
        )}
      </section>
      </div>
    </DashboardLayout>
  );
}