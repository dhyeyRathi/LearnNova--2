import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toolAwareChatResponse } from '../../utils/novaAgent';

interface QuizFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizTitle: string;
  score: number;
  maxScore: number;
  answers: Array<{
    question: string;
    selected: string;
    correct: string;
    is_correct: boolean;
  }>;
}

export default function QuizFeedbackModal({ isOpen, onClose, quizTitle, score, maxScore, answers }: QuizFeedbackModalProps) {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scorePercent = Math.round((score / maxScore) * 100);
  const correctCount = answers.filter(a => a.is_correct).length;

  useEffect(() => {
    if (isOpen && feedback === '') {
      generateFeedback();
    }
  }, [isOpen]);

  const generateFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a message that triggers quiz feedback tool
      const feedbackMessage = `I just completed the "${quizTitle}" quiz. Here are my results:
Score: ${score}/${maxScore} (${scorePercent}%)
Correct: ${correctCount}/${answers.length}

Quiz details:
${answers.map((a, i) => `Q${i + 1}: "${a.question}" - I answered "${a.selected}" (${a.is_correct ? 'Correct ✓' : 'Incorrect ✗'}) - Correct Answer: "${a.correct}"`).join('\n')}

Please provide detailed feedback and insights on my performance.`;

      const response = await toolAwareChatResponse(feedbackMessage);
      setFeedback(response);
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      console.error('Feedback generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = () => {
    if (scorePercent >= 80) return 'from-emerald-500 to-green-500';
    if (scorePercent >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const getPerformanceMessage = () => {
    if (scorePercent >= 90) return '🌟 Outstanding! You\'ve mastered this topic!';
    if (scorePercent >= 80) return '✨ Excellent work! You\'re doing great!';
    if (scorePercent >= 70) return '👏 Good job! Keep practicing to improve!';
    if (scorePercent >= 60) return '💪 Nice effort! Review the weak areas!';
    return '📚 Keep learning! You\'ll get better with practice!';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nova's Analysis</h2>
                  <p className="text-sm text-white/70">AI-powered quiz feedback</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Score Card */}
              <div className={`bg-gradient-to-br ${getPerformanceColor()} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Your Score</p>
                    <p className="text-5xl font-bold">{scorePercent}%</p>
                    <p className="text-sm opacity-90 mt-2">{score} out of {maxScore} points</p>
                  </div>
                  <div className="text-6xl opacity-20">
                    {scorePercent >= 80 ? '🎉' : scorePercent >= 60 ? '👍' : '💪'}
                  </div>
                </div>
                <p className="text-lg font-semibold">{getPerformanceMessage()}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{correctCount}</p>
                  <p className="text-xs text-white/60">Correct</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{answers.length - correctCount}</p>
                  <p className="text-xs text-white/60">Need Review</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">+{Math.round(score * 1.5)}</p>
                  <p className="text-xs text-white/60">Points</p>
                </div>
              </div>

              {/* Nova's Feedback */}
              <div className="bg-white/5 border border-indigo-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Nova's Insights</h3>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span className="ml-3 text-white/70">Analyzing your performance...</span>
                  </div>
                ) : error ? (
                  <div className="text-rose-400 text-sm">{error}</div>
                ) : (
                  <div className="text-white/80 text-sm leading-relaxed prose prose-invert max-w-none">
                    {/* Render feedback with markdown-like formatting */}
                    {feedback.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">
                        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => 
                          part.startsWith('**') && part.endsWith('**') 
                            ? <span key={j} className="font-bold text-indigo-300">{part.slice(2, -2)}</span>
                            : <span key={j}>{part}</span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Areas to Improve */}
              {answers.filter(a => !a.is_correct).length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Topics to Review
                  </h3>
                  <div className="space-y-2">
                    {answers.filter(a => !a.is_correct).map((answer, i) => (
                      <div key={i} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-1">→</span>
                        <span>
                          <strong className="text-white">{answer.question}</strong>
                          <br />
                          <span className="text-xs text-white/50">Your answer: {answer.selected} | Correct: {answer.correct}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-slate-900/50 px-8 py-4 flex items-center justify-between">
              <p className="text-sm text-white/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Powered by Nova AI
              </p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50"
              >
                Continue Learning
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
