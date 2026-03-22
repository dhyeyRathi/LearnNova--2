import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { users as mockUsers, enrollments, userProgress, courses, getBadgeLevel } from '../../data/mockData';
import {
  Search, UsersRound, Shield, GraduationCap, BookOpen, MoreHorizontal,
  Mail, Pencil, Trash2, UserCheck, UserX, ChevronDown, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'tutor' | 'admin';
  points: number;
  avatar?: string;
  status: 'active' | 'disabled';
  joinedAt: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'tutor' | 'admin'>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<'learner' | 'tutor' | 'admin'>('learner');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() =>
    mockUsers.map(u => ({
      ...u,
      status: 'active' as const,
      joinedAt: '2026-01-15',
    }))
  );

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center bg-white rounded-xl border border-[#DDD6CC] p-10">
            <h2 className="text-xl font-semibold text-[#2C3E6B] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Access Required</h2>
            <p className="text-sm text-[#7A766F] mb-4">Only administrators can manage users.</p>
            <Button onClick={() => navigate('/courses')} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-sm">Go to Courses</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getUserEnrollmentCount = (userId: string) => enrollments.filter(e => e.userId === userId).length;
  const getUserCourseCount = (userId: string) => courses.filter(c => c.instructorId === userId).length;

  const filteredUsers = useMemo(() => {
    return managedUsers.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [managedUsers, roleFilter, searchQuery]);

  const roleCounts = {
    all: managedUsers.length,
    learner: managedUsers.filter(u => u.role === 'learner').length,
    tutor: managedUsers.filter(u => u.role === 'tutor').length,
    admin: managedUsers.filter(u => u.role === 'admin').length,
  };

  const handleToggleStatus = (userId: string) => {
    setManagedUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'disabled' : 'active';
        toast.success(`User ${u.name} ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleEditRole = (u: ManagedUser) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingUser) return;
    setManagedUsers(prev => prev.map(u =>
      u.id === editingUser.id ? { ...u, role: editRole } : u
    ));
    toast.success(`${editingUser.name}'s role updated to ${editRole}`);
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (userId: string) => {
    if (deleteConfirm === userId) {
      const u = managedUsers.find(u => u.id === userId);
      setManagedUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(`User ${u?.name} deleted`);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'tutor': return <GraduationCap className="w-3 h-3" />;
      default: return <BookOpen className="w-3 h-3" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C3E6B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                User Management
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C3E6B]/[0.06] text-[#2C3E6B] rounded-md text-xs font-medium">
                <Shield className="w-3.5 h-3.5" /> Admin Only
              </span>
            </div>
            <p className="text-sm text-[#7A766F]">View and manage all platform users, roles, and access</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {([
            { key: 'all', label: 'All Users', icon: UsersRound },
            { key: 'learner', label: 'Learners', icon: BookOpen },
            { key: 'tutor', label: 'Tutors', icon: GraduationCap },
            { key: 'admin', label: 'Admins', icon: Shield },
          ] as const).map(stat => (
            <Card
              key={stat.key}
              onClick={() => setRoleFilter(stat.key)}
              className={`p-4 rounded-lg cursor-pointer transition-all border ${
                roleFilter === stat.key
                  ? 'border-[#2C3E6B]/30 bg-[#2C3E6B]/[0.03]'
                  : 'border-[#E5E2DC] bg-white hover:border-[#D8D4CD]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#2C3E6B]/[0.06] flex items-center justify-center mb-2.5">
                <stat.icon className="w-4 h-4 text-[#2C3E6B]" />
              </div>
              <p className="text-xl font-semibold text-[#2C3E6B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {roleCounts[stat.key]}
              </p>
              <p className="text-xs text-[#7A766F]">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766F]/50" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 h-10 bg-white rounded-lg border-[#E5E2DC] text-sm"
            />
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] text-[#7A766F] uppercase tracking-wider font-medium">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Activity</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <AnimatePresence>
            {filteredUsers.map((u, i) => {
              const badge = u.role === 'learner' ? getBadgeLevel(u.points) : null;
              const isCurrentUser = u.id === user.id;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`p-4 rounded-lg border transition-all ${u.status === 'disabled' ? 'bg-[#F7F6F3]/50 border-[#E5E2DC]/50 opacity-60' : 'bg-white border-[#E5E2DC] hover:border-[#D8D4CD]'}`}>
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-3">
                      {/* User info */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 flex-shrink-0 border border-[#E5E2DC]">
                          <AvatarImage src={u.avatar} alt={u.name} />
                          <AvatarFallback className="bg-[#2C3E6B] text-white text-xs">{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-[#2C3E6B] truncate">{u.name}</p>
                            {isCurrentUser && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2C3E6B]/[0.06] text-[#2C3E6B] font-medium">You</span>}
                          </div>
                          <p className="text-xs text-[#7A766F] truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-[#2C3E6B]/[0.06] text-[#2C3E6B] capitalize">
                          {getRoleIcon(u.role)} {u.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium ${
                          u.status === 'active' ? 'bg-[#2C3E6B]/[0.06] text-[#2C3E6B]' : 'bg-[#B5403A]/10 text-[#B5403A]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-[#2C3E6B]' : 'bg-[#B5403A]'}`} />
                          {u.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Activity */}
                      <div className="col-span-2 text-xs text-[#7A766F]">
                        {u.role === 'learner' && (
                          <div>
                            <p>{getUserEnrollmentCount(u.id)} courses enrolled</p>
                            {badge && <p className="flex items-center gap-1 mt-0.5">{badge.icon} {badge.level} · {u.points}pts</p>}
                          </div>
                        )}
                        {u.role === 'tutor' && <p>{getUserCourseCount(u.id)} courses created</p>}
                        {u.role === 'admin' && <p>Full access</p>}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        {!isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-[#7A766F] hover:text-[#2C3E6B] hover:bg-[#2C3E6B]/[0.04]">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-lg border-[#E5E2DC] bg-white p-1">
                              <DropdownMenuItem onClick={() => handleEditRole(u)} className="rounded-md text-[13px] cursor-pointer text-[#2C3E6B]">
                                <Pencil className="w-3.5 h-3.5 mr-2 text-[#7A766F]" /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(u.id)} className="rounded-md text-[13px] cursor-pointer text-[#2C3E6B]">
                                {u.status === 'active'
                                  ? <><UserX className="w-3.5 h-3.5 mr-2 text-[#7A766F]" /> Disable User</>
                                  : <><UserCheck className="w-3.5 h-3.5 mr-2 text-[#7A766F]" /> Enable User</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Email sent to ${u.email}`)} className="rounded-md text-[13px] cursor-pointer text-[#2C3E6B]">
                                <Mail className="w-3.5 h-3.5 mr-2 text-[#7A766F]" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#E5E2DC]/50" />
                              <DropdownMenuItem onClick={() => handleDelete(u.id)} className="rounded-md text-[13px] cursor-pointer text-[#B5403A]">
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                {deleteConfirm === u.id ? 'Confirm Delete?' : 'Delete User'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-xl bg-[#2C3E6B]/[0.06] flex items-center justify-center mx-auto mb-3">
                <UsersRound className="w-7 h-7 text-[#2C3E6B]/25" />
              </div>
              <h3 className="text-base font-semibold text-[#2C3E6B] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No users found</h3>
              <p className="text-sm text-[#7A766F]">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white rounded-xl border border-[#E5E2DC] shadow-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#2C3E6B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Change User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 p-3 bg-[#F7F6F3] rounded-lg">
                <Avatar className="h-9 w-9 border border-[#E5E2DC]">
                  <AvatarImage src={editingUser.avatar} />
                  <AvatarFallback className="bg-[#2C3E6B] text-white text-xs">{editingUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#2C3E6B]">{editingUser.name}</p>
                  <p className="text-xs text-[#7A766F]">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] text-[#2C3E6B]">New Role</Label>
                <div className="space-y-1.5">
                  {(['learner', 'tutor', 'admin'] as const).map(role => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
                        editRole === role ? 'border-[#2C3E6B]/30 bg-[#2C3E6B]/[0.03]' : 'border-[#E5E2DC] hover:border-[#D8D4CD]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={editRole === role}
                        onChange={() => setEditRole(role)}
                        className="accent-[#2C3E6B]"
                      />
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        <span className="text-sm font-medium text-[#2C3E6B] capitalize">{role}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-lg text-sm border-[#E5E2DC]">Cancel</Button>
                <Button onClick={handleSaveRole} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-sm">Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}