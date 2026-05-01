import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { supabase } from '../../../utils/supabase/client';
import {
  Search, Users, Shield, GraduationCap, BookOpen, MoreHorizontal,
  Mail, Pencil, Trash2, UserCheck, UserX, Crown, Loader, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'tutor' | 'admin';
  points: number;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'tutor' | 'admin'>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<'learner' | 'tutor' | 'admin'>('learner');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching users from Supabase...');
        
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          console.error('❌ Supabase error:', supabaseError);
          setError(`Error: ${supabaseError.message}`);
          setUsers([]);
          toast.error(`Failed to load users: ${supabaseError.message}`);
        } else {
          console.log(`✅ Fetched ${data?.length || 0} users from database`);
          if (data && data.length > 0) {
            setUsers(data);
            console.log('📊 Users:', data);
          } else {
            setUsers([]);
            console.log('ℹ️ No users in database');
          }
        }
      } catch (err) {
        console.error('💥 Fetch error:', err);
        setError(String(err));
        setUsers([]);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
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
            <h2 className="text-xl font-semibold text-[#2C3E6B] mb-2">Admin Access Required</h2>
            <p className="text-sm text-[#7A766F] mb-4">Only administrators can manage users.</p>
            <Button onClick={() => navigate('/courses')} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-sm">
              Go to Courses
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesSearch = !searchQuery || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  // Calculate stats
  const stats = {
    all: users.length,
    learner: users.filter(u => u.role === 'learner').length,
    tutor: users.filter(u => u.role === 'tutor').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  const handleDeleteUser = async (userToDeleteData: User) => {
    setUserToDelete(userToDeleteData);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (deleteError) {
        toast.error(`Failed to delete user: ${deleteError.message}`);
        return;
      }

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success(`User ${userToDelete.name} deleted`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !userToToggle.is_active })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to update user status');
        return;
      }

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: !u.is_active } : u
      ));
      toast.success(`User ${userToToggle.is_active ? 'disabled' : 'enabled'}`);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleEditRole = (u: User) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: editRole })
        .eq('id', editingUser.id);

      if (error) {
        toast.error('Failed to update role');
        return;
      }

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, role: editRole } : u
      ));
      toast.success(`${editingUser.name}'s role updated to ${editRole}`);
      setEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast.error('Failed to save role');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#2C3E6B]">User Management</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C3E6B]/[0.06] text-[#2C3E6B] rounded-md text-xs font-medium">
              <Shield className="w-3.5 h-3.5" /> Admin Only
            </span>
          </div>
          <p className="text-sm text-[#7A766F]">Manage all users, roles, and access permissions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error loading users</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', label: 'All Users', icon: Users, count: stats.all },
            { key: 'learner', label: 'Learners', icon: BookOpen, count: stats.learner },
            { key: 'tutor', label: 'Tutors', icon: GraduationCap, count: stats.tutor },
            { key: 'admin', label: 'Admins', icon: Shield, count: stats.admin },
          ].map(stat => (
            <Card
              key={stat.key}
              onClick={() => setRoleFilter(stat.key as any)}
              className={`p-4 rounded-lg cursor-pointer transition-all border ${
                roleFilter === stat.key
                  ? 'border-[#2C3E6B]/30 bg-[#2C3E6B]/[0.03]'
                  : 'border-[#E5E2DC] bg-white hover:border-[#D8D4CD]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#2C3E6B]/[0.06] flex items-center justify-center mb-2.5">
                <stat.icon className="w-4 h-4 text-[#2C3E6B]" />
              </div>
              <p className="text-2xl font-bold text-[#2C3E6B]">{stat.count}</p>
              <p className="text-xs text-[#7A766F]">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766F]/50" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 h-10 bg-white rounded-lg border-[#E5E2DC] text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-[#2C3E6B] animate-spin mb-3" />
            <p className="text-[#7A766F]">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-[#F7F6F3] rounded-lg border border-[#E5E2DC]">
            <Users className="w-12 h-12 text-[#7A766F]/30 mx-auto mb-3" />
            <p className="text-[#7A766F]">
              {users.length === 0 ? 'No users in database' : 'No users match your search'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#7A766F] uppercase font-medium">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Users */}
            <AnimatePresence>
              {filteredUsers.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4 rounded-lg border-[#E5E2DC] bg-white hover:border-[#D8D4CD] transition-all">
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-3">
                      {/* User info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0 border border-[#E5E2DC]">
                          <AvatarImage src={u.avatar_url} alt={u.name} />
                          <AvatarFallback className="bg-[#2C3E6B] text-white text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#2C3E6B] truncate">{u.name}</p>
                          <p className="text-xs text-[#7A766F] truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[#2C3E6B]/[0.06] text-[#2C3E6B] capitalize">
                          {u.role === 'admin' && <Crown className="w-3 h-3" />}
                          {u.role === 'tutor' && <GraduationCap className="w-3 h-3" />}
                          {u.role === 'learner' && <BookOpen className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                          u.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-600' : 'bg-red-600'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="col-span-2 text-xs text-[#7A766F]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleEditRole(u)}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(u.id)}>
                              {u.is_active ? (
                                <><UserX className="w-3.5 h-3.5 mr-2" /> Disable</>
                              ) : (
                                <><UserCheck className="w-3.5 h-3.5 mr-2" /> Enable</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(u)} className="text-red-600">
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-white rounded-xl border border-[#E5E2DC]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[#2C3E6B]">Change User Role</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-[#F7F6F3] rounded-lg">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={editingUser.avatar_url} />
                    <AvatarFallback className="bg-[#2C3E6B] text-white">
                      {editingUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#2C3E6B]">{editingUser.name}</p>
                    <p className="text-xs text-[#7A766F]">{editingUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[#2C3E6B]">New Role</Label>
                  <div className="space-y-2">
                    {(['learner', 'tutor', 'admin'] as const).map(role => (
                      <label key={role} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={editRole === role}
                          onChange={() => setEditRole(role)}
                          className="accent-[#2C3E6B]"
                        />
                        <span className="text-sm font-medium text-[#2C3E6B] capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditOpen(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRole} className="bg-[#2C3E6B] text-white text-sm">
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-white rounded-xl border border-[#E5E2DC]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-600">Delete User</DialogTitle>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4 pt-4">
                <p className="text-sm text-[#7A766F]">Are you sure? This cannot be undone.</p>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-[#2C3E6B]">{userToDelete.name}</p>
                  <p className="text-xs text-[#7A766F]">{userToDelete.email}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    {isDeleting ? (
                      <>
                        <Loader className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Permanently'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
