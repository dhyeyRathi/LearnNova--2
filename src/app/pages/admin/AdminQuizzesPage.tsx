import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { quizzes, courses, lessons } from '../../data/mockData';
import { Plus, Trash2, Check, Edit, Search, Crown, Copy, MoreVertical, BookOpen, Clock, Users, ArrowRight, X, Upload, HelpCircle, Trophy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminQuizzesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [allQuizzes, setAllQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzesList');
      if (saved) {
        return [...quizzes, ...JSON.parse(saved)];
      }
      return quizzes;
    } catch {
      return quizzes;
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Access Required</h2>
          <p className="text-slate-500 mt-2 mb-4">This page is only accessible to administrators.</p>
          <Button onClick={() => navigate('/courses')} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  // Get course name for a quiz
  const getCourseForQuiz = (quizId: string) => {
    const lesson = lessons.find(l => l.type === 'quiz' && l.content === quizId);
    if (lesson) {
      const course = courses.find(c => c.id === lesson.courseId);
      return course?.title || 'Unlinked';
    }
    return 'Unlinked';
  };

  const getQuizQuestionCount = (quizId: string) => {
    const quiz = allQuizzes.find(q => q.id === quizId);
    return quiz?.questions.length || 0;
  };

  const filteredQuizzes = allQuizzes.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return q.title.toLowerCase().includes(query) || getCourseForQuiz(q.id).toLowerCase().includes(query);
  });

  const openNewQuiz = () => {
    navigate('/admin/quiz-builder');
  };

  const openEditQuiz = (quizId: string) => {
    navigate(`/admin/quiz-builder?quizId=${quizId}`);
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (deleteConfirm === quizId) {
      setAllQuizzes(allQuizzes.filter(q => q.id !== quizId));
      try {
        const userQuizzes = allQuizzes.filter(q => q.id !== quizId && q.id.startsWith('quiz-'));
        localStorage.setItem('quizzesList', JSON.stringify(userQuizzes));
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
      toast.success('Quiz deleted successfully');
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(quizId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleDuplicateQuiz = (quizId: string) => {
    const quiz = allQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const duplicate = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      title: `${quiz.title} (Copy)`,
    };
    
    const updated = [...allQuizzes, duplicate];
    setAllQuizzes(updated);
    
    try {
      const userQuizzes = updated.filter(q => q.id.startsWith('quiz-'));
      localStorage.setItem('quizzesList', JSON.stringify(userQuizzes));
    } catch (error) {
      console.error('Error duplicating quiz:', error);
    }
    
    toast.success('Quiz duplicated!');
  };

  const handlePublishQuiz = (quizId: string) => {
    const updated = allQuizzes.map(q => {
      if (q.id === quizId) {
        return { ...q, published: true, publishedAt: new Date().toISOString() };
      }
      return q;
    });
    
    setAllQuizzes(updated);
    
    try {
      const userQuizzes = updated.filter(q => q.id.startsWith('quiz-'));
      localStorage.setItem('quizzesList', JSON.stringify(userQuizzes));
    } catch (error) {
      console.error('Error publishing quiz:', error);
    }
    
    const quiz = updated.find(q => q.id === quizId);
    toast.success('Quiz published! Students will now have access to this quiz.', {
      description: `${quiz?.studentIds?.length || 0} students notified`,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Dashboard" to="/dashboard/admin" />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-red-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Quiz Management
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full shadow-lg shadow-red-500/20">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Admin</span>
              </div>
            </div>
            <p className="text-slate-600">Create, edit, and manage all quizzes across courses</p>
          </div>
          <Button onClick={openNewQuiz} className="bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 h-12 px-6 rounded-xl">
            <Plus className="w-5 h-5 mr-2" />Create Quiz
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-5 glass-card rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{quizzes.length}</p>
                  <p className="text-sm text-slate-500">Total Quizzes</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 glass-card rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{quizzes.reduce((a, q) => a + q.questions.length, 0)}</p>
                  <p className="text-sm text-slate-500">Total Questions</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-5 glass-card rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{new Set(quizzes.map(q => { const l = lessons.find(l => l.type === 'quiz' && l.content === q.id); return l?.courseId; }).filter(Boolean)).size}</p>
                  <p className="text-sm text-slate-500">Courses with Quizzes</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search quizzes or courses..." className="pl-12 h-12 glass-card rounded-2xl border-white/40" />
          </div>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz, index) => (
              <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="glass-card rounded-3xl p-6 hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                      <HelpCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{quiz.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="rounded-lg text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />{getCourseForQuiz(quiz.id)}
                            </Badge>
                            {quiz.published && (
                              <Badge className="rounded-lg text-xs bg-green-500/10 text-green-700 border border-green-200">
                                <Check className="w-3 h-3 mr-1" />Published
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card rounded-xl">
                            {!quiz.published ? (
                              <DropdownMenuItem onClick={() => handlePublishQuiz(quiz.id)} className="rounded-lg text-amber-600">
                                <Upload className="w-4 h-4 mr-2" />Publish Quiz
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled className="rounded-lg text-green-600">
                                <Check className="w-4 h-4 mr-2" />Published
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditQuiz(quiz.id)} className="rounded-lg">
                              <Edit className="w-4 h-4 mr-2" />Edit Quiz
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateQuiz(quiz.id)} className="rounded-lg">
                              <Copy className="w-4 h-4 mr-2" />Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteQuiz(quiz.id)} className="rounded-lg text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Questions preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="flex items-center gap-2 p-3 bg-orange-50/60 rounded-xl">
                          <HelpCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-semibold text-orange-700">{quiz.questions.length} Questions</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-xl">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-semibold text-amber-700">{quiz.questions.reduce((a, q) => a + q.basePoints, 0)} Max Points</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-700">{quiz.questions[0]?.options.length || 4} Options each</span>
                        </div>
                      </div>

                      {/* Quick question list */}
                      <div className="mt-4 space-y-2">
                        {quiz.questions.slice(0, 3).map((q, qi) => (
                          <div key={q.id} className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{qi + 1}</div>
                            <span className="truncate">{q.text}</span>
                          </div>
                        ))}
                        {quiz.questions.length > 3 && (
                          <p className="text-xs text-slate-400 pl-9">+{quiz.questions.length - 3} more questions</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button onClick={() => openEditQuiz(quiz.id)} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                        <Edit className="w-4 h-4 mr-2" />Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleDeleteQuiz(quiz.id)} className={`rounded-xl ${deleteConfirm === quiz.id ? 'border-red-300 bg-red-50 text-red-600' : ''}`}>
                        <Trash2 className="w-4 h-4 mr-2" />{deleteConfirm === quiz.id ? 'Confirm?' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
              </h3>
              <p className="text-slate-500 mb-6">{searchQuery ? 'Try adjusting your search' : 'Create your first quiz to get started'}</p>
              {!searchQuery && (
                <Button onClick={openNewQuiz} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />Create First Quiz
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}