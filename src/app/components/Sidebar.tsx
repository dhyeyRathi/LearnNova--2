import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { BookOpen, LayoutDashboard, Zap, HelpCircle, Settings, Crown, Trophy, Video, ChevronLeft, ChevronRight, UsersRound, User, FileText } from 'lucide-react';
import { getBadgeLevel } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const badge = user ? getBadgeLevel(user.points) : null;

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
    { to: '/admin/blogs', icon: FileText, label: 'Blogs' },
    { to: '/admin/users', icon: UsersRound, label: 'Users' },
    { to: '/admin/options', icon: Settings, label: 'Options' },
    { to: '/admin/reports', icon: Zap, label: 'Reports' },
    { to: '/admin/applications', icon: Crown, label: 'Applications' },
  ];

  const navItems = user.role === 'learner' ? learnerNavItems : user.role === 'tutor' ? tutorNavItems : adminNavItems;
  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'tutor' ? 'Instructor' : 'Learner';

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col flex-shrink-0 fixed left-0 top-[56px] bottom-0 bg-white border-r border-[#E5E2DC]/70 z-40 overflow-hidden"
    >
      {/* Role badge */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-red-100 rounded-lg overflow-hidden">
          <div className="w-5 h-5 rounded bg-red-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] text-white font-medium">{roleLabel.charAt(0)}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-xs font-medium text-red-600 whitespace-nowrap">
                {roleLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-1.5 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/profile' && location.pathname.startsWith(item.to + '/'));
          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg transition-all duration-150 relative ${
                  isActive ? 'bg-red-500 text-white' : 'text-[#7A766F] hover:bg-red-100 hover:text-red-600'
                }`}
              >
                <item.icon className="w-[16px] h-[16px] flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className={`text-[13px] whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Learner badge */}
      {user.role === 'learner' && badge && !collapsed && (
        <div className="px-3 pb-2">
          <div className="p-2.5 rounded-lg bg-red-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{badge.icon}</span>
              <span className="text-xs font-medium text-red-600">{badge.level}</span>
            </div>
            <p className="text-[11px] text-[#7A766F]">{user.points} points</p>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2.5 pb-3 pt-1 border-t border-[#E5E2DC]/50">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-1.5 text-[#7A766F] hover:bg-red-100 hover:text-red-600 rounded-lg h-7">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          <AnimatePresence>
            {!collapsed && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px]">Collapse</motion.span>)}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
}
