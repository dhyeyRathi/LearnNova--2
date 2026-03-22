import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  'How do I enroll in a course?',
  'How does the points system work?',
  'How can I track my progress?',
];

const aiResponses: Record<string, string> = {
  'enroll': "To enroll in a course, simply browse our course catalog, click on a course you're interested in, and hit the **Start** or **Join Course** button. Some courses may require an invitation or payment.",
  'points': "Our gamification system awards points for completing lessons and quizzes. There are 7 badge levels: Newbie (20pts), Learner (40pts), Scholar (60pts), Expert (80pts), Master (100pts), Legend (120pts), and Grandmaster (140pts). Keep learning to level up!",
  'progress': "You can track your progress on the **My Courses** page. Each enrolled course shows a progress bar, completed lessons, and your quiz scores. You can also see your overall stats and badge level.",
  'quiz': "Quizzes are available for most courses. Navigate to the **Quizzes** page to see all available quizzes. Complete them to earn bonus points and test your knowledge!",
  'meeting': "Instructors can schedule live meetings with students. If you're a learner, check your email for meeting invitations. If you're an instructor, go to the Meetings page to schedule sessions.",
  'default': "I'm Nova, your AI learning assistant! I can help you navigate courses, understand the points system, track progress, and answer questions about the platform. What would you like to know?",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('enroll') || lower.includes('join') || lower.includes('course') && lower.includes('how')) return aiResponses['enroll'];
  if (lower.includes('point') || lower.includes('badge') || lower.includes('gamif') || lower.includes('level')) return aiResponses['points'];
  if (lower.includes('progress') || lower.includes('track') || lower.includes('dashboard')) return aiResponses['progress'];
  if (lower.includes('quiz') || lower.includes('test') || lower.includes('exam')) return aiResponses['quiz'];
  if (lower.includes('meeting') || lower.includes('live') || lower.includes('session')) return aiResponses['meeting'];
  return aiResponses['default'];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm **Nova**, your AI learning companion. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(msg),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const renderContent = (content: string) => {
    return content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#2C3E6B]">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <button
                onClick={() => setIsOpen(true)}
                className="relative w-14 h-14 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse-ring" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-red-500 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Nova AI</h3>
                  <p className="text-xs text-white/50">Learning Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'assistant'
                      ? 'bg-red-500 text-white'
                      : 'bg-[#F0EEEA] text-red-600'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white border border-[#E5E2DC] text-[#1A1F2E] shadow-sm'
                      : 'bg-red-500 text-white'
                  }`}>
                    {renderContent(msg.content)}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-[#E5E2DC] rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E5E2DC] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#E5E2DC] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#E5E2DC] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-slate-100 bg-white">
                {quickReplies.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-500/[0.05] hover:bg-red-500/[0.1] rounded-lg border border-[#E5E2DC] transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nova anything..."
                  className="flex-1 h-10 px-3.5 rounded-xl bg-[#F0EEEA] border-none text-sm placeholder:text-[#7A766F]/60 focus:outline-none focus:border-amber-400 focus:border-2 focus:bg-white transition-all"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-red-500 hover:bg-red-600 text-white flex-shrink-0 shadow-sm disabled:opacity-40"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}