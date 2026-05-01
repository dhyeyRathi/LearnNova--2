import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import PointsPopup from '../components/PointsPopup';
import QuizFeedbackModal from '../components/QuizFeedbackModal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

import { X, ChevronLeft, ChevronRight, Menu, CheckCircle, Circle, FileText, Video, Image as ImageIcon, HelpCircle, LogOut, User, Trophy, Minimize2, Paperclip, ArrowLeft, Loader2, Sparkles, Send, Bot, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getCourse, getLessonsByCourse, getUserProgress, updateLessonProgress, getQuizzesByCourse, submitQuizAttempt, type Course, type Lesson } from '../../utils/supabase/client';
import { toolAwareChatResponse } from '../../utils/novaAgent';

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [quizAnswersForFeedback, setQuizAnswersForFeedback] = useState<Array<{
    question: string;
    selected: string;
    correct: string;
    is_correct: boolean;
  }>>([]);

  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completing, setCompleting] = useState(false);

  // Inline Nova chat state
  const [novaOpen, setNovaOpen] = useState(false);
  const [novaMessages, setNovaMessages] = useState<Array<{id: string; role: 'user'|'assistant'; content: string}>>([]);
  const [novaInput, setNovaInput] = useState('');
  const [novaLoading, setNovaLoading] = useState(false);
  const novaEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect admins to dashboard
    if (user?.role === 'admin') {
      navigate('/dashboard/admin', { replace: true });
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        if (!courseId) return;
        
        const [courseData, lessonsData, progressData, quizzesData] = await Promise.all([
          getCourse(courseId),
          getLessonsByCourse(courseId),
          getUserProgress(user.id),
          getQuizzesByCourse(courseId)
        ]);

        setCourse(courseData);
        const normalizedLessons = lessonsData ? lessonsData.map(l => ({...l, type: l.type ? l.type.toLowerCase() : 'video'})) : [];
        setCourseLessons(normalizedLessons);
        
        const currentProgress = progressData.find((p: any) => p.courseId === courseId);
        if (currentProgress) {
          setProgress(currentProgress);
        }

        if (lessonId && normalizedLessons.length > 0) {
          const currentLesson = normalizedLessons.find(l => l.id === lessonId);
          setLesson(currentLesson || null);

          if (currentLesson?.type === 'quiz' && currentLesson.content) {
            const currentQuiz = quizzesData.find((q: any) => q.id === currentLesson.content);
            setQuiz(currentQuiz || null);
          }
        }
      } catch (error) {
        console.error('Error loading lesson player data:', error);
        toast.error('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, lessonId, user, navigate]);

  // Hide global AI floater on lesson page
  useEffect(() => {
    const aiAssistant = document.querySelector('[data-ai-assistant]') as HTMLElement;
    if (aiAssistant) {
      aiAssistant.style.display = 'none';
    }
    return () => {
      if (aiAssistant) {
        aiAssistant.style.display = '';
      }
    };
  }, []);

  // Scroll nova chat to bottom
  useEffect(() => {
    novaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [novaMessages, novaLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center text-purple-600 font-medium">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading lesson...
          </div>
        </div>
      </div>
    );
  }

  if (!course || !lesson || !user) return null;

  const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  const nextLesson = courseLessons[currentLessonIndex + 1];
  const prevLesson = courseLessons[currentLessonIndex - 1];
  const isCompleted = progress?.completedLessons?.includes(lessonId || '') || false;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      if (!isCompleted && courseId && lessonId) {
        console.log('📝 Marking lesson as complete:', { userId: user.id, courseId, lessonId });
        
        // Record progress in Supabase
        const result = await updateLessonProgress(user.id, courseId, lessonId);
        console.log('✅ Progress updated in Supabase:', result);
        
        // Award base points for lesson completion
        const points = lesson.type === 'quiz' ? 0 : 10;
        if (points > 0) {
          // Persist points to database
          try {
            await updateUser({ points: (user.points || 0) + points });
          } catch (e) { console.error('Failed to persist points:', e); }
          setEarnedPoints(points);
          setShowPointsPopup(true);
        }
        toast.success('Lesson completed!');
        
        // Update local progress state to reflect completion instantly
        const newCompletedLessons = [...(progress?.completedLessons || []), lessonId];
        setProgress({
          userId: user.id,
          courseId: courseId,
          completedLessons: newCompletedLessons,
          timeSpent: progress?.timeSpent || 0,
          lastAccessed: new Date().toISOString()
        });
        console.log('📊 Local progress updated:', newCompletedLessons);
      }
      
      if (nextLesson) {
        navigate(`/lesson/${courseId}/${nextLesson.id}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleNovaSend = async (text?: string) => {
    const msg = text || novaInput.trim();
    if (!msg || novaLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: msg };
    setNovaMessages(prev => [...prev, userMsg]);
    setNovaInput('');
    setNovaLoading(true);

    try {
      // Add lesson context to the prompt
      const contextualPrompt = `[Context: The user is currently viewing the lesson "${lesson.title}" (${lesson.type}) in the course "${course.title}". Lesson description: ${lesson.description || 'N/A'}]\n\nUser question: ${msg}`;
      const response = await toolAwareChatResponse(contextualPrompt, user);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: response };
      setNovaMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Nova error:', error);
      const errorMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: "Sorry, I couldn't process that right now. Please try again! 💙" };
      setNovaMessages(prev => [...prev, errorMsg]);
    } finally {
      setNovaLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!quiz || showAnswer) return;

    const question = quiz.questions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correctAnswer;
    
    setSelectedAnswers([...selectedAnswers, answerIndex]);
    setShowAnswer(true);

    // Track answer for feedback
    const feedbackAnswers = [...quizAnswersForFeedback];
    feedbackAnswers[currentQuestionIndex] = {
      question: question.text,
      selected: question.options[answerIndex],
      correct: question.options[question.correctAnswer],
      is_correct: isCorrect,
    };
    setQuizAnswersForFeedback(feedbackAnswers);

    // Calculate attempts for this question
    const attempts = (quizAttempts[currentQuestionIndex] || 0) + 1;
    const newAttempts = [...quizAttempts];
    newAttempts[currentQuestionIndex] = attempts;
    setQuizAttempts(newAttempts);

    if (isCorrect) {
      // Calculate points based on attempts
      const points = Math.max(question.basePoints - ((attempts - 1) * question.pointsPerAttempt), 1);
      
      // Update score in local state
      setEarnedPoints(points);
      setQuizScore(prev => prev + points);
      setShowPointsPopup(true);
      toast.success(`Correct! +${points} points`);
    } else {
      toast.error('Incorrect. Try again!');
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
      // Auto-show feedback modal after brief delay
      setTimeout(() => setShowFeedbackModal(true), 500);
      
      // Submit the quiz attempt to Supabase
      try {
        if (quiz?.id) {
          await submitQuizAttempt(user.id, quiz.id, quizScore, quizScore); // Points earned same as score here
        }
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  // Full-screen quiz mode for quiz lessons
  if (lesson.type === 'quiz' && quiz) {
    // Quiz Intro Screen
    if (!quizStarted) {
      const totalQuestions = quiz.questions.length;
      const maxPoints = quiz.questions.reduce((a, q) => a + q.basePoints, 0);
      return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{quiz.title}</h2>
                <p className="text-xs text-white/50">{course.title}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/course/${courseId}`)}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg w-full text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-600/30">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {quiz.title}
              </h2>
              <p className="text-lg text-white/60 mb-10">
                Test your knowledge and earn points!
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-white mb-1">{totalQuestions}</p>
                  <p className="text-sm text-white/50">Questions</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-amber-400 mb-1">{maxPoints}</p>
                  <p className="text-sm text-white/50">Max Points</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-emerald-400 mb-1">∞</p>
                  <p className="text-sm text-white/50">Attempts</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10 text-left">
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-purple-500 font-semibold">Multiple attempts allowed.</span>{' '}
                  Points decrease with each attempt per question. Answer correctly on the first try for maximum points!
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setQuizStarted(true)}
                  className="h-14 px-12 text-lg bg-purple-600 text-white rounded-2xl shadow-2xl shadow-purple-600/30"
                >
                  Start Quiz
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      );
    }

    const currentQ = quiz.questions[currentQuestionIndex];
    const attempts = quizAttempts[currentQuestionIndex] || 0;
    const lastSelectedAnswer = selectedAnswers[selectedAnswers.length - 1];

    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center" style={{ fontSize: 'inherit' }}>
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{quiz.title}</h2>
              <p className="text-xs text-white/50">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
              {quizCompleted ? 'Complete' : `${currentQuestionIndex + 1} / ${quiz.questions.length}`}
            </Badge>
            <Button
              variant="ghost"
              onClick={() => navigate(`/course/${courseId}`)}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-purple-600"
            animate={{ width: `${quizCompleted ? 100 : ((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="w-full max-w-3xl">
            {quizCompleted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quiz Complete!</h2>
                <p className="text-xl text-white/70 mb-8">
                  You scored <span className="text-emerald-400 font-bold">{quizScore}</span> out of <span className="text-white font-bold">{quiz.questions.reduce((a, q) => a + q.basePoints, 0)}</span> points
                </p>
                <div className="flex gap-4 justify-center">
                  {nextLesson ? (
                    <Button onClick={() => { handleComplete(); }} disabled={completing} className="bg-purple-600 text-white rounded-xl px-8 h-12">
                      {completing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      {completing ? 'Completing...' : (nextLesson ? 'Next Lesson' : 'Finish Course')}
                      {!completing && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/course/${courseId}`)} className="bg-purple-600 text-white rounded-xl px-8 h-12">
                      Back to Course
                    </Button>
                  )}
                  <Button onClick={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers([]);
                    setQuizAttempts([]);
                    setShowAnswer(false);
                    setQuizCompleted(false);
                    setQuizScore(0);
                  }} variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl px-8 h-12">
                    Retry Quiz
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {currentQ.text}
                </h3>
                <div className="space-y-3 mb-8">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = showAnswer && lastSelectedAnswer === idx;
                    const isCorrect = idx === currentQ.correctAnswer;
                    const showFeedback = showAnswer;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={!showAnswer ? { scale: 1.02 } : {}}
                        whileTap={!showAnswer ? { scale: 0.98 } : {}}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={showAnswer}
                        className={`w-full p-5 text-left rounded-2xl border-2 transition-all ${
                          showFeedback && isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : showFeedback && isSelected && !isCorrect
                            ? 'border-rose-500 bg-rose-500/10'
                            : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                        } ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-lg">{option}</span>
                          {showFeedback && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                          {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 text-rose-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {lastSelectedAnswer === currentQ.correctAnswer ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                        <p className="text-emerald-300 font-semibold text-lg">Correct!</p>
                        <p className="text-emerald-400/70 text-sm">
                          +{Math.max(currentQ.basePoints - ((attempts - 1) * currentQ.pointsPerAttempt), 1)} points earned
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                        <p className="text-amber-300 font-semibold text-lg">Not quite!</p>
                        <p className="text-amber-400/70 text-sm">
                          Attempt {attempts} — Points decrease with each attempt
                        </p>
                      </div>
                    )}

                    {lastSelectedAnswer === currentQ.correctAnswer && (
                      <Button onClick={handleNextQuestion} className="w-full h-14 bg-purple-600 text-white rounded-xl shadow-lg text-lg">
                        {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <PointsPopup
          points={earnedPoints}
          totalPoints={user.points}
          show={showPointsPopup}
          onClose={() => setShowPointsPopup(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{lesson.title}</h1>
            <p className="text-sm text-slate-300">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg shadow-md">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-3 border-b">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-slate-300">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1 capitalize">{user.role}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/my-courses')} className="text-white hover:bg-slate-700">
                <User className="w-4 h-4 mr-2" />
                My Courses
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-purple-500 hover:text-purple-400 hover:bg-slate-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-900 text-white border-r border-slate-700 overflow-hidden flex flex-col"
            >
              {/* Sidebar Header with Course Info */}
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{course.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{progress ? `${progress.completedLessons.length}/${courseLessons.length} lessons` : `${courseLessons.length} lessons`}</span>
                  <span className="font-semibold text-purple-500">
                    {progress ? `${Math.round((progress.completedLessons.length / courseLessons.length) * 100)}%` : '0%'} complete
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress ? (progress.completedLessons.length / courseLessons.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="space-y-1">
                    {courseLessons.map((l, index) => {
                      const completed = progress?.completedLessons.includes(l.id);
                      const current = l.id === lessonId;
                      return (
                        <div key={l.id}>
                          <button
                            onClick={() => navigate(`/lesson/${courseId}/${l.id}`)}
                            className={`w-full text-left p-3 rounded-xl transition-all ${
                              current
                                ? 'bg-purple-600 shadow-lg shadow-purple-600/20'
                                : 'hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                completed ? 'bg-emerald-500' : current ? 'bg-white/20' : 'bg-slate-700'
                              }`}>
                                {completed ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  getLessonIcon(l.type)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{l.title}</p>
                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                  <span className="capitalize">{l.type}</span>
                                  {l.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{l.duration}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                          {/* Show attachments under current lesson */}
                          {current && l.resources && l.resources.length > 0 && (
                            <div className="ml-11 mt-1 mb-2 space-y-1">
                              {l.resources.map(r => (
                                <a
                                  key={r.id}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                  <Paperclip className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{r.title}</span>
                                  <Badge variant="outline" className="text-[10px] ml-auto border-slate-600">{r.type}</Badge>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>

              {/* Back button at bottom of sidebar */}
              <div className="p-4 border-t border-slate-700/50">
                <Button
                  onClick={() => navigate('/my-courses')}
                  className="w-full bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-300 border border-purple-500/30 hover:from-purple-600/30 hover:to-violet-600/30 hover:text-white rounded-xl h-11 font-medium transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Courses
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto p-8">
              {/* Video Lesson */}
              {lesson.type === 'video' && (
                <Card className="overflow-hidden bg-slate-800 border-slate-700">
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <video 
                      src={lesson.video_url || lesson.content}
                      controls
                      className="w-full h-full object-contain"
                      controlsList="nodownload"
                      onEnded={async () => {
                        if (!isCompleted && courseId && lessonId) {
                          try {
                            await updateLessonProgress(user.id, courseId, lessonId);
                            const newCompletedLessons = [...(progress?.completedLessons || []), lessonId];
                            setProgress({
                              userId: user.id,
                              courseId: courseId,
                              completedLessons: newCompletedLessons,
                              timeSpent: progress?.timeSpent || 0,
                              lastAccessed: new Date().toISOString()
                            });
                            setEarnedPoints(10);
                            setShowPointsPopup(true);
                            // Persist points to database
                            try {
                              await updateUser({ points: (user.points || 0) + 10 });
                            } catch (e) { console.error('Failed to persist points:', e); }
                            toast.success('Lesson completed! +10 points');
                          } catch (error) {
                            console.error('Error auto-completing lesson:', error);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                    <p className="text-slate-300">{lesson.description}</p>
                    {lesson.resources && lesson.resources.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Additional Resources</h3>
                        <div className="space-y-2">
                          {lesson.resources.map(resource => (
                            <a
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{resource.title}</span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {resource.type}
                                </Badge>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Inline Nova Help - shown for all lesson types */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                {!novaOpen ? (
                  <button
                    onClick={() => setNovaOpen(true)}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600/10 to-violet-600/10 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-600/15 hover:to-violet-600/15 transition-all group flex items-center justify-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">Ask Nova for help with this content</p>
                      <p className="text-xs text-slate-400">Get summaries, explanations, and answers about this lesson</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Card className="overflow-hidden bg-slate-800 border-slate-700 rounded-2xl">
                    {/* Nova Header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-purple-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-white leading-tight">Nova AI</h3>
                          <p className="text-[10px] text-white/50">Lesson Assistant</p>
                        </div>
                      </div>
                      <button onClick={() => setNovaOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-3 border-b border-slate-700/50 flex gap-2 overflow-x-auto">
                      {[
                        { label: '📝 Summarize this lesson', prompt: `Summarize the lesson titled "${lesson.title}". Description: ${lesson.description || 'No description'}. This is a ${lesson.type} lesson from the course "${course.title}".` },
                        { label: '🔑 Key takeaways', prompt: `What are the key takeaways from the lesson "${lesson.title}" in the course "${course.title}"? Description: ${lesson.description || 'No description'}.` },
                        { label: '❓ Quiz me', prompt: `Generate 3 quick quiz questions based on the lesson "${lesson.title}" from course "${course.title}". Description: ${lesson.description || 'No description'}. Format each as a question with 4 options and indicate the correct answer.` },
                      ].map(action => (
                        <button
                          key={action.label}
                          onClick={() => handleNovaSend(action.prompt)}
                          disabled={novaLoading}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 rounded-lg border border-purple-500/20 transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>

                    {/* Messages */}
                    {novaMessages.length > 0 && (
                      <div className="max-h-80 overflow-y-auto px-4 py-4 space-y-3">
                        {novaMessages.map(msg => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              msg.role === 'assistant' ? 'bg-purple-600 text-white' : 'bg-slate-600 text-purple-300'
                            }`}>
                              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            </div>
                            <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              msg.role === 'assistant'
                                ? 'bg-slate-700 text-slate-200 border border-slate-600'
                                : 'bg-purple-600 text-white'
                            }`}>
                              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                            </div>
                          </motion.div>
                        ))}
                        {novaLoading && (
                          <div className="flex gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3">
                              <div className="flex gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={novaEndRef} />
                      </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-slate-700/50">
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleNovaSend(); }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={novaInput}
                          onChange={(e) => setNovaInput(e.target.value)}
                          placeholder="Ask about this lesson..."
                          className="flex-1 h-10 px-3.5 rounded-xl bg-slate-700 border border-slate-600 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!novaInput.trim() || novaLoading}
                          className="h-10 w-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0 shadow-sm disabled:opacity-40"
                        >
                          {novaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </form>
                    </div>
                  </Card>
                )}
              </motion.div>

              {/* Document Lesson */}
              {lesson.type === 'document' && (
                <Card className="overflow-hidden bg-white">
                  <div className="p-8">
                    <h2 className="text-3xl font-bold mb-4">{lesson.title}</h2>
                    <p className="text-slate-600 mb-6">{lesson.description}</p>
                    <div className="aspect-[8.5/11] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-500">Document Content</p>
                        <p className="text-sm text-slate-400 mt-2">{lesson.content}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Image Lesson */}
              {lesson.type === 'image' && (
                <Card className="overflow-hidden bg-white">
                  <img
                    src={lesson.content}
                    alt={lesson.title}
                    className="w-full"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                    <p className="text-slate-600">{lesson.description}</p>
                  </div>
                </Card>
              )}

              {/* Quiz Lesson */}
              {lesson.type === 'quiz' && quiz && (
                <Card className="bg-white p-8">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold">{quiz.title}</h2>
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                      </Badge>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {quiz.questions.map((question, qIndex) => {
                    if (qIndex !== currentQuestionIndex) return null;
                    
                    const attempts = quizAttempts[qIndex] || 0;
                    const selectedAnswer = selectedAnswers[selectedAnswers.length - 1];

                    return (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <h3 className="text-2xl font-semibold mb-6">{question.text}</h3>
                        <div className="space-y-3 mb-6">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = showAnswer && selectedAnswer === optionIndex;
                            const isCorrect = optionIndex === question.correctAnswer;
                            const showCorrect = showAnswer && isCorrect;
                            const showIncorrect = showAnswer && isSelected && !isCorrect;

                            return (
                              <button
                                key={optionIndex}
                                onClick={() => handleQuizAnswer(optionIndex)}
                                disabled={showAnswer}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                                  showCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : showIncorrect
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-slate-200 hover:border-purple-500 hover:bg-purple-50'
                                } ${showAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option}</span>
                                  {showCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  {showIncorrect && (
                                    <X className="w-5 h-5 text-purple-700" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {showAnswer && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {selectedAnswer === question.correctAnswer ? (
                              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                                <p className="text-green-800 font-semibold">Correct!</p>
                                <p className="text-green-700 text-sm">
                                  You earned {Math.max(question.basePoints - ((attempts - 1) * question.pointsPerAttempt), 1)} points
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                                <p className="text-amber-800 font-semibold">Try again!</p>
                                <p className="text-amber-700 text-sm">
                                  Attempt {attempts} - Points decrease with each attempt
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {showAnswer && selectedAnswer === question.correctAnswer && (
                          <Button
                            onClick={handleNextQuestion}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                            <ChevronRight className="ml-2 w-5 h-5" />
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Navigation Footer */}
          {lesson.type !== 'quiz' && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 border-t border-slate-700">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <Button
                  onClick={() => prevLesson && navigate(`/lesson/${courseId}/${prevLesson.id}`)}
                  disabled={!prevLesson}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700 h-10 rounded-xl px-5 text-sm font-medium"
                >
                  <ChevronLeft className="mr-1.5 w-4 h-4" />
                  Previous
                </Button>
                <div className="text-xs text-slate-400">
                  {isCompleted && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>}
                  {!isCompleted && <span>Watch to complete</span>}
                </div>
                {nextLesson ? (
                  <Button
                    onClick={() => navigate(`/lesson/${courseId}/${nextLesson.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-10 rounded-xl px-5 text-sm font-medium"
                  >
                    Next Lesson
                    <ChevronRight className="ml-1.5 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(`/course/${courseId}`)}
                    variant="outline"
                    className="text-white border-slate-600 hover:bg-slate-700 h-10 rounded-xl px-5 text-sm font-medium"
                  >
                    Back to Course
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Points Popup */}
      <PointsPopup
        points={earnedPoints}
        totalPoints={user.points}
        show={showPointsPopup}
        onClose={() => setShowPointsPopup(false)}
      />

      {/* Quiz Feedback Modal */}
      {quiz && (
        <QuizFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          quizTitle={quiz.title}
          score={quizScore}
          maxScore={quiz.questions.reduce((sum, q) => sum + q.basePoints, 0)}
          answers={quizAnswersForFeedback}
        />
      )}
    </div>
  );
}