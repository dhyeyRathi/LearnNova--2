import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'motion/react';
import { Heart, Target, Lightbulb, Users, Globe, Award, Sparkles } from 'lucide-react';

const team = [
  { name: 'Michael Chen', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300', bio: 'Passionate about making education accessible.' },
  { name: 'Sarah Williams', role: 'Head of Education', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', bio: '10+ years in edtech and curriculum design.' },
  { name: 'Alex Rivera', role: 'Lead Engineer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', bio: 'Building scalable platforms for learners worldwide.' },
  { name: 'Priya Sharma', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', bio: 'Crafting delightful learning experiences.' },
];

const values = [
  { icon: Heart, title: 'Learner First', desc: 'Every decision we make starts with the learner. Their success is our mission.', color: 'bg-red-500' },
  { icon: Target, title: 'Quality Content', desc: 'We partner with industry experts to deliver courses that truly matter.', color: 'bg-red-500' },
  { icon: Lightbulb, title: 'Innovation', desc: 'We constantly push boundaries to make learning more engaging and effective.', color: 'bg-red-500' },
  { icon: Globe, title: 'Accessibility', desc: 'Education should be available to everyone, everywhere, at any time.', color: 'bg-red-500' },
];

const milestones = [
  { year: '2023', title: 'Founded', desc: 'LearnNova was born from a simple idea: make tech education better.' },
  { year: '2024', title: '10K Learners', desc: 'Crossed 10,000 active learners across 50+ countries.' },
  { year: '2025', title: '100+ Courses', desc: 'Expanded our catalog to over 100 courses with 50+ expert tutors.' },
  { year: '2026', title: 'AI-Powered', desc: 'Launched personalized learning paths powered by AI.' },
];

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/15 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '-3s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-6">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Our Story</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-slate-800">Empowering the world to </span>
            <span className="text-red-500">learn & grow</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            LearnNova is an edtech platform built by educators and engineers who believe that quality tech education should be accessible, engaging, and transformative.
          </p>
        </motion.div>
      </section>

      {/* Mission image */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden h-80 shadow-2xl shadow-red-400/10">
          <img src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBsZWFybmluZyUyMGxhcHRvcHxlbnwxfHx8fDE3NzQxMTIxMTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Students learning" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-red-900/60 flex items-end p-10">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our mission is to democratize tech education for everyone.</h2>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Values</h2>
          <p className="text-slate-500 max-w-xl mx-auto">The principles that guide everything we build.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-3xl p-6 group hover:shadow-xl transition-all relative overflow-hidden">
              <div className={`w-14 h-14 rounded-2xl ${v.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <v.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our Journey</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-400 hidden md:block" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`flex items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="flex-1 glass-card rounded-2xl p-6">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">{m.year}</span>
                  <h4 className="text-lg font-bold text-slate-800 mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{m.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{m.desc}</p>
                </div>
                <div className="hidden md:flex w-4 h-4 rounded-full bg-red-500 ring-4 ring-white shadow-lg flex-shrink-0" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Meet the Team</h2>
          <p className="text-slate-500">The humans behind LearnNova.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-3xl p-6 text-center group hover:shadow-xl transition-all">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img src={t.img} alt={t.name} className="w-full h-full rounded-2xl object-cover ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.name}</h4>
              <p className="text-sm text-red-500 font-medium mb-2">{t.role}</p>
              <p className="text-xs text-slate-500">{t.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="glass-card rounded-3xl p-10 bg-red-500 text-white text-center shadow-2xl shadow-red-500/20">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LearnNova in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '50+', label: 'Courses' },
              { value: '10K+', label: 'Learners' },
              { value: '50+', label: 'Expert Tutors' },
              { value: '95%', label: 'Satisfaction' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
                <p className="text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-100">
        <p className="text-sm text-slate-400">© 2026 LearnNova. All rights reserved.</p>
      </footer>
      </div>
    </DashboardLayout>
  );
}