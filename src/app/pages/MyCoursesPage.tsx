import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { courses, lessons, userProgress, enrollments, badges, getBadgeLevel } from '../data/mockData';
import { Search, Clock, Award, Trophy, Target, BookOpen, Flame, Star, Play, RotateCcw, CheckCircle, ChevronRight, Zap, Shield, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (courseId: string) => {
    setFailedImages(prev => new Set([...prev, courseId]));
  };

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const badge = getBadgeLevel(user.points);
  const currentBadgeIndex = badges.findIndex(b => b.level === badge.level);
  const nextBadge = currentBadgeIndex < badges.length - 1 ? badges[currentBadgeIndex + 1] : null;
  const progressToNext = nextBadge
    ? ((user.points - badge.minPoints) / (nextBadge.minPoints - badge.minPoints)) * 100
    : 100;

  // Build enrolled courses with progress data
  const enrolledCourses = enrollments
    .filter(e => e.userId === user.id)
    .map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) return null;
      const progress = userProgress.find(p => p.userId === user.id && p.courseId === course.id);
      const courseLessons = lessons.filter(l => l.courseId === course.id);
      const completedCount = progress?.completedLessons.length || 0;
      const totalCount = courseLessons.length;
      const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      const isCompleted = enrollment.completed;

      return {
        ...course,
        progress: completionPercentage,
        timeSpent: progress?.timeSpent || 0,
        lastAccessed: progress?.lastAccessed || enrollment.enrolledAt,
        completedLessons: completedCount,
        totalLessons: totalCount,
        isCompleted,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      };
    })
    .filter(Boolean) as any[];

  const filteredCourses = enrolledCourses.filter(course => {
    if (filter === 'in-progress' && (course.isCompleted || course.progress === 0)) return false;
    if (filter === 'completed' && !course.isCompleted) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query) || course.tags.some((t: string) => t.toLowerCase().includes(query));
  });

  const totalCompleted = enrolledCourses.filter(c => c.isCompleted).length;
  const totalInProgress = enrolledCourses.filter(c => !c.isCompleted && c.progress > 0).length;

  const statCards = [
    { icon: Trophy, value: user.points, label: 'Total Points', gradient: 'from-red-500 to-amber-500', shadowColor: 'shadow-red-500/20' },
    { icon: BookOpen, value: enrolledCourses.length, label: 'Enrolled', gradient: 'from-red-500 to-amber-500', shadowColor: 'shadow-red-500/20' },
    { icon: Target, value: totalCompleted, label: 'Completed', gradient: 'from-red-500 to-amber-500', shadowColor: 'shadow-red-500/20' },
    { icon: Flame, value: totalInProgress, label: 'In Progress', gradient: 'from-red-500 to-amber-500', shadowColor: 'shadow-red-500/20' },
  ];

  const getCourseButton = (course: any) => {
    if (course.isCompleted) {
      return { label: 'View Course', icon: Star, gradient: 'from-red-500 to-amber-500' };
    }
    if (course.progress > 0) {
      return { label: 'Continue', icon: RotateCcw, gradient: 'from-red-500 to-amber-500' };
    }
    return { label: 'Start', icon: Play, gradient: 'from-red-500 to-amber-500' };
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Home" to="/" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main Content Area */}
          <div>
            {/* User Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl p-8 mb-8 overflow-hidden bg-gradient-to-br from-red-500 to-red-600"
            >
              <div className="absolute inset-0 bg-red-500/20" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
              
              <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full border-2 border-white/20" />
              <div className="absolute bottom-[-30px] left-[10%] w-[150px] h-[150px] rounded-full border-2 border-white/20" />
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-8 right-[20%] w-4 h-4 bg-white/30 rounded-full"
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 md:mb-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white/40 shadow-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"
                  >
                    <span className="text-4xl font-bold text-white drop-shadow-lg">{user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                  </motion.div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-1 drop-shadow-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user.name}</h1>
                    <p className="text-white/90 mb-2 drop-shadow-sm">{user.email}</p>
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 w-fit border border-white/30">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm font-semibold text-white">{badge.level}</span>
                      <span className="text-xs text-white/90">({user.points} pts)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {statCards.map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="rounded-2xl p-4 text-center min-w-[90px] bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg"
                    >
                      <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-white" />
                      <p className="text-2xl font-bold text-white drop-shadow-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
                      <p className="text-[10px] text-white/90">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {nextBadge && (
                <div className="mt-6 relative z-10">
                  <div className="flex items-center justify-between text-sm mb-2 text-white/90 drop-shadow-sm">
                    <span>Progress to <span className="font-semibold">{nextBadge.level}</span> {nextBadge.icon}</span>
                    <span className="font-semibold">{user.points} / {nextBadge.minPoints}</span>
                  </div>
                  <div className="h-2.5 bg-white/30 rounded-full overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-amber-300 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search my courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 glass-card rounded-2xl border-white/40"
                />
              </div>
              <div className="flex gap-1 glass-card rounded-xl p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'in-progress', label: 'In Progress' },
                  { key: 'completed', label: 'Completed' },
                ].map(f => (
                  <Button
                    key={f.key}
                    variant={filter === f.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f.key as any)}
                    className={`rounded-lg text-xs ${filter === f.key ? 'bg-red-500 text-white shadow-md' : ''}`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Course Cards */}
            <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              My Courses
              {filter !== 'all' && <span className="text-base font-normal text-slate-400 ml-2">({filteredCourses.length})</span>}
            </h2>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course: any, index: number) => {
                  const btnConfig = getCourseButton(course);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <div className="group overflow-hidden rounded-3xl glass-card shadow-lg hover:shadow-2xl transition-all duration-500 h-full relative flex flex-col">
                        <Link to={`/course/${course.id}?from=my-courses`} className="block">
                          <div className="relative h-40 overflow-hidden bg-red-50">
                            {!failedImages.has(course.id) ? (
                              <img 
                                src={course.coverImage} 
                                alt={course.title} 
                                onError={() => handleImageError(course.id)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-amber-100">
                                <div className="text-center">
                                  <ImageIcon className="w-8 h-8 text-red-300 mx-auto" />
                                  <p className="text-red-400 text-xs mt-1">No image</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            
                            {/* Status badge */}
                            <div className="absolute top-3 left-3">
                              {course.isCompleted ? (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-md">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                </Badge>
                              ) : course.progress > 0 ? (
                                <Badge className="bg-red-500 text-white rounded-lg shadow-md">
                                  <Flame className="w-3 h-3 mr-1" /> In Progress
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-white/90 rounded-lg shadow-md">
                                  Not Started
                                </Badge>
                              )}
                            </div>

                            {/* Progress circle */}
                            <div className="absolute top-3 right-3 glass-card rounded-full px-3 py-1.5 shadow-lg">
                              <span className="text-sm font-bold text-slate-800">{Math.round(course.progress)}%</span>
                            </div>
                          </div>
                        </Link>

                        <div className="p-5 flex flex-col flex-1">
                          <Link to={`/course/${course.id}?from=my-courses`}>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {course.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] rounded-md bg-slate-100/80 px-1.5 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {course.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                          </Link>

                          {/* Progress Bar */}
                          <div className="mb-4 flex-1">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.timeSpent} min</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-full rounded-full bg-${course.isCompleted ? 'emerald-500' : 'red-500'}`}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link to={`/course/${course.id}?from=my-courses`}>
                              <Button className={`w-full h-10 bg-gradient-to-r ${btnConfig.gradient} text-white rounded-xl shadow-lg`}>
                                <btnConfig.icon className="w-4 h-4 mr-2" />
                                {btnConfig.label}
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              </Button>
                            </Link>
                          </motion.div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card rounded-3xl">
                <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-4 animate-float-gentle">
                  <BookOpen className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {searchQuery ? 'No courses found' : filter !== 'all' ? 'No courses in this category' : 'No courses yet'}
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Start learning by enrolling in a course'}
                </p>
                {!searchQuery && filter === 'all' && (
                  <Link to="/courses">
                    <Button className="bg-red-500 text-white rounded-xl shadow-lg">
                      Browse Courses
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Sidebar: Profile & Badge Panel */}
          <div className="space-y-6">
            {/* Badge Level Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card rounded-3xl p-6 shadow-xl sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Shield className="w-5 h-5 text-red-500" />
                  Badge Levels
                </h3>

                {/* Current Badge */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-2"
                  >
                    {badge.icon}
                  </motion.div>
                  <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {badge.level}
                  </p>
                  <p className="text-sm text-slate-500">{user.points} points earned</p>
                </div>

                {/* All badge levels */}
                <div className="space-y-2.5">
                  {badges.map((b, i) => {
                    const isActive = b.level === badge.level;
                    const isUnlocked = user.points >= b.minPoints;
                    return (
                      <div
                        key={b.level}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                            : isUnlocked
                            ? 'bg-emerald-50/50 border border-emerald-100'
                            : 'bg-slate-50/50 border border-slate-100'
                        }`}
                      >
                        <span className={`text-2xl ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}>{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isActive ? 'text-red-700' : isUnlocked ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {b.level}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {b.maxPoints === Infinity ? `${b.minPoints}+ pts` : `${b.minPoints} - ${b.maxPoints} pts`}
                          </p>
                        </div>
                        {isActive && (
                          <Badge className="bg-red-500 text-white text-[10px] rounded-lg shadow-sm">
                            Current
                          </Badge>
                        )}
                        {isUnlocked && !isActive && (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Next level progress */}
                {nextBadge && (
                  <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Next: <span className="font-bold text-red-700">{nextBadge.level}</span> {nextBadge.icon}</span>
                      <span className="font-semibold text-red-600">{nextBadge.minPoints - user.points} pts left</span>
                    </div>
                    <div className="h-2.5 bg-white rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-amber-50/80 rounded-xl">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-lg font-bold text-slate-800">{user.points}</p>
                    <p className="text-[10px] text-slate-500">Total Points</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50/80 rounded-xl">
                    <Award className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold text-slate-800">{badges.filter(b => user.points >= b.minPoints).length}</p>
                    <p className="text-[10px] text-slate-500">Badges Earned</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}