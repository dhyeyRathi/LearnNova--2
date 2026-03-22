import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { GraduationCap, LogOut, User, Award, Menu, X } from 'lucide-react';
import { getBadgeLevel } from '../data/mockData';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const badge = user ? getBadgeLevel(user.points) : null;

  const publicNavItems = [
    { to: '/programs', label: 'Programs' },
    { to: '/blogs', label: 'Blogs' },
    { to: '/apply-tutor', label: 'Become a Tutor' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#E5E2DC]/70 h-[56px]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-red-400 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[20px] text-red-600 tracking-tight font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>
              LearnNova
            </span>
          </Link>

          {/* Public nav */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-0.5">
              {publicNavItems.map(item => (
                <Link key={item.label} to={item.to}>
                  <Button variant="ghost" className={`rounded-lg text-[13px] h-8 px-3 ${
                    location.pathname === item.to
                      ? 'text-red-600 font-medium'
                      : 'text-[#7A766F] hover:bg-red-100 hover:text-red-600'
                  }`}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            )}

            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" onClick={handleLogout} className="hidden sm:flex items-center text-[13px] text-[#7A766F] hover:text-[#B5403A] hover:bg-[#B5403A]/[0.06] rounded-lg h-8 px-3">
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 ring-2 ring-red-500/20 hover:ring-red-500/40 transition-all">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-[#E5E2DC] bg-white p-1">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-[#1A1F2E]">{user.name}</p>
                      <p className="text-xs text-[#7A766F] mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-red-600 capitalize">{user.role}</span>
                    </div>
                    <DropdownMenuSeparator className="bg-[#E5E2DC]/60" />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg text-[13px] cursor-pointer text-[#1A1F2E]">
                      <User className="w-3.5 h-3.5 mr-2 text-[#7A766F]" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E5E2DC]/60" />
                    <DropdownMenuSeparator className="bg-[#E5E2DC]/60" />
                    <DropdownMenuItem onClick={handleLogout} className="text-[#B5403A] sm:hidden rounded-lg text-[13px] cursor-pointer">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-8 px-4 text-[13px] font-medium">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && !isAuthenticated && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-[#E5E2DC]/60 bg-white">
            <div className="px-4 py-2 space-y-0.5">
              {publicNavItems.map(item => (
                <Link key={item.label} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[13px] text-[#7A766F] hover:text-[#2C3E6B] hover:bg-[#2C3E6B]/[0.04] rounded-lg h-9">{item.label}</Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
