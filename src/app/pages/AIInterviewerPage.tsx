import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Mic, MicOff, Send, ArrowLeft, Volume2, Upload, FileText, Briefcase, X, ChevronRight, Video, VideoOff, StopCircle, Award, TrendingUp, AlertCircle, CheckCircle2, Star, AlertTriangle, Clock, Shield, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  speakText,
  stopSpeaking,
  startListening,
  stopListening,
  getInterviewResponse,
  evaluateResume,
  generateInterviewQuestions,
  generateFinalFeedback,
  extractTextFromPDF,
  clearSessionQuestions,
} from '../../utils/geminiVoiceService';

// ====================================================================
// 🔊 VOICE INTEGRATION
// ====================================================================
// Uses Web Speech API for voice (works in all browsers):
// - speakText(): Nova speaks using browser TTS
// - startListening(): Captures user speech and returns text
// - getInterviewResponse(): Gemini evaluates answers
// ====================================================================

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

interface InterviewAnswer {
  question: string;
  answer: string;
  round: string;
  score: number;
}

type InterviewStage = 'rules' | 'start' | 'field-select' | 'subfield-select' | 'greeting' | 'interviewing' | 'results';
type InterviewRound = 'aptitude' | 'technical' | 'managerial' | 'hr';

// Main fields with their sub-fields
const FIELD_OPTIONS = [
  {
    id: 'software',
    label: 'Software Engineering',
    icon: '💻',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'System Design'],
    subFields: [
      { id: 'frontend', label: 'Frontend Development', skills: ['React', 'Vue', 'Angular', 'CSS', 'TypeScript'] },
      { id: 'backend', label: 'Backend Development', skills: ['Node.js', 'Python', 'Java', 'APIs', 'Databases'] },
      { id: 'fullstack', label: 'Full Stack Development', skills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'DevOps'] },
      { id: 'mobile', label: 'Mobile Development', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI'] },
      { id: 'devops', label: 'DevOps / Cloud', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'] },
    ]
  },
  {
    id: 'data',
    label: 'Data Science / Analytics',
    icon: '📊',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
    subFields: [
      { id: 'data-analyst', label: 'Data Analyst', skills: ['SQL', 'Excel', 'Tableau', 'Statistics', 'Reporting'] },
      { id: 'data-scientist', label: 'Data Scientist', skills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'NLP'] },
      { id: 'data-engineer', label: 'Data Engineer', skills: ['SQL', 'Spark', 'ETL', 'Data Pipelines', 'Cloud'] },
      { id: 'ml-engineer', label: 'ML Engineer', skills: ['TensorFlow', 'PyTorch', 'MLOps', 'Model Deployment', 'Python'] },
      { id: 'bi-analyst', label: 'Business Intelligence', skills: ['Power BI', 'Tableau', 'SQL', 'Data Modeling', 'Dashboards'] },
    ]
  },
  {
    id: 'product',
    label: 'Product Management',
    icon: '📱',
    skills: ['Roadmapping', 'User Research', 'Agile', 'Analytics', 'Strategy'],
    subFields: [
      { id: 'tech-pm', label: 'Technical PM', skills: ['APIs', 'System Design', 'Agile', 'Technical Specs', 'Engineering'] },
      { id: 'growth-pm', label: 'Growth PM', skills: ['A/B Testing', 'Metrics', 'User Acquisition', 'Retention', 'Analytics'] },
      { id: 'platform-pm', label: 'Platform PM', skills: ['APIs', 'Developer Experience', 'Scalability', 'Integration', 'Documentation'] },
      { id: 'ux-pm', label: 'UX Product Manager', skills: ['User Research', 'Design Thinking', 'Prototyping', 'Usability', 'Wireframing'] },
    ]
  },
  {
    id: 'design',
    label: 'UI/UX Design',
    icon: '🎨',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability'],
    subFields: [
      { id: 'ui-designer', label: 'UI Designer', skills: ['Figma', 'Visual Design', 'Typography', 'Color Theory', 'Icons'] },
      { id: 'ux-designer', label: 'UX Designer', skills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture'] },
      { id: 'product-designer', label: 'Product Designer', skills: ['End-to-End Design', 'Design Systems', 'Figma', 'User Flows', 'Handoff'] },
      { id: 'ux-researcher', label: 'UX Researcher', skills: ['User Interviews', 'Surveys', 'Usability Testing', 'Data Analysis', 'Personas'] },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '📣',
    skills: ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Brand Management'],
    subFields: [
      { id: 'digital-marketing', label: 'Digital Marketing', skills: ['SEO', 'PPC', 'Google Ads', 'Analytics', 'Conversion'] },
      { id: 'content-marketing', label: 'Content Marketing', skills: ['Content Strategy', 'Copywriting', 'SEO', 'Blogging', 'Editorial'] },
      { id: 'social-media', label: 'Social Media Marketing', skills: ['Social Strategy', 'Content Creation', 'Community', 'Paid Social', 'Analytics'] },
      { id: 'brand-marketing', label: 'Brand Marketing', skills: ['Brand Strategy', 'Positioning', 'Messaging', 'Campaigns', 'Creative'] },
      { id: 'growth-marketing', label: 'Growth Marketing', skills: ['A/B Testing', 'Funnels', 'Automation', 'Analytics', 'CRO'] },
    ]
  },
  {
    id: 'finance',
    label: 'Finance / Accounting',
    icon: '💰',
    skills: ['Financial Analysis', 'Excel', 'Forecasting', 'Budgeting', 'Compliance'],
    subFields: [
      { id: 'financial-analyst', label: 'Financial Analyst', skills: ['Financial Modeling', 'Excel', 'Valuation', 'Forecasting', 'Reporting'] },
      { id: 'accountant', label: 'Accountant', skills: ['GAAP', 'Bookkeeping', 'Tax', 'Auditing', 'Financial Statements'] },
      { id: 'investment-banking', label: 'Investment Banking', skills: ['M&A', 'Valuation', 'Financial Modeling', 'Due Diligence', 'Pitchbooks'] },
      { id: 'fp&a', label: 'FP&A', skills: ['Budgeting', 'Forecasting', 'Variance Analysis', 'KPIs', 'Strategic Planning'] },
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: '🤝',
    skills: ['Negotiation', 'CRM', 'Lead Generation', 'Closing', 'Relationship Building'],
    subFields: [
      { id: 'sdr', label: 'Sales Development (SDR)', skills: ['Prospecting', 'Cold Calling', 'Email Outreach', 'Qualification', 'CRM'] },
      { id: 'account-executive', label: 'Account Executive', skills: ['Demo', 'Negotiation', 'Closing', 'Pipeline', 'Enterprise Sales'] },
      { id: 'customer-success', label: 'Customer Success', skills: ['Onboarding', 'Retention', 'Upselling', 'Relationship', 'Renewals'] },
      { id: 'sales-ops', label: 'Sales Operations', skills: ['Salesforce', 'Analytics', 'Forecasting', 'Process', 'Reporting'] },
    ]
  },
  {
    id: 'hr',
    label: 'Human Resources',
    icon: '👥',
    skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance', 'Training'],
    subFields: [
      { id: 'recruiter', label: 'Recruiter / Talent Acquisition', skills: ['Sourcing', 'Interviewing', 'ATS', 'Employer Branding', 'Negotiation'] },
      { id: 'hr-generalist', label: 'HR Generalist', skills: ['Employee Relations', 'Policies', 'Compliance', 'Benefits', 'Onboarding'] },
      { id: 'hr-bp', label: 'HR Business Partner', skills: ['Strategic HR', 'Change Management', 'Talent Strategy', 'Leadership Coaching', 'Org Development'] },
      { id: 'learning-dev', label: 'Learning & Development', skills: ['Training Design', 'LMS', 'Facilitation', 'Career Development', 'Assessment'] },
    ]
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📋',
    skills: ['Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Adaptability'],
    subFields: [
      { id: 'project-manager', label: 'Project Manager', skills: ['PMP', 'Agile', 'Stakeholder Management', 'Risk Management', 'Planning'] },
      { id: 'operations', label: 'Operations', skills: ['Process Improvement', 'Logistics', 'Vendor Management', 'KPIs', 'Efficiency'] },
      { id: 'consultant', label: 'Consultant', skills: ['Problem Solving', 'Presentations', 'Analysis', 'Client Management', 'Strategy'] },
      { id: 'general', label: 'General / Entry Level', skills: ['Communication', 'Teamwork', 'Learning Agility', 'Problem Solving', 'Adaptability'] },
    ]
  },
];

const ROUND_INFO: Record<InterviewRound, { name: string; icon: string; description: string; questionCount: number }> = {
  aptitude: { name: 'Aptitude Round', icon: '🧠', description: 'Logical reasoning & general aptitude', questionCount: 3 },
  technical: { name: 'Technical Round', icon: '💻', description: 'Skills-based technical questions', questionCount: 3 },
  managerial: { name: 'Managerial Round', icon: '👔', description: 'Leadership & pressure handling', questionCount: 3 },
  hr: { name: 'HR Round', icon: '🤝', description: 'Culture fit & behavioral questions', questionCount: 3 },
};

const ROUND_ORDER: InterviewRound[] = ['aptitude', 'technical', 'managerial', 'hr'];

export default function AIInterviewerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stage, setStage] = useState<InterviewStage>('rules');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedSubField, setSelectedSubField] = useState<string>('');
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // Interview state
  const [currentRound, setCurrentRound] = useState<InterviewRound>('aptitude');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);

  // Camera state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Stop interview modal
  const [showStopModal, setShowStopModal] = useState(false);

  const [currentMessage, setCurrentMessage] = useState<Message>({
    id: '1',
    role: 'bot',
    content: '',
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Results state
  const [resumeScore, setResumeScore] = useState(0);
  const [interviewScore, setInterviewScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  // Greeting state
  const [greetingStep, setGreetingStep] = useState(0);

  // Track when Nova is speaking (to hide input)
  const [isNovaResponding, setIsNovaResponding] = useState(false);

  // Gemini-generated questions and resume data
  const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, string[]>>({});
  const generatedQuestionsRef = useRef<Record<string, string[]>>({});
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeExperience, setResumeExperience] = useState<string>('');
  const [resumeFeedback, setResumeFeedback] = useState<string>('');

  // Timer states for managerial and HR rounds
  const [thinkTimer, setThinkTimer] = useState(20); // 20 seconds to think
  const [answerTimer, setAnswerTimer] = useState(30); // 30 seconds to answer (default for aptitude/technical)
  const [isThinkTimerActive, setIsThinkTimerActive] = useState(false);
  const [isAnswerTimerActive, setIsAnswerTimerActive] = useState(false);

  // Hide AI Assistant when on this page
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

  // isSpeaking is now driven by speakText callbacks - no timer needed

  // Connect camera stream to video element when stream changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  // Cleanup camera when stream changes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // CRITICAL: Always stop speech when leaving the page - no dependencies
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Think timer countdown for managerial/HR rounds
  useEffect(() => {
    if (isThinkTimerActive && thinkTimer > 0) {
      const timer = setTimeout(() => setThinkTimer(thinkTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isThinkTimerActive && thinkTimer === 0) {
      // Think time is up, start answer timer
      setIsThinkTimerActive(false);
      setIsAnswerTimerActive(true);
      // Managerial/HR rounds get 60s to answer, aptitude/technical get 30s
      setAnswerTimer((currentRound === 'managerial' || currentRound === 'hr') ? 60 : 30);
    }
  }, [isThinkTimerActive, thinkTimer]);

  // Answer timer countdown for managerial/HR rounds
  useEffect(() => {
    if (isAnswerTimerActive && answerTimer > 0) {
      const timer = setTimeout(() => setAnswerTimer(answerTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isAnswerTimerActive && answerTimer === 0) {
      // Answer time is up
      setIsAnswerTimerActive(false);
      // Auto-submit empty answer or show warning
      handleSendMessage("I need more time to think about this.");
    }
  }, [isAnswerTimerActive, answerTimer]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setIsCameraOn(true);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraOn(false);
    } else {
      await startCamera();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setResumeFile(file);
    setIsProcessingResume(true);
    setHasResume(true);

    try {
      // Extract text from PDF using Gemini AI (file stays in memory, never saved)
      const extractedText = await extractTextFromPDF(file);
      setResumeText(extractedText);

      // Just extract skills quickly for question generation - full evaluation happens after interview
      try {
        const evaluation = await evaluateResume(extractedText);
        setResumeSkills(evaluation.skills);
        // Store score and feedback for later (shown in results)
        setResumeScore(evaluation.score);
        setResumeExperience(evaluation.experience);
        setResumeFeedback(evaluation.feedback);
      } catch (error) {
        console.error('Resume evaluation error:', error);
        setResumeSkills(['General Skills']);
      }

      setIsProcessingResume(false);
      startGreeting(true);
    } catch (error) {
      console.error('PDF extraction error:', error);
      alert('Failed to process PDF. Please try again or use a different file.');
      setIsProcessingResume(false);
      setResumeFile(null);
      setHasResume(false);
    }
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
  };

  const handleContinueToSubfield = () => {
    if (!selectedField) return;
    setStage('subfield-select');
  };

  const handleSubFieldSelect = (subFieldId: string) => {
    setSelectedSubField(subFieldId);
  };

  const handleStartInterviewFromSubfield = () => {
    if (!selectedSubField) return;
    startGreeting(false);
  };

  // Get questions from pre-generated set or fallback to hardcoded
  const getQuestionsForRound = (round: InterviewRound): string[] => {
    // Read from ref (synchronously updated) to avoid stale React state
    const questions = generatedQuestionsRef.current;
    if (questions[round] && questions[round].length >= 3) {
      return questions[round];
    }

    // Fallback questions (used only if Gemini generation fails)
    const field = FIELD_OPTIONS.find(f => f.id === selectedField);
    const subField = field?.subFields?.find(sf => sf.id === selectedSubField);
    const skills = hasResume
      ? resumeSkills
      : (subField?.skills || field?.skills || ['general skills']);

    const fallbackQuestions: Record<InterviewRound, string[]> = {
      aptitude: [
        "If a train travels 60 km in 40 minutes, how far will it travel in 1.5 hours at the same speed?",
        "A project that takes 6 people 8 days to complete. How many days would it take 4 people to complete the same project?",
        "Complete the series: 2, 6, 12, 20, 30, ?",
      ],
      technical: [
        `Explain your experience with ${skills[0]}. What's the most complex project you've built using it?`,
        `How would you approach designing a scalable system for ${skills[1] || 'a high-traffic application'}?`,
        `Describe a challenging technical problem you solved using ${skills[2] || 'your core skills'}. Walk me through your debugging process.`,
      ],
      managerial: [
        "Describe a situation where you had to meet a tight deadline with limited resources. How did you handle the pressure?",
        "Tell me about a time when you had to manage conflicting priorities from different stakeholders. How did you resolve it?",
        "How do you handle a situation when a team member consistently underperforms? Give a specific example.",
      ],
      hr: [
        "Tell me about yourself and what motivates you in your career.",
        "Where do you see yourself in 5 years? How does this role fit into your career goals?",
        "Why are you interested in this position and what value would you bring to our team?",
      ],
    };

    return fallbackQuestions[round];
  };

  // Generate all questions for all rounds using Gemini AI
  const generateAllQuestions = async (): Promise<Record<string, string[]>> => {
    // Clear previous session questions for a fresh start
    clearSessionQuestions();

    const field = FIELD_OPTIONS.find(f => f.id === selectedField);
    const subField = field?.subFields?.find(sf => sf.id === selectedSubField);

    // Use subfield label and skills if available, otherwise use main field
    const fieldLabel = subField?.label || field?.label || selectedField || 'General';
    const skills = hasResume
      ? resumeSkills
      : (subField?.skills || field?.skills || ['General Skills']);

    const questions: Record<string, string[]> = {};

    // Generate questions for each round in parallel
    const rounds: InterviewRound[] = ['aptitude', 'technical', 'managerial', 'hr'];

    await Promise.all(
      rounds.map(async (round) => {
        try {
          const roundQuestions = await generateInterviewQuestions(round, fieldLabel, skills, 3);
          questions[round] = roundQuestions;
        } catch (error) {
          console.error(`Error generating ${round} questions:`, error);
          // Will use fallback questions
        }
      })
    );

    // Update both ref (for immediate access) and state
    generatedQuestionsRef.current = questions;
    setGeneratedQuestions(questions);
    return questions;
  };

  const startGreeting = async (withResume: boolean) => {
    setStage('greeting');
    setGreetingStep(0);

    // Start camera
    await startCamera();

    const greetings = withResume
      ? [
          `Hello ${user?.name || 'there'}! Welcome to your AI Interview Practice Session with Nova!`,
          "I'm so glad you're here to practice. Your resume has been uploaded successfully!",
          "I'm now generating unique interview questions tailored specifically for you...",
          "We'll go through 4 rounds with 3 questions each: Aptitude, Technical, Managerial, and HR.",
          "Remember: Stay calm, be confident, and give specific examples. Let's begin!"
        ]
      : [
          `Hello ${user?.name || 'there'}! Welcome to your AI Interview Practice Session with Nova!`,
          "I'm excited to help you practice today. I'll ask questions based on your selected field.",
          "I'm now generating unique interview questions tailored specifically for you...",
          "We'll go through 4 rounds with 3 questions each: Aptitude, Technical, Managerial, and HR.",
          "Remember: Stay calm, be confident, and give specific examples. Let's begin!"
        ];

    // Play through greeting messages with Web Speech API
    for (let i = 0; i < greetings.length; i++) {
      setCurrentMessage({
        id: `greeting-${i}`,
        role: 'bot',
        content: greetings[i],
      });

      // Generate questions while speaking the "generating questions" message
      if (greetings[i].includes('generating unique interview questions')) {
        // Await question generation so questions are always unique/Gemini-generated
        await generateAllQuestions();
      }

      try {
        await speakText(greetings[i], () => setIsSpeaking(true), () => setIsSpeaking(false));
        // Update greeting step AFTER voice finishes speaking
        setGreetingStep(i);
        // Small pause between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Speech synthesis error, using fallback timing:', error);
        // Fallback: Just wait 8 seconds per message if TTS fails
        await new Promise(resolve => setTimeout(resolve, 8000));
        setGreetingStep(i);
      }
    }

    // Wait a bit more for questions to finish generating then start interview
    await new Promise(resolve => setTimeout(resolve, 2000));
    startInterview();
  };

  const startInterview = async () => {
    setStage('interviewing');
    setCurrentRound('aptitude');
    setQuestionIndex(0);
    setInterviewAnswers([]);

    const firstQuestion = getQuestionsForRound('aptitude')[0];
    const firstMessage = `Let's start with the Aptitude Round! 🧠\n\nQuestion 1 of 3: ${firstQuestion}`;

    setCurrentMessage({
      id: Date.now().toString(),
      role: 'bot',
      content: firstMessage,
    });

    // Speak the first question - hide input while speaking
    setIsNovaResponding(true);
    try {
      await speakText(firstMessage, () => setIsSpeaking(true), () => setIsSpeaking(false));
    } catch (error) {
      console.error('Speech error:', error);
    }
    setIsNovaResponding(false);

    // Start 30s answer timer for aptitude round
    setAnswerTimer(30);
    setIsAnswerTimerActive(true);
  };

  const handleContinueWithoutResume = () => {
    setHasResume(false);
    setResumeScore(0);
    setStage('field-select');
  };

  const handleStartWithField = () => {
    if (!selectedField || !selectedSubField) return;
    startGreeting(false);
  };

  const calculateResults = async () => {
    const totalQuestions = interviewAnswers.length;
    const avgScore = totalQuestions > 0
      ? interviewAnswers.reduce((sum, a) => sum + a.score, 0) / totalQuestions
      : 0;
    setInterviewScore(Math.round(avgScore));

    // Show loading feedback first
    setFeedback(["🔄 Nova is analyzing your interview performance..."]);
    setStage('results');

    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraOn(false);
    }

    // Use Gemini to generate comprehensive feedback
    try {
      const geminiFeedback = await generateFinalFeedback(
        interviewAnswers,
        resumeScore,
        resumeFeedback || undefined
      );
      setFeedback(geminiFeedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Fallback to basic feedback
      const newFeedback: string[] = [];
      const overallScore = hasResume ? (resumeScore + avgScore) / 2 : avgScore;

      if (overallScore >= 80) {
        newFeedback.push("🎉 Excellent performance! You demonstrated strong skills across all rounds.");
        newFeedback.push("✨ Your answers were well-structured and showed depth of knowledge.");
        newFeedback.push("💼 You're well-prepared for real interviews. Keep up the great work!");
      } else if (overallScore >= 60) {
        newFeedback.push("👍 Good performance overall with room for improvement.");
        newFeedback.push("📝 Try to provide more specific examples in your answers.");
        newFeedback.push("💡 Practice structuring your responses using the STAR method.");
      } else {
        newFeedback.push("📚 There's significant room for improvement.");
        newFeedback.push("💡 Practice structuring your answers using the STAR method (Situation, Task, Action, Result).");
        newFeedback.push("🎯 Focus on providing concrete examples from your experience.");
        newFeedback.push("⏰ Take more time to think before answering - quality over speed.");
      }

      if (!hasResume) {
        newFeedback.push("📄 Consider uploading your resume next time for more personalized technical questions.");
      }

      setFeedback(newFeedback);
    }
  };

  const confirmStopInterview = () => {
    // Stop any ongoing voice output
    stopSpeaking();
    setShowStopModal(false);
    calculateResults();
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // CRITICAL: Save the current question BEFORE we change currentMessage
    const currentQuestion = currentMessage.content;

    // Stop answer timer if active (for managerial/HR rounds)
    if (isAnswerTimerActive) {
      setIsAnswerTimerActive(false);
    }

    setInputText('');
    setIsNovaResponding(true);

    // Show thinking state after a brief delay
    setIsThinking(true);

    // Get AI evaluation
    try {
      const aiResponse = await getInterviewResponse(
        content.trim(),
        currentQuestion, // Use saved question
        currentRound,
        questionIndex,
        ROUND_INFO[currentRound].questionCount,
        resumeText || undefined
      );

      setInterviewAnswers(prev => [...prev, {
        question: currentQuestion, // Use saved question
        answer: content.trim(),
        round: currentRound,
        score: aiResponse.score,
      }]);

      const currentRoundIndex = ROUND_ORDER.indexOf(currentRound);
      const questionsInRound = getQuestionsForRound(currentRound);
      const nextQuestionIndex = questionIndex + 1;

      let nextMessage = '';
      let isComplete = false;
      let nextRound: InterviewRound | null = null;

      if (nextQuestionIndex < ROUND_INFO[currentRound].questionCount && nextQuestionIndex < questionsInRound.length) {
        setQuestionIndex(nextQuestionIndex);
        nextMessage = `${aiResponse.feedback}\n\nQuestion ${nextQuestionIndex + 1} of 3: ${questionsInRound[nextQuestionIndex]}`;
      } else if (currentRoundIndex < ROUND_ORDER.length - 1) {
        nextRound = ROUND_ORDER[currentRoundIndex + 1];
        setCurrentRound(nextRound);
        setQuestionIndex(0);
        const nextQuestions = getQuestionsForRound(nextRound);
        nextMessage = `${aiResponse.feedback}\n\nGreat job completing the ${ROUND_INFO[currentRound].name}! 🎉\n\nNow let's move to the ${ROUND_INFO[nextRound].name}.\n${ROUND_INFO[nextRound].icon} ${ROUND_INFO[nextRound].description}\n\nQuestion 1 of 3: ${nextQuestions[0]}`;
      } else {
        isComplete = true;
        nextMessage = `${aiResponse.feedback}\n\nCongratulations! 🎉 You've completed all 4 rounds of the interview!\n\nI'm now analyzing your responses and preparing your detailed feedback...`;
      }

      setIsThinking(false);
      setCurrentMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: nextMessage,
      });

      // Speak the response
      try {
        await speakText(nextMessage, () => setIsSpeaking(true), () => setIsSpeaking(false));
      } catch (speechError) {
        console.error('Speech error:', speechError);
      }
      setIsNovaResponding(false);

      // Start timer for next question
      const roundForTimer = nextRound || currentRound;
      if (!isComplete) {
        if (roundForTimer === 'managerial' || roundForTimer === 'hr') {
          // Managerial/HR: 20s think time, then 60s answer time
          setThinkTimer(20);
          setIsThinkTimerActive(true);
        } else {
          // Aptitude/Technical: 30s answer timer directly
          setAnswerTimer(30);
          setIsAnswerTimerActive(true);
        }
      }

      if (isComplete) {
        setTimeout(calculateResults, 3000);
      }
    } catch (error) {
      console.error('AI response error:', error);
      setIsThinking(false);
      setIsNovaResponding(false);
      setCurrentMessage({
        id: Date.now().toString(),
        role: 'bot',
        content: "Good answer! Let's continue with the next question.",
      });
    }
  };

  // 🎤 Web Speech API - Voice Input/Output
  const handleMicClick = async () => {
    if (isListening) {
      // User clicked to STOP listening
      setIsListening(false);
      stopListening();
      return;
    }

    // User clicked to START listening
    setIsListening(true);

    try {
      // Start listening and wait for user to speak
      const userTranscript = await startListening();
      setIsListening(false);

      if (!userTranscript || userTranscript.trim().length === 0) {
        setCurrentMessage({
          id: Date.now().toString(),
          role: 'bot',
          content: "I didn't catch that. Could you please try again?",
        });
        return;
      }

      // Stop answer timer if active (for managerial/HR rounds)
      if (isAnswerTimerActive) {
        setIsAnswerTimerActive(false);
      }

      // CRITICAL: Save the current question BEFORE we change currentMessage
      const currentQuestion = currentMessage.content;

      // Show user's message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userTranscript,
      };
      setIsNovaResponding(true);

      // Show thinking state
      setIsThinking(true);

      // Get AI evaluation of the answer
      const aiResponse = await getInterviewResponse(
        userTranscript,
        currentQuestion, // Use saved question
        currentRound,
        questionIndex,
        ROUND_INFO[currentRound].questionCount,
        resumeText || undefined
      );

      // Save answer with AI score
      setInterviewAnswers(prev => [...prev, {
        question: currentQuestion, // Use saved question
        answer: userTranscript,
        round: currentRound,
        score: aiResponse.score,
      }]);

      // Process next question logic
      const currentRoundIndex = ROUND_ORDER.indexOf(currentRound);
      const questionsInRound = getQuestionsForRound(currentRound);
      const nextQuestionIndex = questionIndex + 1;

      let nextMessage = '';
      let isComplete = false;
      let nextRound: InterviewRound | null = null;

      if (nextQuestionIndex < ROUND_INFO[currentRound].questionCount && nextQuestionIndex < questionsInRound.length) {
        setQuestionIndex(nextQuestionIndex);
        nextMessage = `${aiResponse.feedback}\n\nQuestion ${nextQuestionIndex + 1} of 3: ${questionsInRound[nextQuestionIndex]}`;
      } else if (currentRoundIndex < ROUND_ORDER.length - 1) {
        nextRound = ROUND_ORDER[currentRoundIndex + 1];
        setCurrentRound(nextRound);
        setQuestionIndex(0);
        const nextQuestions = getQuestionsForRound(nextRound);
        nextMessage = `${aiResponse.feedback}\n\nGreat job completing the ${ROUND_INFO[currentRound].name}! 🎉\n\nNow let's move to the ${ROUND_INFO[nextRound].name}.\n${ROUND_INFO[nextRound].icon} ${ROUND_INFO[nextRound].description}\n\nQuestion 1 of 3: ${nextQuestions[0]}`;
      } else {
        isComplete = true;
        nextMessage = `${aiResponse.feedback}\n\nCongratulations! 🎉 You've completed all 4 rounds of the interview!\n\nI'm now analyzing your responses and preparing your detailed feedback...`;
      }

      setIsThinking(false);
      setCurrentMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: nextMessage,
      });

      // Speak the response
      try {
        await speakText(nextMessage, () => setIsSpeaking(true), () => setIsSpeaking(false));
      } catch (speechError) {
        console.error('Speech error:', speechError);
      }
      setIsNovaResponding(false);

      // Start timer for next question
      const roundForTimer = nextRound || currentRound;
      if (!isComplete) {
        if (roundForTimer === 'managerial' || roundForTimer === 'hr') {
          // Managerial/HR: 20s think time, then 60s answer time
          setThinkTimer(20);
          setIsThinkTimerActive(true);
        } else {
          // Aptitude/Technical: 30s answer timer directly
          setAnswerTimer(30);
          setIsAnswerTimerActive(true);
        }
      }

      if (isComplete) {
        setTimeout(calculateResults, 3000);
      }

    } catch (error) {
      console.error('Voice processing error:', error);
      setIsThinking(false);
      setIsListening(false);
      setIsNovaResponding(false);

      // Fallback: Show error message
      setCurrentMessage({
        id: Date.now().toString(),
        role: 'bot',
        content: "I had trouble hearing that. Could you please try again or type your response?",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const restartInterview = () => {
    // Clear session questions to ensure fresh questions next time
    clearSessionQuestions();
    generatedQuestionsRef.current = {};
    setGeneratedQuestions({});

    setStage('rules');
    setResumeFile(null);
    setResumeText('');
    setSelectedField('');
    setSelectedSubField('');
    setHasResume(false);
    setCurrentRound('aptitude');
    setQuestionIndex(0);
    setInterviewAnswers([]);
    setResumeScore(0);
    setInterviewScore(0);
    setFeedback([]);
    setGreetingStep(0);
    setThinkTimer(20);
    setAnswerTimer(60);
    setIsThinkTimerActive(false);
    setIsAnswerTimerActive(false);
  };

  const getRatingStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
    ));
  };

  // Check if we should show back button (only on start, field-select, and subfield-select screens)
  const showBackButton = stage === 'rules' || stage === 'start' || stage === 'field-select' || stage === 'subfield-select';

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Classroom Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f1a] via-[#3d2e24] to-[#1a1412]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-radial from-amber-900/20 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Ceiling */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#1a1510] to-transparent">
          <div className="flex justify-center gap-32 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                <div className="w-24 h-2 bg-slate-700 rounded" />
                <div className="w-20 h-1 bg-slate-600 mx-auto rounded-b" />
                <motion.div
                  animate={{ opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="w-16 h-8 bg-gradient-to-b from-amber-200/40 to-transparent mx-auto blur-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Chalkboard - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block absolute top-[20%] left-[55%] w-[40vw] max-w-2xl z-10"
        >
          <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 p-3 rounded-lg shadow-2xl">
            <div className="relative bg-gradient-to-br from-[#2a4a3a] via-[#1e3a2a] to-[#162a1e] rounded h-32 md:h-40 shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute inset-4 text-white/70">
                {stage === 'interviewing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm font-semibold text-white/90 mb-2">
                      {ROUND_INFO[currentRound].icon} {ROUND_INFO[currentRound].name}
                    </p>
                    <p className="text-xs text-white/60 mb-3">{ROUND_INFO[currentRound].description}</p>
                    <div className="flex gap-2">
                      {ROUND_ORDER.map((round, i) => (
                        <div
                          key={round}
                          className={`w-3 h-3 rounded-full ${
                            ROUND_ORDER.indexOf(currentRound) > i
                              ? 'bg-green-400'
                              : ROUND_ORDER.indexOf(currentRound) === i
                              ? 'bg-yellow-400 animate-pulse'
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/50 mt-2">
                      Question {questionIndex + 1} of {ROUND_INFO[currentRound].questionCount}
                    </p>
                  </motion.div>
                )}
                {stage === 'greeting' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm font-semibold text-white/90 mb-2">🎯 Getting Ready...</p>
                    <p className="text-xs text-white/60">Preparing your interview session</p>
                    <div className="mt-3 flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: greetingStep >= i ? 1 : 0.3 }}
                          className="w-2 h-2 bg-green-400 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {(stage === 'rules' || stage === 'start' || stage === 'field-select' || stage === 'subfield-select' || stage === 'results') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm md:text-base" style={{ fontFamily: "'Caveat', cursive" }}>
                      Interview Practice Session
                    </p>
                    <div className="mt-2 text-xs md:text-sm text-white/50 space-y-1">
                      <p>✓ Stay confident & calm</p>
                      <p>✓ Give specific examples</p>
                      <p>✓ Ask thoughtful questions</p>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900 to-amber-800 rounded-b" />
            </div>
          </div>
        </motion.div>

        {/* Side decorations - Hidden on mobile */}
        <div className="hidden md:block absolute top-28 left-8 w-20 h-28 bg-gradient-to-br from-amber-100 to-amber-200 rounded border-4 border-amber-800 shadow-lg opacity-80" />
        <div className="hidden md:block absolute top-32 right-8 w-24 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded shadow-lg opacity-80 flex items-center justify-center">
          <span className="text-purple-700 font-bold text-xs">LearnNova</span>
        </div>

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#2a1f18] via-[#3d2e24] to-[#4a3828]">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute h-full border-r border-amber-900/40"
                style={{ left: `${i * 8.33}%`, width: '8.33%' }}
              />
            ))}
          </div>
        </div>

        {/* Desk - Smaller on mobile */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-10"
        >
          <div className="relative">
            <div className="w-[280px] md:w-[400px] lg:w-[500px] h-5 md:h-6 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-t-lg shadow-2xl" />
            <div className="absolute -top-6 md:-top-8 left-4 md:left-6 w-8 md:w-10 h-10 md:h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-t shadow-lg" />
            <div className="absolute -top-2 md:-top-3 left-14 md:left-20 w-12 md:w-16 h-1.5 md:h-2 bg-white rounded shadow-md" />
            <div className="absolute -top-4 md:-top-6 right-8 md:right-12 w-5 md:w-6 h-5 md:h-7 bg-gradient-to-br from-purple-600 to-purple-700 rounded-b">
              <div className="absolute -right-1.5 md:-right-2 top-0.5 md:top-1 w-1.5 md:w-2 h-3 md:h-4 border-2 border-purple-600 rounded-r" />
            </div>
            <div className="w-[280px] md:w-[400px] lg:w-[500px] h-16 md:h-20 bg-gradient-to-b from-amber-800 to-amber-950 rounded-b shadow-2xl" />
            <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-8 w-5 md:w-6 h-12 md:h-16 bg-gradient-to-r from-amber-900 to-amber-950 rounded" />
            <div className="absolute -bottom-12 md:-bottom-16 right-6 md:right-8 w-5 md:w-6 h-12 md:h-16 bg-gradient-to-r from-amber-900 to-amber-950 rounded" />
          </div>
        </motion.div>

        {/* Chair - Smaller on mobile */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-[28%] left-1/2 -translate-x-1/2 z-5"
        >
          <div className="w-20 h-24 md:w-28 md:h-32 bg-gradient-to-br from-slate-600 to-slate-800 rounded-t-2xl relative shadow-2xl">
            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-inner" />
          </div>
        </motion.div>

        {/* BOT CHARACTER - Smaller on mobile */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 150 }}
          className="absolute bottom-[38%] left-1/2 -translate-x-1/2 z-20 scale-75 md:scale-100"
        >
          <motion.div
            animate={
              isSpeaking ? { y: [0, -2, 0] } : isThinking ? { rotate: [-1, 1, -1] } : {}
            }
            transition={{ duration: isSpeaking ? 1.5 : 1.5, repeat: isSpeaking || isThinking ? Infinity : 0 }}
            className="relative"
          >
            {/* Head */}
            <div className="w-36 h-36 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-[2rem] shadow-2xl border-4 border-slate-300 relative mx-auto">
              <div className="absolute top-2 left-4 w-16 h-8 bg-white/40 rounded-full blur-sm" />
              <div className="absolute inset-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-1">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent" />
                  <div className="absolute top-5 left-0 right-0 flex justify-center gap-6">
                    <motion.div
                      animate={isSpeaking ? { scaleY: [1, 0.4, 1] } : isThinking ? { x: [-3, 3, -3] } : { scaleY: [1, 0.1, 1] }}
                      transition={{ duration: isSpeaking ? 2 : isThinking ? 0.8 : 6, repeat: Infinity, repeatDelay: isSpeaking || isThinking ? 0 : 8 }}
                      className="relative"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-cyan-300 to-purple-400 rounded-full shadow-lg shadow-cyan-400/50" />
                      <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                    <motion.div
                      animate={isSpeaking ? { scaleY: [1, 0.4, 1] } : isThinking ? { x: [-3, 3, -3] } : { scaleY: [1, 0.1, 1] }}
                      transition={{ duration: isSpeaking ? 2 : isThinking ? 0.8 : 6, repeat: Infinity, repeatDelay: isSpeaking || isThinking ? 0 : 8 }}
                      className="relative"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-cyan-300 to-purple-400 rounded-full shadow-lg shadow-cyan-400/50" />
                      <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  </div>
                  <motion.div
                    animate={isSpeaking ? { scaleY: [1, 1.3, 0.85, 1.15, 1], scaleX: [1, 0.93, 1.04, 0.96, 1] } : isThinking ? { width: ['2.5rem', '1.5rem', '2.5rem'] } : {}}
                    transition={{ duration: isSpeaking ? 2 : 2, repeat: isSpeaking || isThinking ? Infinity : 0, ease: 'easeInOut' }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 rounded-full shadow-lg shadow-cyan-400/30"
                  />
                </div>
              </div>
              <motion.div
                animate={{ rotate: isSpeaking ? [-3, 3, -3] : [0, 3, 0] }}
                transition={{ duration: isSpeaking ? 1.5 : 2, repeat: Infinity }}
                className="absolute -top-8 left-1/2 -translate-x-1/2"
              >
                <div className="w-2 h-8 bg-gradient-to-t from-slate-400 to-slate-300 rounded" />
                <motion.div
                  animate={{ boxShadow: isSpeaking ? ['0 0 10px #a855f7', '0 0 25px #a855f7', '0 0 10px #a855f7'] : ['0 0 5px #a855f7', '0 0 15px #a855f7', '0 0 5px #a855f7'] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full -mt-1 -ml-1.5"
                />
              </motion.div>
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-4 h-12 bg-gradient-to-r from-slate-400 to-slate-300 rounded-l-lg shadow-lg" />
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-4 h-12 bg-gradient-to-l from-slate-400 to-slate-300 rounded-r-lg shadow-lg" />
            </div>

            {/* Neck */}
            <div className="w-12 h-6 bg-gradient-to-b from-slate-300 to-slate-400 mx-auto rounded-b shadow-lg relative" />

            {/* Body */}
            <div className="w-32 h-24 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 rounded-2xl mx-auto shadow-2xl border-2 border-slate-400 relative -mt-1">
              <motion.div
                animate={{ boxShadow: isSpeaking ? ['0 0 15px #a855f7', '0 0 35px #a855f7', '0 0 15px #a855f7'] : ['0 0 8px #a855f7', '0 0 20px #a855f7', '0 0 8px #a855f7'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-3 bg-white/40 rounded-full" />
              </motion.div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-green-400 rounded-full" />
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.6 }} className="w-2 h-2 bg-purple-400 rounded-full" />
              </div>
            </div>

            {/* Arms */}
            <motion.div
              animate={isSpeaking ? { rotate: [-3, 3, -3] } : { rotate: [-2, 2, -2] }}
              transition={{ duration: isSpeaking ? 2 : 2, repeat: Infinity }}
              className="absolute top-44 -left-6 w-5 h-16 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full origin-top shadow-lg"
            />
            <motion.div
              animate={isSpeaking ? { rotate: [3, -3, 3] } : { rotate: [2, -2, 2] }}
              transition={{ duration: isSpeaking ? 2 : 2, repeat: Infinity }}
              className="absolute top-44 -right-6 w-5 h-16 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full origin-top shadow-lg"
            />
          </motion.div>

          {/* Name badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-3 bg-gradient-to-r from-white to-slate-100 px-5 py-2 rounded-full shadow-xl border border-slate-200 mx-auto w-fit"
          >
            <span className="text-purple-700 font-bold text-sm tracking-wide">NOVA</span>
            <span className="text-slate-400 text-xs ml-2">AI Coach</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Back Button - Only on start/field-select */}
      {showBackButton && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-30"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full h-10 px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>
      )}

      {/* Camera Preview - Repositioned for mobile */}
      {(stage === 'interviewing' || stage === 'greeting') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 md:top-4 right-2 md:right-4 z-30"
        >
          <div className="relative">
            <div className={`w-24 h-16 md:w-40 md:h-28 rounded-lg md:rounded-xl overflow-hidden shadow-2xl border-2 ${isCameraOn ? 'border-green-500' : 'border-slate-500'} bg-slate-900`}>
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
                </div>
              )}
            </div>
            <button
              onClick={toggleCamera}
              className={`absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg ${
                isCameraOn ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              {isCameraOn ? <Video className="w-3 h-3 md:w-4 md:h-4 text-white" /> : <VideoOff className="w-3 h-3 md:w-4 md:h-4 text-white" />}
            </button>
            <span className="absolute -bottom-1 md:-bottom-2 left-1 md:left-2 text-[10px] md:text-xs text-white bg-black/60 px-1 md:px-2 py-0.5 rounded">You</span>
          </div>
        </motion.div>
      )}

      {/* Stop Interview Button - Show during greeting and interviewing - Repositioned for mobile */}
      {(stage === 'greeting' || stage === 'interviewing') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 md:top-4 left-2 md:left-auto md:right-52 z-30"
        >
          <Button
            onClick={() => setShowStopModal(true)}
            variant="ghost"
            className="bg-red-500/90 hover:bg-red-600 text-white shadow-lg rounded-full h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm"
          >
            <StopCircle className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">Stop Interview</span>
          </Button>
        </motion.div>
      )}

      {/* Stop Interview Confirmation Modal */}
      <AnimatePresence>
        {showStopModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Stop Interview?
                </h2>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to end the interview early? Your progress will be saved and you'll receive feedback based on your answers so far.
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Questions Answered</p>
                    <p className="text-xs text-amber-600">
                      You've completed {interviewAnswers.length} of {ROUND_ORDER.length * 3} questions
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowStopModal(false)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2"
                >
                  Continue Interview
                </Button>
                <Button
                  onClick={confirmStopInterview}
                  className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  Stop & Get Results
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RULES SCREEN */}
      <AnimatePresence>
        {stage === 'rules' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-700 mb-4 -mt-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Back to Dashboard</span>
              </button>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Interview Rules & Guidelines
                </h2>
                <p className="text-slate-500 text-sm">
                  Please read the rules before proceeding
                </p>
              </div>

              {/* Round Structure */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Interview Structure
                </h3>
                <div className="space-y-2">
                  {ROUND_ORDER.map((round, i) => (
                    <div key={round} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className="text-lg">{ROUND_INFO[round].icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          Round {i + 1}: {ROUND_INFO[round].name}
                        </p>
                        <p className="text-xs text-slate-500">{ROUND_INFO[round].description}</p>
                      </div>
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {ROUND_INFO[round].questionCount} Qs
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timer Rules */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Time Limits
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">30s</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Aptitude & Technical Rounds</p>
                      <p className="text-xs text-blue-600">30 seconds to answer each question. You can type or speak.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-amber-700">80s</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Managerial & HR Rounds</p>
                      <p className="text-xs text-amber-600">20 seconds to think + 60 seconds to answer. Voice input only.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Rules */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  General Rules
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>All questions are <strong>AI-generated</strong> and unique to each session</span>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Your camera will be turned on during the interview</span>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Nova will speak each question aloud — input appears after she finishes</span>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>If the timer runs out, your answer will be auto-submitted</span>
                  </div>
                  <div className="flex items-start gap-2 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You can stop the interview early and still receive feedback</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStage('start')}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg text-base font-semibold"
              >
                I Understand, Let's Begin
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* START SCREEN */}
      <AnimatePresence>
        {stage === 'start' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <button
                onClick={() => setStage('rules')}
                className="flex items-center text-slate-500 hover:text-slate-700 mb-4 -mt-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Back to Rules</span>
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Start Your Interview
                </h2>
                <p className="text-slate-500 text-sm">
                  4 rounds: Aptitude → Technical → Managerial → HR
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingResume}
                className="w-full p-5 mb-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all group"
              >
                {isProcessingResume ? (
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"
                    />
                    <span className="text-purple-700 font-medium">Processing resume...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-purple-200 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                      <Upload className="w-7 h-7 text-purple-600" />
                    </div>
                    <p className="font-semibold text-purple-700 mb-1">Upload Your Resume</p>
                    <p className="text-xs text-purple-500">PDF format only • Get personalized questions</p>
                  </>
                )}
              </motion.button>

              {resumeFile && (
                <div className="mb-4 p-3 bg-green-50 rounded-xl flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 flex-1 truncate">{resumeFile.name}</span>
                  <button onClick={() => setResumeFile(null)} className="text-green-600 hover:text-green-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-slate-400">or</span>
                </div>
              </div>

              <Button
                onClick={handleContinueWithoutResume}
                variant="outline"
                className="w-full h-14 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700"
              >
                Continue Without Resume
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-slate-400 text-center mt-4">
                Choose your field and practice general interview questions
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIELD SELECT SCREEN */}
      <AnimatePresence>
        {stage === 'field-select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto relative"
            >
              {/* Top bar with back and next buttons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStage('start')}
                  className="flex items-center text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-sm">Back</span>
                </button>

                {selectedField && (
                  <Button
                    onClick={handleContinueToSubfield}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 h-9 text-sm font-medium shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Select Your Field
                </h2>
                <p className="text-slate-500 text-sm">
                  Choose your area of expertise for relevant questions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FIELD_OPTIONS.map((field) => (
                  <motion.button
                    key={field.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFieldSelect(field.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedField === field.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{field.icon}</span>
                    <span className={`text-sm font-medium ${selectedField === field.id ? 'text-purple-700' : 'text-slate-700'}`}>
                      {field.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBFIELD SELECT SCREEN */}
      <AnimatePresence>
        {stage === 'subfield-select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto relative"
            >
              {/* Top bar with back and start interview buttons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setStage('field-select')}
                  className="flex items-center text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-sm">Back</span>
                </button>

                {selectedSubField && (
                  <Button
                    onClick={handleStartInterviewFromSubfield}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-6 h-9 text-sm font-medium shadow-lg"
                  >
                    Start Interview
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Choose Your Specialization
                </h2>
                <p className="text-slate-500 text-sm">
                  {FIELD_OPTIONS.find(f => f.id === selectedField)?.label} - Select a sub-field
                </p>
              </div>

              <div className="space-y-3">
                {FIELD_OPTIONS.find(f => f.id === selectedField)?.subFields?.map((subField) => (
                  <motion.button
                    key={subField.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubFieldSelect(subField.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedSubField === subField.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className={`text-sm font-semibold block mb-1 ${selectedSubField === subField.id ? 'text-purple-700' : 'text-slate-800'}`}>
                          {subField.label}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {subField.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {skill}
                            </span>
                          ))}
                          {subField.skills.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              +{subField.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedSubField === subField.id && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS SCREEN */}
      <AnimatePresence>
        {stage === 'results' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <Award className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Interview Complete!
                </h2>
                <p className="text-slate-500">Here's your detailed performance analysis</p>
              </div>

              {/* Scores */}
              <div className={`grid ${hasResume ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-8`}>
                {hasResume && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Resume Score</span>
                    </div>
                    <div className="text-4xl font-bold text-purple-700 mb-2">{resumeScore}%</div>
                    <div className="flex gap-0.5">{getRatingStars(resumeScore)}</div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    <span className="font-semibold text-cyan-900">Interview Score</span>
                  </div>
                  <div className="text-4xl font-bold text-cyan-700 mb-2">{interviewScore}%</div>
                  <div className="flex gap-0.5">{getRatingStars(interviewScore)}</div>
                </motion.div>
              </div>

              {/* Round Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span>Round-wise Performance</span>
                </h3>
                <div className="space-y-3">
                  {ROUND_ORDER.map((round, index) => {
                    const roundAnswers = interviewAnswers.filter(a => a.round === round);
                    const avgScore = roundAnswers.length > 0
                      ? Math.round(roundAnswers.reduce((sum, a) => sum + a.score, 0) / roundAnswers.length)
                      : 0;
                    return (
                      <motion.div
                        key={round}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                      >
                        <span className="text-2xl">{ROUND_INFO[round].icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-700">{ROUND_INFO[round].name}</p>
                          <p className="text-xs text-slate-500">{roundAnswers.length} questions answered</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${avgScore >= 75 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : avgScore === 0 ? 'text-slate-400' : 'text-red-600'}`}>
                            {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Resume Feedback - Show after interview if resume was uploaded */}
              {hasResume && resumeFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="mb-8"
                >
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Resume Feedback
                  </h3>
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl font-bold text-purple-700">{resumeScore}%</div>
                      <div className="flex gap-0.5">{getRatingStars(resumeScore)}</div>
                    </div>
                    {resumeSkills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-purple-700 mb-2">Skills Identified:</p>
                        <div className="flex flex-wrap gap-1">
                          {resumeSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-purple-200/60 text-purple-800 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-purple-900 leading-relaxed">{resumeFeedback}</p>
                  </div>
                </motion.div>
              )}

              {/* Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <h3 className="font-semibold text-slate-800 mb-4">Feedback & Recommendations</h3>
                <div className="space-y-3">
                  {feedback.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`flex items-start gap-3 p-4 rounded-xl ${
                        item.includes('🎉') || item.includes('✨') || item.includes('💼') || item.includes('👍')
                          ? 'bg-green-50 border border-green-200'
                          : item.includes('📚') || item.includes('💡') || item.includes('🎯') || item.includes('⏰') || item.includes('📄')
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {item.includes('🎉') || item.includes('✨') || item.includes('💼') || item.includes('👍') ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-slate-700">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={restartInterview}
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                >
                  Practice Again
                </Button>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="outline"
                  className="flex-1 h-14 rounded-xl border-2"
                >
                  Back to Courses
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPEECH BUBBLE - For greeting and interviewing - Repositioned for mobile */}
      <AnimatePresence>
        {(stage === 'interviewing' || stage === 'greeting') && currentMessage.content && (
          <motion.div
            key={currentMessage.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-[15%] md:top-[25%] left-2 right-2 md:left-4 md:right-auto md:w-[38vw] md:max-w-md z-25"
          >
            <div className={`relative px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-2xl ${
              currentMessage.role === 'user'
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
                : 'bg-white text-slate-700 border border-slate-100'
            }`}>
              <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                currentMessage.role === 'user' ? 'border-white/20' : 'border-slate-100'
              }`}>
                {currentMessage.role === 'bot' ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600">Nova</span>
                    {isSpeaking && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Volume2 className="w-3 h-3 text-purple-500 animate-pulse" />
                        <span className="text-xs text-purple-400 hidden md:inline">Speaking</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">You</span>
                    </div>
                    <span className="text-xs font-semibold text-white/80">Your Response</span>
                  </>
                )}
              </div>
              <p className="text-xs md:text-sm lg:text-base leading-relaxed whitespace-pre-line">{currentMessage.content}</p>
              {/* Pointer - Only show on desktop, pointing RIGHT towards robot */}
              <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 w-0 h-0
                border-t-[12px] border-b-[12px] border-l-[12px]
                border-t-transparent border-b-transparent ${
                  currentMessage.role === 'user' ? 'border-l-purple-700' : 'border-l-white'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking bubble - Repositioned for mobile */}
      <AnimatePresence>
        {stage === 'interviewing' && isThinking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-[35%] md:top-[40%] left-2 md:left-4 z-25"
          >
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-2xl border border-slate-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 md:w-2.5 md:h-2.5 bg-purple-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-slate-500">Nova is thinking...</span>
              </div>
              {/* Pointer pointing RIGHT - Only show on desktop */}
              <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - Mobile responsive */}
      <AnimatePresence>
        {stage === 'interviewing' && !isNovaResponding && !isThinking && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-2 md:p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent z-30"
          >
            <div className="max-w-2xl mx-auto">
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 md:mb-4 flex items-center justify-center"
                  >
                    <div className="bg-white/95 backdrop-blur-sm px-4 md:px-8 py-2 md:py-4 rounded-full flex items-center gap-2 md:gap-4 shadow-2xl">
                      <div className="flex gap-0.5 md:gap-1">
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 28, 8] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                            className="w-1 md:w-1.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-sm md:text-base text-purple-700 font-semibold">Listening...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer Display for all rounds */}
              {(isThinkTimerActive || isAnswerTimerActive) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 md:mb-4 flex items-center justify-center"
                >
                  <div className={`backdrop-blur-sm px-3 md:px-6 py-2 md:py-3 rounded-full flex items-center gap-2 md:gap-3 shadow-2xl ${
                    isAnswerTimerActive && answerTimer <= 10 ? 'bg-red-50/95 border border-red-200' : 'bg-white/95'
                  }`}>
                    {isThinkTimerActive ? (
                      <>
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs md:text-sm text-blue-700 font-semibold">Think: {thinkTimer}s</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${answerTimer <= 10 ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className={`text-xs md:text-sm font-semibold ${answerTimer <= 10 ? 'text-red-700' : 'text-green-700'}`}>Answer: {answerTimer}s</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-2 md:gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleMicClick}
                    disabled={isThinkTimerActive}
                    className={`h-12 w-12 md:h-16 md:w-16 rounded-full shadow-2xl transition-all ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50 animate-pulse'
                        : isThinkTimerActive
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-purple-600/50'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5 md:w-7 md:h-7 text-white" /> : <Mic className="w-5 h-5 md:w-7 md:h-7 text-white" />}
                  </Button>
                </motion.div>

                {/* Text input - only for aptitude and technical rounds */}
                {(currentRound === 'aptitude' || currentRound === 'technical') && (
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response..."
                      className="w-full h-12 md:h-16 px-4 md:px-6 pr-12 md:pr-16 rounded-full border-2 border-white/30 focus:border-purple-400 focus:outline-none transition-all bg-white/95 backdrop-blur-sm shadow-xl text-sm md:text-base text-slate-700 placeholder-slate-400"
                      disabled={isListening || isThinking}
                    />
                    <Button
                      onClick={() => handleSendMessage(inputText)}
                      disabled={!inputText.trim() || isListening || isThinking}
                      className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 shadow-lg"
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </Button>
                  </div>
                )}

                {/* Voice-only message for managerial and HR rounds */}
                {(currentRound === 'managerial' || currentRound === 'hr') && (
                  <div className="flex-1">
                    <div className="h-12 md:h-16 px-3 md:px-6 rounded-full border-2 border-white/30 bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center">
                      <p className="text-purple-700 font-medium text-xs md:text-sm">
                        🎤 Voice only
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 md:mt-3 text-center">
                <p className="text-white/70 text-xs md:text-sm">
                  {currentRound === 'aptitude' || currentRound === 'technical' ? (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <Mic className="w-3 h-3" /> Speak
                      </span>
                      <span className="mx-2 md:mx-3 text-white/40">|</span>
                      <span className="hidden md:inline">Type and press Enter</span>
                      <span className="md:hidden">Type</span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Click mic to speak
                    </span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
