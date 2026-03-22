import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { BookOpen, LayoutDashboard, Zap, HelpCircle, Settings, Crown, Trophy, Video, Menu, X, UsersRound, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) return <><Navbar /><div className="pt-[56px]">{children}</div></>;

  const learnerNavItems = [
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/my-courses', icon: LayoutDashboard, label: 'My Courses' },
    { to: '/quizzes', icon: HelpCircle, label: 'Quizzes' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];
  const tutorNavItems = [
    { to: '/dashboard/instructor', icon: LayoutDashboard, label: 'Courses' },
    { to: '/instructor/quizzes', icon: HelpCircle, label: 'Quiz' },
    { to: '/instructor/meetings', icon: Video, label: 'Meetings' },
    { to: '/instructor/reports', icon: Zap, label: 'Reports' },
  ];
  const adminNavItems = [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Courses' },
    { to: '/admin/quizzes', icon: HelpCircle, label: 'Quiz' },
    { to: '/admin/users', icon: UsersRound, label: 'Users' },
    { to: '/admin/options', icon: Settings, label: 'Options' },
    { to: '/admin/reports', icon: Zap, label: 'Reports' },
    { to: '/admin/applications', icon: Crown, label: 'Applications' },
  ];
  const navItems = user.role === 'learner' ? learnerNavItems : user.role === 'tutor' ? tutorNavItems : adminNavItems;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />

      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-20 left-4 z-50">
        <Button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="w-10 h-10 rounded-xl bg-red-500 text-white shadow-lg p-0">
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 bg-[#1A1F2E]/15 backdrop-blur-sm z-40 md:hidden" />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }} className="fixed top-[56px] left-0 bottom-0 w-[240px] bg-white border-r border-[#E5E2DC] shadow-lg z-50 md:hidden overflow-y-auto">
              <nav className="px-3 py-4 space-y-0.5">
                {navItems.map(item => {
                  const isActive = location.pathname === item.to || (item.to !== '/profile' && location.pathname.startsWith(item.to + '/'));
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setMobileSidebarOpen(false)}>
                      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-red-500 text-white font-medium' : 'text-[#7A766F] hover:bg-red-100 hover:text-red-600'}`}>
                        <item.icon className="w-4 h-4" />
                        <span className="text-[13px]">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content — offset by navbar height + sidebar width */}
      <main className="pt-[56px] md:ml-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
