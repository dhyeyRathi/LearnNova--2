import { useState, useEffect } from 'react';
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
import { courses, lessons, quizzes, userProgress, users } from '../data/mockData';
import { X, ChevronLeft, ChevronRight, Menu, CheckCircle, Circle, FileText, Video, Image as ImageIcon, HelpCircle, LogOut, User, Trophy, Minimize2, Paperclip, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { user, logout } = useAuth();
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

  const course = courses.find(c => c.id === courseId);
  const lesson = lessons.find(l => l.id === lessonId);
  const courseLessons = lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  const quiz = lesson?.type === 'quiz' ? quizzes.find(q => q.id === lesson.content) : null;
  const progress = user ? userProgress.find(p => p.userId === user.id && p.courseId === courseId) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!course || !lesson) {
      navigate('/courses');
    }
  }, [user, course, lesson, navigate]);

  if (!course || !lesson || !user) return null;

  const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  const nextLesson = courseLessons[currentLessonIndex + 1];
  const prevLesson = courseLessons[currentLessonIndex - 1];
  const isCompleted = progress?.completedLessons.includes(lessonId || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleComplete = () => {
    if (!isCompleted) {
      // Award base points for lesson completion
      const points = lesson.type === 'quiz' ? 0 : 10; // Quizzes award points per question
      if (points > 0) {
        const updatedUser = { ...user, points: user.points + points };
        users.find(u => u.id === user.id)!.points = updatedUser.points;
        setEarnedPoints(points);
        setShowPointsPopup(true);
      }
      toast.success('Lesson completed!');
    }
    if (nextLesson) {
      navigate(`/lesson/${courseId}/${nextLesson.id}`);
    } else {
      navigate(`/course/${courseId}`);
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
      const updatedUser = { ...user, points: user.points + points };
      users.find(u => u.id === user.id)!.points = updatedUser.points;
      setEarnedPoints(points);
      setQuizScore(prev => prev + points);
      setShowPointsPopup(true);
      toast.success(`Correct! +${points} points`);
    } else {
      toast.error('Incorrect. Try again!');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
      // Auto-show feedback modal after brief delay
      setTimeout(() => setShowFeedbackModal(true), 500);
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
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
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
              <div className="w-24 h-24 rounded-3xl bg-red-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30">
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
                  <span className="text-red-400 font-semibold">Multiple attempts allowed.</span>{' '}
                  Points decrease with each attempt per question. Answer correctly on the first try for maximum points!
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setQuizStarted(true)}
                  className="h-14 px-12 text-lg bg-red-500 text-white rounded-2xl shadow-2xl shadow-red-500/30"
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
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center" style={{ fontSize: 'inherit' }}>
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{quiz.title}</h2>
              <p className="text-xs text-white/50">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
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
            className="h-full bg-red-500"
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
                    <Button onClick={() => { handleComplete(); }} className="bg-red-500 text-white rounded-xl px-8 h-12">
                      Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={() => navigate(`/course/${courseId}`)} className="bg-red-500 text-white rounded-xl px-8 h-12">
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
                            : 'border-white/10 bg-white/5 hover:border-red-400/50 hover:bg-white/10'
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
                      <Button onClick={handleNextQuestion} className="w-full h-14 bg-red-500 text-white rounded-xl shadow-lg text-lg">
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
                  <AvatarFallback className="bg-red-500 text-white">
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
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
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
                  <span className="font-semibold text-red-400">
                    {progress ? `${Math.round((progress.completedLessons.length / courseLessons.length) * 100)}%` : '0%'} complete
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
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
                                ? 'bg-red-500 shadow-lg shadow-red-500/20'
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
                  variant="outline"
                  className="w-full text-slate-300 border-slate-600 hover:bg-slate-800 rounded-xl"
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
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-400">Video Player</p>
                      <p className="text-sm text-slate-500 mt-2">{lesson.content}</p>
                    </div>
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
                        className="h-full bg-red-500 transition-all duration-300"
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
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-red-400 hover:bg-red-50'
                                } ${showAnswer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option}</span>
                                  {showCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  {showIncorrect && (
                                    <X className="w-5 h-5 text-red-600" />
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
                            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white"
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
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-t border-slate-700">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Button
                  onClick={() => prevLesson && navigate(`/lesson/${courseId}/${prevLesson.id}`)}
                  disabled={!prevLesson}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700"
                >
                  <ChevronLeft className="mr-2 w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleComplete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {nextLesson ? 'Next Lesson' : 'Complete Course'}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
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