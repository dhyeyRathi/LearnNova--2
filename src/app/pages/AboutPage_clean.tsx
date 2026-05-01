import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-100/15 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '-3s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">Our Story</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-slate-800">Empowering the world to </span>
            <span className="text-purple-600">learn & grow</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            LearnNova is an edtech platform built by educators and engineers who believe that quality tech education should be accessible, engaging, and transformative.
          </p>
        </motion.div>
      </section>

      {/* Mission image */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden h-80 shadow-2xl shadow-purple-500/10">
          <img src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Students learning" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-purple-900/60 flex items-end p-10">
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Our mission is to democratize tech education for everyone.</h2>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-100">
        <p className="text-sm text-slate-400">© 2026 LearnNova. All rights reserved.</p>
      </footer>
      </div>
    </DashboardLayout>
  );
}
