import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSent(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-red-200/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-red-200/15 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '-2s' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-6">
            <MessageCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-slate-800">We'd love to </span>
            <span className="text-red-600">hear from you</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Have a question, feedback, or partnership inquiry? Drop us a message and we'll respond within 24 hours.</p>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-[1fr_340px] gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {sent ? (
              <Card className="glass-card rounded-3xl p-12 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Message Sent!</h3>
                <p className="text-slate-500 mb-6">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                <Button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} variant="outline" className="rounded-xl">
                  Send Another Message
                </Button>
              </Card>
            ) : (
              <Card className="glass-card rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your message..." rows={6} className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-red-500 text-white rounded-xl shadow-xl shadow-red-400/20">
                    <Send className="w-4 h-4 mr-2" /> Send Message
                  </Button>
                </form>
              </Card>
            )}
          </motion.div>

          {/* Info sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            {[
              { icon: Mail, title: 'Email', info: 'hello@learnnova.com', desc: 'For general inquiries', color: 'bg-red-500' },
              { icon: Phone, title: 'Phone', info: '+1 (555) 123-4567', desc: 'Mon - Fri, 9am - 6pm EST', color: 'bg-red-500' },
              { icon: MapPin, title: 'Office', info: 'San Francisco, CA', desc: '123 Innovation Way, Suite 400', color: 'bg-red-500' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <Card className="glass-card rounded-2xl p-5 group hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.title}</h4>
                      <p className="text-red-600 font-medium text-sm">{item.info}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <Card className="glass-card rounded-2xl p-6 bg-red-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-slate-800">FAQ</h4>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { q: 'How do I become a tutor?', a: 'Click "Become a Tutor" in the nav to apply.' },
                  { q: 'Are courses free?', a: 'Many are! Some premium programs require payment.' },
                  { q: 'Can I get a refund?', a: 'Yes, within 30 days of enrollment.' },
                ].map(faq => (
                  <div key={faq.q}>
                    <p className="font-medium text-slate-700">{faq.q}</p>
                    <p className="text-slate-500 text-xs">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      </div>
    </DashboardLayout>
  );
}