import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) navigate('/login');
    else navigate('/my-courses');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4">
        {/* Hero */}
        <section className="relative py-20 sm:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-4 leading-[1.12] tracking-tight text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Learn without limits
            </h1>
            <p className="text-base sm:text-lg text-[#7A766F] mb-10 max-w-lg mx-auto leading-relaxed">
              Master in-demand skills with world-class courses. Interactive lessons, real-time feedback, and a community that inspires.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              {!isAuthenticated && (
                <Button onClick={handleGetStarted} className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  Start Learning Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {isAuthenticated && (
                <Button onClick={handleGetStarted} className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  View My Courses <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto py-20 px-0">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Why Choose LearnNova?</h2>
            <p className="text-lg text-[#7A766F] max-w-2xl mx-auto">We provide everything you need to achieve your learning goals and advance your career</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience' },
              { icon: Users, title: 'Active Community', desc: 'Connect with learners, ask questions, and grow together' },
              { icon: Zap, title: 'Self-Paced Learning', desc: 'Study at your own speed, anytime and anywhere you want' },
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-[#E5E2DC] p-8 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-700" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1F2E] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h3>
                <p className="text-[#7A766F]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto py-20 px-0 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1A1F2E] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ready to start learning?</h2>
            <p className="text-lg text-[#7A766F] mb-8 max-w-2xl mx-auto">Join thousands of learners transforming their careers with LearnNova</p>
            <Button onClick={handleGetStarted} className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-base font-medium">
              Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </section>
      </div>
    </DashboardLayout>
  );
}
