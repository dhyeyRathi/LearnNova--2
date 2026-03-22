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
  Clock, Target, TrendingUp, Award, Pencil, X, Check, Edit2, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
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
    // Validate name
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    // Update user context with new name
    updateUser({ name: editName });
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Cover */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-12">
          <div className="h-40 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1679193559674-860ef78899bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWwlMjBncmFkaWVudCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzc0MTI4NjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Cover"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Avatar and Edit Button */}
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-white shadow-2xl ring-4 ring-indigo-100">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all">
                <Camera className="w-4.5 h-4.5 text-gray-600" />
              </button>
            </motion.div>
          </div>

          {/* Edit Profile Button */}
          <div className="absolute -bottom-12 right-6 sm:right-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-10 shadow-lg flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline" 
                    className="rounded-full h-10 px-5 border-gray-200"
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full h-10 px-5 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Save
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Profile Header Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-16 mb-10 px-2">
          <div className="flex flex-col gap-3">
            {isEditing ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</Label>
                <Input 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="h-12 rounded-xl border-2 border-indigo-200 bg-white text-lg font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {editName}
                </h1>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Badge className="w-fit bg-indigo-100 text-indigo-700 font-semibold capitalize px-4 py-1 rounded-full text-sm">
                {user.role}
              </Badge>
              <p className="text-gray-500 font-medium">{user.email}</p>
            </div>
            
            {user.bio && !isEditing && (
              <p className="text-gray-600 text-base max-w-2xl">{user.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }} 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
              <Card className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                  <stat.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information Card */}
            <Card className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Personal Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Name Field - Always Editable in Edit Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" /> 
                        Full Name
                      </Label>
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <Input 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        className="h-11 rounded-lg border-2 border-indigo-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500" 
                      />
                    ) : (
                      <div className="h-11 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center">
                        <p className="text-sm font-semibold text-gray-900">{editName}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" /> 
                      Email
                    </Label>
                    <div className="h-11 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center">
                      <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-indigo-600" /> 
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)} 
                        placeholder="Add phone number" 
                        className="h-11 rounded-lg border-2 border-indigo-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500" 
                      />
                    ) : (
                      <div className="h-11 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center">
                        <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600" /> 
                      Role
                    </Label>
                    <div className="h-11 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center">
                      <span className="text-sm font-semibold text-gray-900 capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                {/* Bio Field */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> 
                    Bio
                  </Label>
                  {isEditing ? (
                    <textarea 
                      value={editBio} 
                      onChange={e => setEditBio(e.target.value)} 
                      placeholder="Tell us about yourself..." 
                      className="w-full h-24 px-4 py-3 rounded-lg bg-white border-2 border-indigo-200 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" 
                    />
                  ) : (
                    <div className="min-h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900">{user.bio || 'No bio added yet.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Enrolled/Created Courses Section */}
            {user.role === 'learner' && userEnrollments.length > 0 && (
              <Card className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Enrolled Courses
                  </h2>
                  <Badge className="ml-auto bg-indigo-100 text-indigo-700">{userEnrollments.length}</Badge>
                </div>
                <div className="space-y-3">
                  {userEnrollments.map(enrollment => {
                    const course = courses.find(c => c.id === enrollment.courseId);
                    if (!course) return null;
                    const prog = progress.find(p => p.courseId === course.id);
                    const lessonCount = lessons.filter(l => l.courseId === course.id).length;
                    const pct = prog && lessonCount > 0 ? Math.round((prog.completedLessons.length / lessonCount) * 100) : 0;
                    return (
                      <motion.div 
                        key={enrollment.courseId} 
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all cursor-pointer border border-gray-200" 
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <img src={course.coverImage} alt={course.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{pct}%</span>
                          </div>
                        </div>
                        {enrollment.completed && (
                          <Badge className="bg-green-100 text-green-700 rounded-lg font-semibold">Done</Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Tutor Courses */}
            {user.role === 'tutor' && tutoredCourses.length > 0 && (
              <Card className="p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Your Courses
                  </h2>
                  <Badge className="ml-auto bg-indigo-100 text-indigo-700">{tutoredCourses.length}</Badge>
                </div>
                <div className="space-y-3">
                  {tutoredCourses.map(course => (
                    <motion.div 
                      key={course.id} 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all cursor-pointer border border-gray-200" 
                      onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                    >
                      <img src={course.coverImage} alt={course.title} className="w-14 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{course.views} views · {course.duration}</p>
                      </div>
                      <Badge className={`rounded-lg font-semibold ${course.published ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>
                        {course.published ? 'Published' : 'Draft'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-6">
            {/* Badge Card */}
            {user.role === 'learner' && (
              <Card className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Current Level
                </h3>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <span className="text-4xl">{badge.icon}</span>
                  </div>
                  <p className="text-lg font-bold text-indigo-600">{badge.level}</p>
                  <p className="text-xs text-gray-600 mt-1 font-semibold">{user.points} points earned</p>
                </div>
                {nextBadge && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 font-semibold">Next: {nextBadge.level} {nextBadge.icon}</span>
                      <span className="font-bold text-indigo-600">{user.points}/{nextBadge.minPoints}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Account Information */}
            <Card className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Award className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Account
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Member since</span>
                  <span className="text-gray-900 font-bold">Jan 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Status</span>
                  <Badge className="bg-green-100 text-green-700 font-bold">Active</Badge>
                </div>
                {user.verified !== undefined && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold">Verified</span>
                    <span className={`font-bold ${user.verified ? 'text-green-600' : 'text-gray-600'}`}>
                      {user.verified ? '✓ Yes' : 'No'}
                    </span>
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
