import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Brain, ChevronDown, ChevronUp, Lightbulb, Target, BookOpen } from 'lucide-react';
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
  const [questionExplanations, setQuestionExplanations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExplanations, setIsLoadingExplanations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const scorePercent = Math.round((score / maxScore) * 100);
  const correctCount = answers.filter(a => a.is_correct).length;

  useEffect(() => {
    if (isOpen && feedback === '') {
      generateFeedback();
      generateQuestionExplanations();
    }
  }, [isOpen]);

  const generateFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const feedbackMessage = `I just completed the "${quizTitle}" quiz. Here are my results:
Score: ${score}/${maxScore} (${scorePercent}%)
Correct: ${correctCount}/${answers.length}

Quiz details:
${answers.map((a, i) => `Q${i + 1}: "${a.question}" - I answered "${a.selected}" (${a.is_correct ? 'Correct ✓' : 'Incorrect ✗'}) - Correct Answer: "${a.correct}"`).join('\n')}

Please provide a brief overall assessment of my performance with specific encouragement and 2-3 actionable tips to improve. Focus on patterns you notice in my answers.`;

      const response = await toolAwareChatResponse(feedbackMessage);
      setFeedback(response);
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      console.error('Feedback generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionExplanations = async () => {
    setIsLoadingExplanations(true);
    try {
      const explanationPromises = answers.map(async (answer) => {
        const prompt = `As Nova, the AI learning assistant, explain this quiz question result in 2-3 sentences:

Question: "${answer.question}"
Student's answer: "${answer.selected}"
Correct answer: "${answer.correct}"
Result: ${answer.is_correct ? 'CORRECT' : 'INCORRECT'}

${answer.is_correct
  ? 'Explain WHY this answer is correct and what concept it demonstrates understanding of.'
  : 'Explain WHY the correct answer is right and what misconception might have led to the wrong answer. Be encouraging but educational.'}

Keep it concise, educational, and encouraging. Don't use phrases like "As an AI" - speak naturally like a tutor.`;

        try {
          const explanation = await toolAwareChatResponse(prompt);
          return explanation;
        } catch {
          return answer.is_correct
            ? 'Great job! You understood this concept well.'
            : `The correct answer is "${answer.correct}". Review this topic to strengthen your understanding.`;
        }
      });

      const explanations = await Promise.all(explanationPromises);
      setQuestionExplanations(explanations);
    } catch (err) {
      console.error('Explanation generation error:', err);
      // Set default explanations if generation fails
      setQuestionExplanations(answers.map(a =>
        a.is_correct
          ? 'Correct! You demonstrated good understanding of this concept.'
          : `The correct answer was "${a.correct}". Take time to review this topic.`
      ));
    } finally {
      setIsLoadingExplanations(false);
    }
  };

  const getPerformanceColor = () => {
    if (scorePercent >= 80) return 'from-emerald-500 to-green-500';
    if (scorePercent >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-purple-600';
  };

  const getPerformanceMessage = () => {
    if (scorePercent >= 90) return 'Outstanding! You\'ve mastered this topic!';
    if (scorePercent >= 80) return 'Excellent work! You\'re doing great!';
    if (scorePercent >= 70) return 'Good job! Keep practicing to improve!';
    if (scorePercent >= 60) return 'Nice effort! Review the weak areas!';
    return 'Keep learning! You\'ll get better with practice!';
  };

  const getPerformanceEmoji = () => {
    if (scorePercent >= 90) return '🌟';
    if (scorePercent >= 80) return '✨';
    if (scorePercent >= 70) return '👏';
    if (scorePercent >= 60) return '💪';
    return '📚';
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
            className="w-full max-w-3xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nova's Quiz Analysis</h2>
                  <p className="text-sm text-white/70">{quizTitle}</p>
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

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Overview & Insights
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-white border-b-2 border-indigo-500 bg-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Question-by-Question
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === 'overview' ? (
                <>
                  {/* Score Card */}
                  <div className={`bg-gradient-to-br ${getPerformanceColor()} rounded-2xl p-5 text-white shadow-lg`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Your Score</p>
                        <p className="text-5xl font-bold">{scorePercent}%</p>
                        <p className="text-sm opacity-90 mt-1">{score} out of {maxScore} points</p>
                      </div>
                      <div className="text-6xl">{getPerformanceEmoji()}</div>
                    </div>
                    <p className="text-lg font-semibold">{getPerformanceMessage()}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
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
                      <p className="text-xs text-white/60">To Review</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">+{Math.round(score * 1.5)}</p>
                      <p className="text-xs text-white/60">Points</p>
                    </div>
                  </div>

                  {/* Nova's AI Insights */}
                  <div className="bg-white/5 border border-indigo-500/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
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
                      <div className="text-white/80 text-sm leading-relaxed">
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

                  {/* Quick Summary of Incorrect Answers */}
                  {answers.filter(a => !a.is_correct).length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Focus Areas
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        Review these questions to strengthen your understanding:
                      </p>
                      <div className="space-y-2">
                        {answers.filter(a => !a.is_correct).map((answer, i) => (
                          <div key={i} className="text-white/70 text-sm flex items-start gap-2 bg-white/5 rounded-lg p-3">
                            <span className="text-amber-400 mt-0.5">→</span>
                            <span className="flex-1">{answer.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Question-by-Question Details Tab */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <p className="text-white/70 text-sm">
                      Click on each question to see Nova's detailed explanation
                    </p>
                  </div>

                  {answers.map((answer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border overflow-hidden ${
                        answer.is_correct
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-rose-500/10 border-rose-500/30'
                      }`}
                    >
                      {/* Question Header */}
                      <button
                        onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            answer.is_correct ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                          }`}>
                            {answer.is_correct
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              : <X className="w-5 h-5 text-rose-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              Q{index + 1}: {answer.question}
                            </p>
                            <p className={`text-xs ${answer.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {answer.is_correct ? 'Correct!' : 'Needs Review'}
                            </p>
                          </div>
                        </div>
                        {expandedQuestion === index
                          ? <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                        }
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedQuestion === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                              {/* Your Answer vs Correct Answer */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={`rounded-lg p-3 ${
                                  answer.is_correct ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                }`}>
                                  <p className="text-xs text-white/50 mb-1">Your Answer</p>
                                  <p className={`text-sm font-medium ${
                                    answer.is_correct ? 'text-emerald-300' : 'text-rose-300'
                                  }`}>
                                    {answer.selected}
                                  </p>
                                </div>
                                <div className="bg-emerald-500/20 rounded-lg p-3">
                                  <p className="text-xs text-white/50 mb-1">Correct Answer</p>
                                  <p className="text-sm font-medium text-emerald-300">
                                    {answer.correct}
                                  </p>
                                </div>
                              </div>

                              {/* Nova's Explanation */}
                              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bot className="w-4 h-4 text-indigo-400" />
                                  <p className="text-xs font-medium text-indigo-300">Nova's Explanation</p>
                                </div>
                                {isLoadingExplanations ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                    <span className="text-white/50 text-sm">Generating explanation...</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-white/80 leading-relaxed">
                                    {questionExplanations[index] || 'Explanation loading...'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
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
