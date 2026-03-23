import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { quizzes } from '../../data/mockData';
import { ArrowLeft, Plus, Trash2, Check, Gift, HelpCircle, GripVertical, Save, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface QuestionDraft {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface RewardsConfig {
  attempt1: number;
  attempt2: number;
  attempt3: number;
  attempt4plus: number;
}

export default function QuizBuilderPage() {
  const { id: courseId } = useParams();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const existingQuiz = quizId ? quizzes.find(q => q.id === quizId) : null;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState(existingQuiz?.title || '');
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    existingQuiz
      ? existingQuiz.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map((opt, i) => ({
            id: `opt-${q.id}-${i}`,
            text: opt,
            isCorrect: i === q.correctAnswer,
          })),
        }))
      : [{ id: 'q-1', text: '', options: [{ id: 'o-1', text: '', isCorrect: false }, { id: 'o-2', text: '', isCorrect: false }] }]
  );
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [rewards, setRewards] = useState<RewardsConfig>({
    attempt1: existingQuiz?.questions[0]?.basePoints || 10,
    attempt2: existingQuiz?.questions[0]?.pointsPerAttempt || 7,
    attempt3: 5,
    attempt4plus: 3,
  });

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-700">Admin Access Required</h2>
          <Button onClick={() => navigate('/courses')} className="mt-4 rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[activeQuestion];

  const addQuestion = () => {
    const newQ: QuestionDraft = {
      id: `q-${Date.now()}`,
      text: '',
      options: [
        { id: `o-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `o-${Date.now()}-2`, text: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQ]);
    setActiveQuestion(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) { toast.error('Need at least one question'); return; }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (activeQuestion >= updated.length) setActiveQuestion(updated.length - 1);
  };

  const updateQuestionText = (text: string) => {
    const updated = [...questions];
    updated[activeQuestion] = { ...updated[activeQuestion], text };
    setQuestions(updated);
  };

  const addOption = () => {
    const updated = [...questions];
    updated[activeQuestion].options.push({
      id: `o-${Date.now()}`,
      text: '',
      isCorrect: false,
    });
    setQuestions(updated);
  };

  const removeOption = (optIdx: number) => {
    if (currentQ.options.length <= 2) { toast.error('Need at least 2 options'); return; }
    const updated = [...questions];
    updated[activeQuestion].options = updated[activeQuestion].options.filter((_, i) => i !== optIdx);
    setQuestions(updated);
  };

  const updateOptionText = (optIdx: number, text: string) => {
    const updated = [...questions];
    updated[activeQuestion].options[optIdx].text = text;
    setQuestions(updated);
  };

  const toggleCorrect = (optIdx: number) => {
    const updated = [...questions];
    updated[activeQuestion].options = updated[activeQuestion].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!quizTitle.trim()) { toast.error('Quiz title required'); return; }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) { toast.error(`Question ${i + 1} text is empty`); setActiveQuestion(i); return; }
      if (!questions[i].options.some(o => o.isCorrect)) { toast.error(`Question ${i + 1} needs a correct answer`); setActiveQuestion(i); return; }
      if (questions[i].options.some(o => !o.text.trim())) { toast.error(`Question ${i + 1} has empty options`); setActiveQuestion(i); return; }
    }
    
    // Create quiz object
    const newQuiz = {
      id: quizId || `quiz-${Date.now()}`,
      title: quizTitle,
      questions: questions.map((q, idx) => ({
        id: q.id,
        text: q.text,
        options: q.options.map(o => o.text),
        correctAnswer: q.options.findIndex(o => o.isCorrect),
        basePoints: rewards.attempt1,
        pointsPerAttempt: rewards.attempt2,
      })),
      published: existingQuiz?.published || false,
      publishedAt: existingQuiz?.publishedAt,
      studentIds: existingQuiz?.studentIds || [],
    };
    
    // Save to localStorage
    try {
      const saved = localStorage.getItem('quizzesList');
      const userQuizzes = saved ? JSON.parse(saved) : [];
      
      if (quizId) {
        // Update existing
        const idx = userQuizzes.findIndex(q => q.id === quizId);
        if (idx !== -1) userQuizzes[idx] = newQuiz;
        else userQuizzes.push(newQuiz);
      } else {
        // Add new
        userQuizzes.push(newQuiz);
      }
      
      localStorage.setItem('quizzesList', JSON.stringify(userQuizzes));
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
    
    toast.success('Quiz saved successfully!');
    navigate(`/admin/courses/${courseId}/edit`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-purple-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Quiz Builder
              </h1>
              <p className="text-slate-500 text-sm">{existingQuiz ? 'Edit quiz' : 'Create a new quiz'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRewardsOpen(true)} className="rounded-xl">
              <Gift className="w-4 h-4 mr-2 text-purple-600" />Rewards
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-600/20">
              <Save className="w-4 h-4 mr-2" />Save Quiz
            </Button>
          </div>
        </div>

        {/* Quiz Title */}
        <Card className="bg-white rounded-3xl p-5 mb-6 border border-slate-200">
          <div className="space-y-2">
            <Label>Quiz Title *</Label>
            <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. React Fundamentals Quiz" className="rounded-xl bg-white text-lg" />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Panel - Question List */}
          <div>
            <Card className="bg-white rounded-3xl p-4 sticky top-24 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Questions</h3>
                <Badge variant="secondary" className="rounded-lg">{questions.length}</Badge>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {questions.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <button
                      onClick={() => setActiveQuestion(i)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                        activeQuestion === i
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        activeQuestion === i ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${activeQuestion === i ? 'text-white' : 'text-slate-700'}`}>
                          {q.text || `Question ${i + 1}`}
                        </p>
                        <p className={`text-xs ${activeQuestion === i ? 'text-white/70' : 'text-slate-400'}`}>
                          {q.options.length} options
                        </p>
                      </div>
                      {questions.length > 1 && (
                        <button
                          onClick={e => { e.stopPropagation(); removeQuestion(i); }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                            activeQuestion === i ? 'hover:bg-white/20 text-white' : 'hover:bg-purple-50 text-purple-500'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
              <Button onClick={addQuestion} variant="outline" className="w-full mt-4 rounded-xl border-dashed border-2">
                <Plus className="w-4 h-4 mr-2" />Add Question
              </Button>
            </Card>
          </div>

          {/* Right Panel - Question Editor */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={activeQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Card className="bg-white rounded-3xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-600/20">
                      {activeQuestion + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Question {activeQuestion + 1}</h3>
                      <p className="text-xs text-slate-400">Enter the question and options below</p>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2 mb-6">
                    <Label>Question Text *</Label>
                    <Input
                      value={currentQ.text}
                      onChange={e => updateQuestionText(e.target.value)}
                      placeholder="e.g. What is the virtual DOM in React?"
                      className="rounded-xl bg-white/50 text-lg py-3"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options</Label>
                      <p className="text-xs text-slate-400">Click the circle to mark the correct answer</p>
                    </div>
                    {currentQ.options.map((opt, i) => (
                      <motion.div key={opt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          opt.isCorrect
                            ? 'border-emerald-300 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                            : 'border-slate-200 hover:border-purple-200 bg-white/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleCorrect(i)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            opt.isCorrect
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'border-2 border-slate-300 hover:border-purple-500'
                          }`}
                        >
                          {opt.isCorrect && <Check className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-400 w-6">{String.fromCharCode(65 + i)}.</span>
                          <Input
                            value={opt.text}
                            onChange={e => updateOptionText(i, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="rounded-lg bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
                          />
                        </div>
                        {currentQ.options.length > 2 && (
                          <Button variant="ghost" size="sm" onClick={() => removeOption(i)} className="h-7 w-7 p-0 text-slate-300 hover:text-purple-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                    <Button onClick={addOption} variant="outline" className="w-full rounded-xl border-dashed border-2 text-slate-500">
                      <Plus className="w-4 h-4 mr-2" />Add Option
                    </Button>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t border-slate-200/60">
                    <Button variant="outline" disabled={activeQuestion === 0} onClick={() => setActiveQuestion(activeQuestion - 1)} className="rounded-xl">
                      Previous
                    </Button>
                    <div className="text-sm text-slate-400 self-center">
                      {activeQuestion + 1} of {questions.length}
                    </div>
                    {activeQuestion < questions.length - 1 ? (
                      <Button variant="outline" onClick={() => setActiveQuestion(activeQuestion + 1)} className="rounded-xl">
                        Next
                      </Button>
                    ) : (
                      <Button onClick={addQuestion} className="bg-purple-600 text-white rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />Add Next
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Rewards Dialog */}
      <Dialog open={rewardsOpen} onOpenChange={setRewardsOpen}>
        <DialogContent className="bg-white rounded-3xl border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Trophy className="w-6 h-6 text-purple-600" />Rewards Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-sm text-slate-500">Set points awarded per question based on attempt number.</p>
            {[
              { label: '1st Attempt', key: 'attempt1' as const, color: 'from-emerald-500 to-green-500', emoji: '🥇' },
              { label: '2nd Attempt', key: 'attempt2' as const, color: 'bg-purple-600', emoji: '2nd' },
              { label: '3rd Attempt', key: 'attempt3' as const, color: 'bg-purple-500', emoji: '3rd' },
              { label: '4th+ Attempt', key: 'attempt4plus' as const, color: 'from-slate-400 to-slate-500', emoji: '🎯' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.key === 'attempt2' || item.key === 'attempt3' ? item.color : `bg-gradient-to-br ${item.color}`} flex items-center justify-center shadow-md text-lg text-white`}>
                  {item.emoji}
                </div>
                <div className="flex-1">
                  <Label className="text-sm">{item.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={rewards[item.key]}
                    onChange={e => setRewards({ ...rewards, [item.key]: parseInt(e.target.value) || 0 })}
                    className="w-20 rounded-xl bg-white/50 text-center"
                  />
                  <span className="text-sm text-slate-400">pts</span>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
              <Button variant="outline" onClick={() => setRewardsOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => { toast.success('Rewards configured!'); setRewardsOpen(false); }} className="bg-purple-600 text-white rounded-xl">
                <Gift className="w-4 h-4 mr-2" />Save Rewards
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}