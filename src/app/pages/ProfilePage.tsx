import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { enrollments, userProgress, courses, lessons, getBadgeLevel, badges } from '../data/mockData';
import {
  User, Mail, Phone, FileText, Camera, Save, BookOpen, Trophy,
  Clock, Target, TrendingUp, Award, Pencil, X, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');

  if (!user) {
    navigate('/login');
    return null;
  }

  const badge = getBadgeLevel(user.points);
  const userEnrollments = enrollments.filter(e => e.userId === user.id);
  const completedCourses = userEnrollments.filter(e => e.completed).length;
  const totalEnrolled = userEnrollments.length;
  const progress = userProgress.filter(p => p.userId === user.id);
  const totalLessonsCompleted = progress.reduce((acc, p) => acc + p.completedLessons.length, 0);
  const totalTimeSpent = progress.reduce((acc, p) => acc + p.timeSpent, 0);
  const tutoredCourses = courses.filter(c => c.instructorId === user.id);

  // Next badge
  const currentBadgeIndex = badges.findIndex(b => b.level === badge.level);
  const nextBadge = currentBadgeIndex < badges.length - 1 ? badges[currentBadgeIndex + 1] : null;
  const progressToNext = nextBadge ? Math.min(100, Math.round((user.points / nextBadge.minPoints) * 100)) : 100;

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const stats = user.role === 'learner' ? [
    { icon: BookOpen, label: 'Enrolled', value: totalEnrolled },
    { icon: Check, label: 'Completed', value: completedCourses },
    { icon: Target, label: 'Lessons Done', value: totalLessonsCompleted },
    { icon: Clock, label: 'Time Spent', value: formatTime(totalTimeSpent) },
  ] : user.role === 'tutor' ? [
    { icon: BookOpen, label: 'Courses Created', value: tutoredCourses.length },
    { icon: Target, label: 'Published', value: tutoredCourses.filter(c => c.published).length },
    { icon: TrendingUp, label: 'Total Views', value: tutoredCourses.reduce((a, c) => a + c.views, 0) },
    { icon: Clock, label: 'Total Hours', value: tutoredCourses.reduce((a, c) => a + parseInt(c.duration), 0) + 'h' },
  ] : [
    { icon: BookOpen, label: 'Total Courses', value: courses.length },
    { icon: Target, label: 'Total Lessons', value: lessons.length },
    { icon: TrendingUp, label: 'Total Users', value: 5 },
    { icon: Trophy, label: 'Active', value: 'Yes' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover + Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-8">
          <div className="h-36 sm:h-44 rounded-xl overflow-hidden bg-gradient-to-r from-red-400 to-amber-500">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1679193559674-860ef78899bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWwlMjBncmFkaWVudCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzc0MTI4NjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Cover"
              className="w-full h-full object-cover opacity-40"
            />
          </div>

          <div className="absolute -bottom-10 left-6 sm:left-8">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-md">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#2C3E6B] text-white text-2xl font-medium">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#2C3E6B] text-white flex items-center justify-center shadow-sm hover:bg-[#243356] transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-10 right-6 sm:right-8">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-lg text-[13px] border-[#E5E2DC] h-9 px-4">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="outline" className="rounded-lg text-[13px] border-[#E5E2DC] h-9 px-3">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSave} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-[13px] h-9 px-3">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Name + Role */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-14 mb-8 px-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user.name}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#2C3E6B]/[0.07] text-[#2C3E6B] capitalize w-fit">{user.role}</span>
          </div>
          <p className="text-sm text-[#7A766F]">{user.email}</p>
          {user.bio && <p className="text-sm text-[#7A766F] mt-1">{user.bio}</p>}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <Card key={stat.label} className="p-4 rounded-lg border border-[#E5E2DC] bg-white">
              <div className="w-8 h-8 rounded-lg bg-[#2C3E6B]/[0.06] flex items-center justify-center mb-2.5">
                <stat.icon className="w-4 h-4 text-[#2C3E6B]" />
              </div>
              <p className="text-xl font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-[#7A766F]">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="p-6 rounded-xl border border-[#E5E2DC] bg-white">
              <h2 className="text-base font-semibold text-[#1A1F2E] mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Personal Information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-[#7A766F] flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</Label>
                    {isEditing ? (
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10 rounded-lg border-[#E5E2DC] bg-[#F7F6F3] text-sm" />
                    ) : (
                      <p className="text-sm font-medium text-[#1A1F2E] px-3 py-2 bg-[#F7F6F3] rounded-lg">{user.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-[#7A766F] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
                    <p className="text-sm font-medium text-[#1A1F2E] px-3 py-2 bg-[#F7F6F3] rounded-lg">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-[#7A766F] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
                    {isEditing ? (
                      <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Add phone number" className="h-10 rounded-lg border-[#E5E2DC] bg-[#F7F6F3] text-sm" />
                    ) : (
                      <p className="text-sm text-[#1A1F2E] px-3 py-2 bg-[#F7F6F3] rounded-lg">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-[#7A766F] flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Role</Label>
                    <p className="text-sm font-medium text-[#1A1F2E] px-3 py-2 bg-[#F7F6F3] rounded-lg capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#7A766F] flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Bio</Label>
                  {isEditing ? (
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell us about yourself..." className="w-full h-24 px-3 py-2 rounded-lg bg-[#F7F6F3] border border-[#E5E2DC] text-sm resize-none focus:ring-1 focus:ring-[#2C3E6B]/15 focus:border-[#2C3E6B]/30 outline-none" />
                  ) : (
                    <p className="text-sm text-[#1A1F2E] px-3 py-2 bg-[#F7F6F3] rounded-lg min-h-[60px]">{user.bio || 'No bio added yet.'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent courses (learner only) */}
            {user.role === 'learner' && userEnrollments.length > 0 && (
              <Card className="p-6 rounded-xl border border-[#E5E2DC] bg-white mt-6">
                <h2 className="text-base font-semibold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Enrolled Courses</h2>
                <div className="space-y-3">
                  {userEnrollments.map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    const prog = progress.find(p => p.courseId === course.id);
                    const lessonCount = lessons.filter(l => l.courseId === course.id).length;
                    const pct = prog && lessonCount > 0 ? Math.round((prog.completedLessons.length / lessonCount) * 100) : 0;
                    return (
                      <div key={enrollment.courseId} className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F6F3] hover:bg-[#F0EEEA] transition-colors cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                        <img src={course.coverImage} alt={course.title} className="w-12 h-9 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1F2E] truncate">{course.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-[#E5E2DC] rounded-full overflow-hidden">
                              <div className="h-full bg-[#2C3E6B] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-[#7A766F] font-medium">{pct}%</span>
                          </div>
                        </div>
                        {enrollment.completed && (
                          <Badge className="bg-[#2C3E6B]/[0.08] text-[#2C3E6B] text-[10px] font-medium rounded">Done</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Tutor courses */}
            {user.role === 'tutor' && tutoredCourses.length > 0 && (
              <Card className="p-6 rounded-xl border border-[#E5E2DC] bg-white mt-6">
                <h2 className="text-base font-semibold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your Courses</h2>
                <div className="space-y-3">
                  {tutoredCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F6F3] hover:bg-[#F0EEEA] transition-colors cursor-pointer" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
                      <img src={course.coverImage} alt={course.title} className="w-12 h-9 rounded object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1F2E] truncate">{course.title}</p>
                        <p className="text-[11px] text-[#7A766F]">{course.views} views · {course.duration}</p>
                      </div>
                      <Badge className={`text-[10px] font-medium rounded ${course.published ? 'bg-[#2C3E6B]/[0.08] text-[#2C3E6B]' : 'bg-[#7A766F]/10 text-[#7A766F]'}`}>
                        {course.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>

          {/* Right sidebar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-5">
            {/* Badge card (learner) */}
            {user.role === 'learner' && (
              <Card className="p-5 rounded-xl border border-[#E5E2DC] bg-white">
                <h3 className="text-sm font-semibold text-[#1A1F2E] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Current Level</h3>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-[#2C3E6B]/[0.06] flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl">{badge.icon}</span>
                  </div>
                  <p className="text-base font-semibold text-[#2C3E6B]">{badge.level}</p>
                  <p className="text-xs text-[#7A766F]">{user.points} points earned</p>
                </div>
                {nextBadge && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[#7A766F]">Next: {nextBadge.level} {nextBadge.icon}</span>
                      <span className="font-medium text-[#2C3E6B]">{user.points}/{nextBadge.minPoints}</span>
                    </div>
                    <div className="h-1.5 bg-[#E5E2DC] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2C3E6B] rounded-full transition-all" style={{ width: `${progressToNext}%` }} />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* All badges */}
            {user.role === 'learner' && (
              <Card className="p-5 rounded-xl border border-[#E5E2DC] bg-white">
                <h3 className="text-sm font-semibold text-[#1A1F2E] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>All Badges</h3>
                <div className="space-y-2">
                  {badges.map(b => {
                    const unlocked = user.points >= b.minPoints;
                    return (
                      <div key={b.level} className={`flex items-center gap-3 p-2 rounded-lg ${unlocked ? 'bg-[#2C3E6B]/[0.04]' : 'opacity-40'}`}>
                        <span className="text-lg">{b.icon}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${unlocked ? 'text-[#2C3E6B]' : 'text-[#7A766F]'}`}>{b.level}</p>
                          <p className="text-[10px] text-[#7A766F]">{b.minPoints} pts required</p>
                        </div>
                        {unlocked && <Check className="w-3.5 h-3.5 text-[#2C3E6B]" />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Account info */}
            <Card className="p-5 rounded-xl border border-[#E5E2DC] bg-white">
              <h3 className="text-sm font-semibold text-[#1A1F2E] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Account</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7A766F]">Member since</span>
                  <span className="text-[#1A1F2E] font-medium">Jan 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A766F]">Status</span>
                  <span className="text-[#2C3E6B] font-medium">Active</span>
                </div>
                {user.verified !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[#7A766F]">Verified</span>
                    <span className={`font-medium ${user.verified ? 'text-[#2C3E6B]' : 'text-[#7A766F]'}`}>{user.verified ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
