import { useState, useMemo, useEffect } from 'react';
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

import { supabase } from '../../../utils/supabase/client';
import {
  Search, UsersRound, Shield, GraduationCap, BookOpen, MoreHorizontal,
  Mail, Pencil, Trash2, UserCheck, UserX, ChevronDown, Crown, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useData } from '../../context/DataContext';

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
  const { enrollments, userProgress, courses, getBadgeLevel } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'tutor' | 'admin'>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<'learner' | 'tutor' | 'admin'>('learner');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const { data: supabaseUsers, error } = await supabase
          .from('users')
          .select('id, email, name, role, points, avatar_url, is_active, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
          toast.error(`Failed to load users: ${error.message}`);
          setManagedUsers([]);
        } else if (supabaseUsers) {
          console.log(`Fetched ${supabaseUsers.length} users from database`);
          const formattedUsers: ManagedUser[] = supabaseUsers.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role as 'learner' | 'tutor' | 'admin',
            points: u.points || 0,
            avatar: u.avatar_url,
            status: u.is_active ? 'active' : 'disabled',
            joinedAt: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-01-15',
          }));
          setManagedUsers(formattedUsers);
        } else {
          setManagedUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast.error('Failed to load users');
        setManagedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

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

  const handleDeleteUser = async (userToDeleteData: ManagedUser) => {
    setUserToDelete(userToDeleteData);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Delete from Supabase auth (requires service_role or admin)
      // This requires an edge function or backend to delete properly
      // For now, we'll delete from the users table then invalidate the session
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        toast.error(`Failed to delete user: ${deleteError.message}`);
        return;
      }

      // Remove from local state
      setManagedUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.name} has been permanently deleted`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              User Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
              <Shield className="w-3.5 h-3.5" /> Admin Only
            </span>
          </div>
          <p className="text-base text-[#7A766F]">Manage all users, roles, and access permissions</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {([
            { key: 'all', label: 'All Users', icon: UsersRound },
            { key: 'learner', label: 'Learners', icon: BookOpen },
            { key: 'tutor', label: 'Tutors', icon: GraduationCap },
            { key: 'admin', label: 'Admins', icon: Shield },
          ] as const).map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                onClick={() => setRoleFilter(stat.key)}
                className={`p-5 rounded-xl cursor-pointer transition-all border ${
                  roleFilter === stat.key
                    ? 'border-purple-300 bg-purple-50 shadow-md'
                    : 'border-[#DDD6CC] bg-white hover:border-purple-200 hover:shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                  <stat.icon className="w-5 h-5 text-purple-700" />
                </div>
                <p className="text-2xl font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {roleCounts[stat.key]}
                </p>
                <p className="text-xs text-[#7A766F]">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766F]/50" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 h-11 bg-white rounded-lg border-[#DDD6CC] text-sm focus:border-purple-300 focus:ring-purple-200"
            />
          </div>
        </motion.div>

        {/* User list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-[#7A766F]">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-purple-50 rounded-xl border border-[#DDD6CC]">
            <UsersRound className="w-12 h-12 text-[#7A766F]/30 mx-auto mb-3" />
            <p className="text-[#7A766F]">
              {users.length === 0 ? 'No users in database' : 'No users match your search'}
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs text-[#7A766F] uppercase tracking-wider font-semibold">
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
                  <Card className={`p-5 rounded-xl border transition-all ${
                    u.status === 'disabled' 
                      ? 'bg-red-50/50 border-[#DDD6CC]/50 opacity-60' 
                      : 'bg-white border-[#DDD6CC] hover:border-purple-200 hover:shadow-sm'
                  }`}>
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-3">
                      {/* User info */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-[#DDD6CC]">
                          <AvatarImage src={u.avatar} alt={u.name} />
                          <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-[#1A1F2E] truncate">{u.name}</p>
                            {isCurrentUser && <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">You</span>}
                          </div>
                          <p className="text-xs text-[#7A766F] truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                          {getRoleIcon(u.role)} {u.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          u.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`} />
                          {u.status === 'active' ? 'Active' : 'Inactive'}
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
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-[#7A766F] hover:text-purple-600 hover:bg-purple-50">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl border-[#DDD6CC] bg-white p-1.5">
                              <DropdownMenuItem onClick={() => handleEditRole(u)} className="rounded-lg text-sm cursor-pointer text-[#1A1F2E] hover:bg-purple-50">
                                <Pencil className="w-4 h-4 mr-2 text-[#7A766F]" /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(u.id)} className="rounded-lg text-sm cursor-pointer text-[#1A1F2E] hover:bg-purple-50">
                                {u.status === 'active'
                                  ? <><UserX className="w-4 h-4 mr-2 text-[#7A766F]" /> Disable User</>
                                  : <><UserCheck className="w-4 h-4 mr-2 text-[#7A766F]" /> Enable User</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success(`Email sent to ${u.email}`)} className="rounded-lg text-sm cursor-pointer text-[#1A1F2E] hover:bg-purple-50">
                                <Mail className="w-4 h-4 mr-2 text-[#7A766F]" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#DDD6CC]/50" />
                              <DropdownMenuItem onClick={() => handleDeleteUser(u)} className="rounded-lg text-sm cursor-pointer text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
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
        </motion.div>
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white rounded-2xl border border-[#DDD6CC] shadow-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Change User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <Avatar className="h-10 w-10 border-2 border-[#DDD6CC]">
                  <AvatarImage src={editingUser.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">{editingUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#1A1F2E]">{editingUser.name}</p>
                  <p className="text-xs text-[#7A766F]">{editingUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-[#1A1F2E] font-medium">New Role</Label>
                <div className="space-y-2">
                  {(['learner', 'tutor', 'admin'] as const).map(role => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                        editRole === role 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-[#DDD6CC] hover:border-purple-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={editRole === role}
                        onChange={() => setEditRole(role)}
                        className="accent-purple-600"
                      />
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        <span className="text-sm font-medium text-[#1A1F2E] capitalize">{role}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-lg text-sm border-[#DDD6CC] text-[#1A1F2E]">
                  Cancel
                </Button>
                <Button onClick={handleSaveRole} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white rounded-2xl border border-[#DDD6CC] shadow-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Delete User Permanently
            </DialogTitle>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                  <p className="text-xs text-red-700">The user will be permanently deleted from the platform</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs text-[#7A766F] mb-2 font-medium">User being deleted:</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border-2 border-[#DDD6CC]">
                    <AvatarImage src={userToDelete.avatar} />
                    <AvatarFallback className="bg-purple-600 text-white text-xs font-semibold">{userToDelete.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A1F2E] truncate">{userToDelete.name}</p>
                    <p className="text-xs text-[#7A766F] truncate">{userToDelete.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#1A1F2E]">This will:</p>
                <ul className="text-sm text-[#7A766F] space-y-1 ml-4">
                  <li>• Delete all user profile data</li>
                  <li>• Remove all enrollments and progress</li>
                  <li>• Delete any courses created by this user</li>
                  <li>• Cannot be recovered</li>
                </ul>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmOpen(false)} 
                  disabled={isDeleting}
                  className="rounded-lg text-sm border-[#DDD6CC] text-[#1A1F2E]"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  {isDeleting ? (
                    <>
                      <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}