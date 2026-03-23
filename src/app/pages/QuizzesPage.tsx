import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { quizzes, courses, lessons } from '../data/mockData';
import { HelpCircle, Clock, Trophy, X, CheckCircle, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import QuizFeedbackModal from '../components/QuizFeedbackModal';

interface QuizAnswer {
  question: string;
  selected: string;
  correct: string;
  is_correct: boolean;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect admins to their dashboard
  if (user?.role === 'admin') {
    navigate('/dashboard/admin', { replace: true });
    return null;
  }
  
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Load quizzes from localStorage or fall back to mock data
  const allQuizzes = (() => {
    try {
      const saved = localStorage.getItem('quizzesList');
      if (saved) {
        return [...quizzes, ...JSON.parse(saved)];
      }
      return quizzes;
    } catch {
      return quizzes;
    }
  })();

  if (!user) {
    navigate('/login');
    return null;
  }

  const quizData = allQuizzes.map(quiz => {
    const lesson = lessons.find(l => l.content === quiz.id);
    const course = lesson ? courses.find(c => c.id === lesson.courseId) : null;
    return { ...quiz, courseName: course?.title || 'General', lessonTitle: lesson?.title || quiz.title };
  });

  const currentQuiz = quizData.find(q => q.id === activeQuiz);

  const handleStartQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    setIsFullScreen(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizAnswers([]);
    setShowFeedbackModal(false);
  };

  const handleBeginQuiz = () => {
    setIsFullScreen(true);
  };

  const handleAnswer = (answerIndex: number) => {
    // Allow changing answer until Next is clicked
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const question = currentQuiz!.questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Track this answer
    setQuizAnswers(prev => [...prev, {
      question: question.text,
      selected: question.options[selectedAnswer],
      correct: question.options[question.correctAnswer],
      is_correct: isCorrect,
    }]);

    // Update score if correct
    if (isCorrect) {
      setScore(prev => prev + question.basePoints);
    }

    // Move to next question or show results
    if (currentQuestion < currentQuiz!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      setShowFeedbackModal(true);
      const finalScore = isCorrect ? score + question.basePoints : score;
      toast.success(`Quiz complete! Score: ${finalScore}/${currentQuiz!.questions.length * 10}`);
    }
  };

  const handleExitFullScreen = () => {
    setIsFullScreen(false);
    setActiveQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizAnswers([]);
    setShowFeedbackModal(false);
  };

  // Full-screen quiz mode
  if (activeQuiz && currentQuiz) {
    // Quiz intro screen
    if (!isFullScreen) {
      const totalQuestions = currentQuiz.questions.length;
      const maxPoints = currentQuiz.questions.reduce((a: number, q: any) => a + q.basePoints, 0);
      return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{currentQuiz.title}</h2>
                <p className="text-xs text-white/50">{currentQuiz.courseName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleExitFullScreen}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
              <div className="w-24 h-24 rounded-3xl bg-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-600/30">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {currentQuiz.title}
              </h2>
              <p className="text-lg text-white/60 mb-10">Test your knowledge and earn points!</p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-white mb-1">{totalQuestions}</p>
                  <p className="text-sm text-white/50">Questions</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-bold text-violet-400 mb-1">{maxPoints}</p>
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
                  onClick={handleBeginQuiz}
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

    // Full quiz in progress
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
        {/* Full-screen header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{currentQuiz.title}</h2>
              <p className="text-xs text-white/50">{currentQuiz.courseName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
              {showResult ? 'Complete' : `${currentQuestion + 1} / ${currentQuiz.questions.length}`}
            </Badge>
            <Button
              variant="ghost"
              onClick={handleExitFullScreen}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Full Screen
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-purple-600"
            animate={{ width: `${showResult ? 100 : ((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Quiz content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="w-full max-w-2xl">
            {showResult ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quiz Complete!</h2>
                <p className="text-xl text-white/70 mb-4">
                  You scored <span className="text-emerald-400 font-bold">{score}</span> out of <span className="text-white font-bold">{currentQuiz.questions.length * 10}</span> points
                </p>
                <p className="text-sm text-white/50 mb-8">
                  {quizAnswers.filter(a => a.is_correct).length} of {quizAnswers.length} questions correct
                </p>
                <div className="flex flex-col gap-4 items-center">
                  <Button
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-8 h-12 shadow-lg shadow-indigo-500/30"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    View Nova's AI Feedback
                  </Button>
                  <div className="flex gap-4">
                    <Button onClick={handleExitFullScreen} className="bg-purple-600 text-white rounded-xl px-8 h-12">
                      Back to Quizzes
                    </Button>
                    <Button onClick={() => handleStartQuiz(currentQuiz.id)} className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 rounded-xl px-8 h-12">
                      Retry
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={currentQuestion} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {currentQuiz.questions[currentQuestion].text}
                </h3>
                <div className="space-y-3 mb-8">
                  {currentQuiz.questions[currentQuestion].options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full p-5 text-left rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600/10'
                            : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{option}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-purple-500" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {selectedAnswer !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button onClick={handleNext} className="w-full h-12 bg-purple-600 text-white rounded-xl shadow-lg">
                      {currentQuestion < currentQuiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Nova AI Feedback Modal */}
        <QuizFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          quizTitle={currentQuiz.title}
          score={score}
          maxScore={currentQuiz.questions.length * 10}
          answers={quizAnswers}
        />
      </div>
    );
  }

  // Normal quizzes list view
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Quizzes
          </h1>
          <p className="text-slate-500">Test your knowledge and earn points</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizData.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card rounded-3xl p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 rounded-lg">
                    {quiz.questions.length} questions
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {quiz.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{quiz.courseName}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{quiz.questions.reduce((a, q) => a + q.basePoints, 0)} pts max</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{quiz.questions.length * 2} min</span>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}