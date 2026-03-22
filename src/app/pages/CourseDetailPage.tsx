import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { courses, lessons, userProgress, reviews as allReviews, enrollments, courseInvitations, users } from '../data/mockData';
import { Play, FileText, Image as ImageIcon, HelpCircle, CheckCircle, Circle, Star, Clock, Award, Users, ArrowRight, Sparkles, Search, Lock, ShoppingCart, Trophy, Paperclip, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromMyCourses = location.state?.from === 'my-courses' || new URLSearchParams(location.search).get('from') === 'my-courses';
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const course = courses.find(c => c.id === id);
  const courseLessons = lessons.filter(l => l.courseId === id).sort((a, b) => a.order - b.order);
  const progress = user ? userProgress.find(p => p.userId === user.id && p.courseId === id) : null;
  const courseReviews = allReviews.filter(r => r.courseId === id);
  const enrollment = user ? enrollments.find(e => e.userId === user.id && e.courseId === id) : null;

  useEffect(() => {
    if (!course) { navigate('/courses'); return; }
    if (!isAuthenticated && course.visibility === 'signed-in') navigate('/login');
  }, [course, isAuthenticated, navigate]);

  if (!course) return null;

  const completionPercentage = progress && courseLessons.length > 0
    ? (progress.completedLessons.length / courseLessons.length) * 100 : 0;
  const completedLessonIds = progress?.completedLessons || [];
  const allLessonsComplete = courseLessons.length > 0 && completedLessonIds.length === courseLessons.length;

  // Access control
  const canAccess = () => {
    if (!isAuthenticated || !user) return false;
    if (course.accessRule === 'open') return true;
    if (course.accessRule === 'invitation') {
      return courseInvitations.some(i => i.courseId === course.id && i.userId === user.id) || !!enrollment;
    }
    if (course.accessRule === 'payment') return !!enrollment; // Payment would mark enrollment
    return false;
  };

  const hasAccess = canAccess();

  // Filter lessons by search
  const filteredLessons = courseLessons.filter(l => {
    if (!lessonSearch) return true;
    return l.title.toLowerCase().includes(lessonSearch.toLowerCase()) || l.description.toLowerCase().includes(lessonSearch.toLowerCase());
  });

  const incompleteLessons = filteredLessons.filter(l => !completedLessonIds.includes(l.id));
  const completedLessons = filteredLessons.filter(l => completedLessonIds.includes(l.id));

  // Average rating
  const averageRating = courseReviews.length > 0
    ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length : 0;

  // Already reviewed?
  const hasReviewed = user ? courseReviews.some(r => r.userId === user.id) : false;

  const handleSubmitReview = () => {
    if (!user) { navigate('/login'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!review.trim()) { toast.error('Please write a review'); return; }
    allReviews.push({
      id: `rev-${Date.now()}`,
      courseId: id!,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      comment: review,
      createdAt: new Date().toISOString().split('T')[0],
    });
    toast.success('Review submitted successfully!');
    setRating(0);
    setReview('');
  };

  const handleEnroll = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (course.accessRule === 'payment') {
      toast.info('Payment flow would open here');
      return;
    }
    if (!enrollment && user) {
      enrollments.push({
        userId: user.id,
        courseId: course.id,
        enrolledAt: new Date().toISOString().split('T')[0],
        completed: false,
      });
      toast.success('Enrolled successfully!');
    }
    // Navigate to first lesson
    if (courseLessons.length > 0) {
      navigate(`/lesson/${id}/${courseLessons[0].id}`);
    }
  };

  const handleCompleteCourse = () => {
    if (enrollment && user) {
      const idx = enrollments.findIndex(e => e.userId === user.id && e.courseId === course.id);
      if (idx >= 0) {
        enrollments[idx].completed = true;
        enrollments[idx].completedAt = new Date().toISOString().split('T')[0];
      }
      // Award bonus points for course completion
      const bonus = 20;
      const u = users.find(u => u.id === user.id);
      if (u) u.points += bonus;
      toast.success(`Course completed! +${bonus} bonus points!`);
      setShowCompletionModal(true);
    }
  };

  const getLessonIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      video: <Play className="w-4 h-4" />,
      document: <FileText className="w-4 h-4" />,
      image: <ImageIcon className="w-4 h-4" />,
      quiz: <HelpCircle className="w-4 h-4" />,
    };
    return icons[type] || <Circle className="w-4 h-4" />;
  };

  const getLessonStatus = (lessonId: string) => {
    const isComplete = completedLessonIds.includes(lessonId);
    // Check if this is the "next" lesson (first incomplete)
    const firstIncomplete = courseLessons.find(l => !completedLessonIds.includes(l.id));
    const isInProgress = firstIncomplete?.id === lessonId && completedLessonIds.length > 0;
    return { isComplete, isInProgress };
  };

  const handleLessonClick = (lessonId: string) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!hasAccess && course.accessRule !== 'open') {
      toast.error('You need access to this course to view lessons');
      return;
    }
    navigate(`/lesson/${id}/${lessonId}`);
  };

  const firstIncompleteLesson = courseLessons.find(l => !completedLessonIds.includes(l.id));

  return (
    <DashboardLayout>
      {/* Completion Celebration Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCompletionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card rounded-3xl p-10 max-w-md text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Course Completed!
              </h2>
              <p className="text-slate-500 mb-2">Congratulations! You've completed</p>
              <p className="text-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-4">
                {course.title}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-bold text-amber-600">+20 bonus points earned!</span>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowCompletionModal(false)} className="bg-red-500 text-white rounded-xl px-6">
                  Continue
                </Button>
                <Link to="/my-courses">
                  <Button variant="outline" className="rounded-xl px-6">My Courses</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label={fromMyCourses ? "Back to My Courses" : "Back to Courses"} to={fromMyCourses ? "/my-courses" : "/courses"} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Hero image */}
              <div className="relative h-96 rounded-3xl overflow-hidden mb-6 shadow-2xl group bg-red-50">
                {!imageError ? (
                  <img 
                    src={course.coverImage} 
                    alt={course.title} 
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-amber-100">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-red-300 mx-auto mb-3" />
                      <p className="text-red-400 text-sm">Image unavailable</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map(tag => (
                      <Badge key={tag} className="glass-card-dark text-white border-white/20 rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                    {course.accessRule === 'payment' && (
                      <Badge className="bg-amber-500/90 text-white rounded-lg">
                        <ShoppingCart className="w-3 h-3 mr-1" /> Paid Course
                      </Badge>
                    )}
                    {course.accessRule === 'invitation' && (
                      <Badge className="bg-red-500/90 text-white rounded-lg">
                        <Lock className="w-3 h-3 mr-1" /> Invitation Only
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{course.title}</h1>
                  <p className="text-white/80 text-lg mb-4">{course.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-white/70">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-7 h-7 ring-2 ring-white/30">
                        <AvatarFallback className="bg-red-500 text-white text-xs">{course.instructorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{course.instructorName}</span>
                    </div>
                    <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{course.duration}</span></div>
                    <div className="flex items-center space-x-1"><Users className="w-4 h-4" /><span>{course.views.toLocaleString()} views</span></div>
                    <div className="flex items-center space-x-1"><BookOpen className="w-4 h-4" /><span>{courseLessons.length} lessons</span></div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              {progress && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="glass-card rounded-3xl p-6 mb-6 shadow-lg border-red-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your Progress</h3>
                      <span className="text-2xl font-bold text-red-600">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1.5 }}
                        className={`h-full rounded-full bg-${enrollment?.completed ? 'emerald-500' : 'red-500'}`}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-center">
                      <div className="bg-slate-50 rounded-xl py-3">
                        <p className="text-2xl font-bold text-slate-700">{courseLessons.length}</p>
                        <p className="text-slate-400 text-xs">Total</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl py-3">
                        <p className="text-2xl font-bold text-emerald-600">{completedLessonIds.length}</p>
                        <p className="text-slate-400 text-xs">Completed</p>
                      </div>
                      <div className="bg-red-50 rounded-xl py-3">
                        <p className="text-2xl font-bold text-red-600">{courseLessons.length - completedLessonIds.length}</p>
                        <p className="text-slate-400 text-xs">Remaining</p>
                      </div>
                    </div>

                    {/* Complete Course Button */}
                    {allLessonsComplete && !enrollment?.completed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <Button
                          onClick={handleCompleteCourse}
                          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-xl shadow-emerald-500/20 text-lg"
                        >
                          <Trophy className="w-5 h-5 mr-2" />
                          Complete This Course
                          <Sparkles className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {enrollment?.completed && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                        <p className="text-emerald-700 font-semibold flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Course completed on {enrollment.completedAt}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tabs */}
              <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-12 rounded-2xl glass-card p-1">
                  <TabsTrigger value="lessons" className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Course Overview ({courseLessons.length})
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Ratings & Reviews ({courseReviews.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="mt-6 space-y-6">
                  {/* Lesson Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                      placeholder="Search lessons by name..."
                      className="pl-11 h-11 glass-card rounded-xl border-white/40"
                    />
                  </div>

                  {/* Incomplete Lessons */}
                  {incompleteLessons.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 flex items-center text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center mr-3">
                          <Circle className="w-3.5 h-3.5 text-white" />
                        </div>
                        {progress ? `Continue Learning (${incompleteLessons.length})` : `Course Content (${incompleteLessons.length})`}
                      </h3>
                      <div className="space-y-3">
                        {incompleteLessons.map((lesson, index) => {
                          const status = getLessonStatus(lesson.id);
                          return (
                            <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                              <div
                                onClick={() => handleLessonClick(lesson.id)}
                                className={`p-4 rounded-2xl glass-card hover:shadow-xl transition-all cursor-pointer group/lesson ${
                                  status.isInProgress ? 'border-l-4 border-l-red-500 ring-1 ring-red-100' : 'border-l-4 border-l-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 flex-1">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover/lesson:scale-110 transition-transform ${
                                      status.isInProgress
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                        : 'bg-red-100 text-red-600'
                                    }`}>
                                      {getLessonIcon(lesson.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-800">{lesson.title}</h4>
                                        {status.isInProgress && (
                                          <Badge className="bg-red-100 text-red-600 text-[10px] rounded-md">In Progress</Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-500">{lesson.description}</p>
                                      {/* Resources/Attachments */}
                                      {lesson.resources && lesson.resources.length > 0 && (
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <Paperclip className="w-3 h-3 text-slate-400" />
                                          <span className="text-xs text-slate-400">{lesson.resources.length} attachment{lesson.resources.length > 1 ? 's' : ''}</span>
                                          {lesson.resources.map(r => (
                                            <Badge key={r.id} variant="outline" className="text-[10px] rounded-md">{r.title}</Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 flex-shrink-0">
                                    {lesson.duration && <span className="text-sm text-slate-400">{lesson.duration}</span>}
                                    <Badge variant="outline" className="capitalize rounded-lg text-xs">{lesson.type}</Badge>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Completed Lessons */}
                  {completedLessons.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 flex items-center text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mr-3">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        Completed ({completedLessons.length})
                      </h3>
                      <div className="space-y-3">
                        {completedLessons.map((lesson, index) => (
                          <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                            <div
                              onClick={() => handleLessonClick(lesson.id)}
                              className="p-4 rounded-2xl glass-card hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-emerald-500 opacity-80 hover:opacity-100"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800">{lesson.title}</h4>
                                    <p className="text-sm text-slate-500">{lesson.description}</p>
                                    {lesson.resources && lesson.resources.length > 0 && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <Paperclip className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs text-slate-400">{lesson.resources.length} attachment{lesson.resources.length > 1 ? 's' : ''}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-md shadow-emerald-500/20">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Done
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredLessons.length === 0 && lessonSearch && (
                    <div className="text-center py-12 glass-card rounded-2xl">
                      <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-500">No lessons match "{lessonSearch}"</p>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  {/* Average Rating Summary */}
                  <div className="glass-card rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {averageRating.toFixed(1)}
                      </p>
                      <div className="flex justify-center mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{courseReviews.length} review{courseReviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const count = courseReviews.filter(r => r.rating === stars).length;
                        const pct = courseReviews.length > 0 ? (count / courseReviews.length) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 w-6">{stars}</span>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-slate-400 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Review - only for logged-in users who completed the course */}
                  {user && enrollment?.completed && !hasReviewed && (
                    <div className="glass-card rounded-3xl p-6 mb-6 border-red-100">
                      <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Write a Review</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-slate-600">Rating</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <motion.button key={star} onClick={() => setRating(star)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                              <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} transition-colors`} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <Textarea placeholder="Share your experience..." value={review} onChange={(e) => setReview(e.target.value)} className="mb-4 min-h-[100px] rounded-2xl glass-card border-white/40" />
                      <Button onClick={handleSubmitReview} className="bg-red-500 text-white rounded-xl shadow-lg">
                        Submit Review <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {user && !enrollment?.completed && isAuthenticated && (
                    <div className="glass-card rounded-2xl p-4 mb-6 bg-amber-50/50 border border-amber-200/50 text-center">
                      <p className="text-amber-700 text-sm">Complete this course to leave a review</p>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {courseReviews.map(rev => (
                      <motion.div key={rev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card rounded-2xl p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="ring-2 ring-indigo-100">
                              <AvatarImage src={rev.userAvatar} />
                              <AvatarFallback className="bg-red-500 text-white">{rev.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-800">{rev.userName}</p>
                                  <p className="text-xs text-slate-400">{rev.createdAt}</p>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-600">{rev.comment}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {courseReviews.length === 0 && (
                      <div className="text-center py-16 glass-card rounded-3xl">
                        <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="glass-card rounded-3xl p-6 sticky top-24 shadow-xl">
                <h3 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Info</h3>
                
                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Duration', value: course.duration },
                    { label: 'Lessons', value: courseLessons.length },
                    { label: 'Rating', value: (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}</span>
                        <span className="text-xs text-slate-400">({courseReviews.length})</span>
                      </div>
                    )},
                    { label: 'Students', value: course.views.toLocaleString() },
                    { label: 'Access', value: (
                      <Badge variant="outline" className="rounded-lg capitalize text-xs">
                        {course.accessRule === 'open' ? '🔓 Open' : course.accessRule === 'invitation' ? '🔒 Invitation' : '💰 Paid'}
                      </Badge>
                    )},
                    { label: 'Visibility', value: (
                      <Badge variant="outline" className="rounded-lg capitalize text-xs">
                        {course.visibility === 'everyone' ? '🌍 Everyone' : '👤 Members Only'}
                      </Badge>
                    )},
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100/60 last:border-0">
                      <span className="text-slate-500 text-sm">{item.label}</span>
                      <span className="font-semibold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                {!isAuthenticated && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={() => navigate('/login')} className="w-full h-12 bg-red-500 text-white shadow-xl shadow-red-500/20 rounded-xl">
                      Sign In to Enroll <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {/* Admin Can Only Preview */}
                {isAuthenticated && user?.role === 'admin' && (
                  <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <p className="text-sm font-semibold text-blue-700">
                      📊 Admin View Only
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Admins can preview course details but cannot enroll.
                    </p>
                  </div>
                )}

                {isAuthenticated && user?.role !== 'admin' && !enrollment && course.accessRule === 'open' && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleEnroll} className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl shadow-emerald-500/20 rounded-xl">
                      <Play className="w-4 h-4 mr-2" /> Start Learning <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {isAuthenticated && user?.role !== 'admin' && !enrollment && course.accessRule === 'payment' && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleEnroll} className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 rounded-xl">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Buy Course
                    </Button>
                  </motion.div>
                )}

                {isAuthenticated && user?.role !== 'admin' && !enrollment && course.accessRule === 'invitation' && (
                  <>
                    {courseInvitations.some(i => i.courseId === course.id && i.userId === user?.id) ? (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleEnroll} className="w-full h-12 bg-red-500 text-white shadow-xl shadow-red-500/20 rounded-xl">
                          <Play className="w-4 h-4 mr-2" /> Accept Invitation
                        </Button>
                      </motion.div>
                    ) : (
                      <Button disabled className="w-full h-12 rounded-xl">
                        <Lock className="w-4 h-4 mr-2" /> Invitation Required
                      </Button>
                    )}
                  </>
                )}

                {enrollment && !enrollment.completed && (
                  <Link to={`/lesson/${id}/${firstIncompleteLesson?.id || courseLessons[0]?.id}`}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full h-12 bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 rounded-xl">
                        {completedLessonIds.length > 0 ? 'Continue Learning' : 'Start Learning'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                )}

                {enrollment?.completed && (
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl px-4 py-2 text-sm shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="w-4 h-4 mr-2" /> Course Completed
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}