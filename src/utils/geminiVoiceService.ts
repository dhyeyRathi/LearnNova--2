/**
 * Voice Service for AI Interviewer
 *
 * Uses Web Speech API (built into browsers) for immediate voice support:
 * - SpeechSynthesis for Text-to-Speech (Nova speaking)
 * - SpeechRecognition for Speech-to-Text (User speaking)
 *
 * Also integrates with Gemini for generating intelligent responses.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  INTERVIEWER_RESUME_EXTRACTION_PROMPT,
  INTERVIEWER_RESUME_EVALUATION_PROMPT,
  INTERVIEWER_RESUME_ANALYSIS_PROMPT,
  INTERVIEWER_ALL_QUESTIONS_PROMPT,
  INTERVIEWER_QUESTION_GENERATION_PROMPT,
  INTERVIEWER_ANSWER_EVALUATION_PROMPT,
  INTERVIEWER_FINAL_FEEDBACK_PROMPT,
  INTERVIEWER_ROUND_DESCRIPTIONS,
  getInterviewerTechnicalRoundDescription,
} from './prompts';
import {
  getPreviousQuestionsPromptText,
  saveInterviewHistory,
  InterviewHistoryEntry,
} from './interviewHistoryService';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const INTERVIEW_MODEL = 'gemini-3.1-flash-lite-preview';

// ============================================
// TEXT-TO-SPEECH (Nova Speaking)
// Using Web Speech API - works in all browsers
// ============================================

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Make Nova speak using browser's built-in TTS
 */
export const speakText = (text: string, onStart?: () => void, onEnd?: () => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Strip emojis so TTS doesn't read them aloud
    const cleanText = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    // Configure voice settings for male voice
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 0.9; // Lower pitch for male voice
    utterance.volume = 1;

    // Try to find a good male voice for Nova
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes('Google') && v.name.includes('Male') ||
        v.name.includes('Microsoft David') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('Microsoft Mark') ||
        v.name.includes('Daniel')
    ) || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      currentUtterance = null;
      onEnd?.();
      reject(event);
    };

    speechSynthesis.speak(utterance);
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  speechSynthesis.cancel();
  currentUtterance = null;
};

/**
 * Check if currently speaking
 */
export const isSpeaking = () => speechSynthesis.speaking;

// Load voices (needed for some browsers)
if (typeof window !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

// ============================================
// SESSION QUESTION TRACKING
// Prevents question repetition across rounds
// ============================================

let sessionAskedQuestions: string[] = [];

/**
 * Clear session questions (call when starting a new interview)
 */
export const clearSessionQuestions = () => {
  sessionAskedQuestions = [];
};

/**
 * Add questions to session tracking
 */
export const addSessionQuestions = (questions: string[]) => {
  sessionAskedQuestions.push(...questions);
};

// ============================================
// SPEECH-TO-TEXT (User Speaking)
// Using Web Speech API
// ============================================

let recognition: any = null;

/**
 * Initialize speech recognition
 */
const initRecognition = (): any => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'en-US';
  recognizer.maxAlternatives = 1;

  return recognizer;
};

/**
 * Start listening for speech and return the transcribed text
 */
export const startListening = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!recognition) {
      recognition = initRecognition();
    }

    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcribed:', transcript);
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      reject(new Error(event.error));
    };

    recognition.onend = () => {
      // Recognition ended without result
    };

    try {
      recognition.start();
      console.log('Listening...');
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Stop listening
 */
export const stopListening = () => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      // Ignore errors when stopping
    }
  }
};
      
// ============================================
  // GEMINI AI RESPONSES
// Model: gemini-3.1-flash-lite-preview
// For generating intelligent interview feedback
// ============================================

/**
 * Extract text from PDF file using Gemini AI
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Convert PDF to base64 and use Gemini's multimodal API directly
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const model = genAI.getGenerativeModel({ model: INTERVIEW_MODEL });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      INTERVIEWER_RESUME_EXTRACTION_PROMPT
    ]);

    const extractedText = result.response.text();

    if (!extractedText || extractedText.length < 50) {
      throw new Error('Failed to extract meaningful text from PDF');
    }

    console.log('✅ PDF extracted successfully, length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please try a different file or ensure your PDF contains readable text.');
  }
};

export const analyzeResumeFromPDF = async (
  file: File
): Promise<{ resumeText: string; score: number; skills: string[]; experience: string; feedback: string }> => {
  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const model = genAI.getGenerativeModel({
      model: INTERVIEW_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      INTERVIEWER_RESUME_ANALYSIS_PROMPT
    ]);

    const response = result.response.text().trim();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

    const resumeText = toDisplayText(parsed.resumeText, '').trim();
    if (resumeText.length < 50) {
      throw new Error('Failed to extract meaningful text from PDF');
    }

    return {
      resumeText,
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 70)),
      skills: toSkillsList(parsed.skills),
      experience: toDisplayText(parsed.experience, 'Experience details extracted'),
      feedback: toDisplayText(parsed.feedback, 'Resume analyzed successfully.')
    };
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error('Failed to analyze resume. Please upload a clear and valid resume PDF.');
  }
};

const toDisplayText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') {
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
        const content = typeof val === 'string' ? val.trim() : String(val);
        return content ? `${label}: ${content}` : '';
      })
      .filter(Boolean);
    return entries.length > 0 ? entries.join('\n') : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

const toSkillsList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const skills = value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
      .filter((item) => item.length > 0);
    return skills.length > 0 ? skills : ['General Skills'];
  }

  if (typeof value === 'string') {
    const skills = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return skills.length > 0 ? skills : ['General Skills'];
  }

  return ['General Skills'];
};

/**
 * Evaluate resume using Gemini AI
 * Returns a score (0-100) and extracted skills/experience
 */
export const evaluateResume = async (
  resumeText: string
): Promise<{ score: number; skills: string[]; experience: string; feedback: string }> => {
  try {
    // Clean the resume text - remove any non-printable characters
    const cleanedText = resumeText
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10k chars

    if (cleanedText.length < 50) {
      console.error('Resume text too short:', cleanedText.length);
      return {
        score: 60,
        skills: ['General Skills'],
        experience: 'Unable to extract experience details',
        feedback: 'Could not fully analyze resume. Please ensure your PDF contains readable text.'
      };
    }

    const model = genAI.getGenerativeModel({ model: INTERVIEW_MODEL });

    const prompt = INTERVIEWER_RESUME_EVALUATION_PROMPT(cleanedText);

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Try multiple parsing strategies
    let parsed = null;

    // Strategy 1: Direct parse
    try {
      parsed = JSON.parse(response);
    } catch {
      // Strategy 2: Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch { /* continue */ }
      }
    }

    if (parsed) {
      console.log('✅ Resume evaluated:', parsed.score);
      return {
        score: Math.min(100, Math.max(0, parseInt(parsed.score) || 70)),
        skills: toSkillsList(parsed.skills),
        experience: toDisplayText(parsed.experience, 'Experience details extracted'),
        feedback: toDisplayText(parsed.feedback, 'Resume analyzed successfully.')
      };
    }

    // Fallback: Extract what we can with regex
    const scoreMatch = response.match(/"score"\s*:\s*(\d+)/);
    const skillsMatch = response.match(/"skills"\s*:\s*\[(.*?)\]/);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 65,
      skills: skillsMatch ? skillsMatch[1].split(',').map(s => s.replace(/["\s]/g, '')) : ['General Skills'],
      experience: 'Experience extracted from resume',
      feedback: 'Resume analyzed. Good foundation - keep building your experience!'
    };
  } catch (error) {
    console.error('Resume evaluation error:', error);
    return {
      score: 60,
      skills: ['General Skills'],
      experience: 'Unable to fully analyze experience',
      feedback: 'Resume processed with limited analysis. Consider using a text-based resume format for better results.'
    };
  }
};

/**
 * Generate unique interview questions using Gemini AI
 * Questions are tailored to the user's field and resume
 * Tracks session questions to prevent repetition
 * Loads ALL previously asked questions from database to NEVER repeat
 */
export const generateInterviewQuestions = async (
  round: 'aptitude' | 'technical' | 'managerial' | 'hr',
  field: string,
  skills: string[],
  questionCount: number = 3,
  userId?: string
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({
      model: INTERVIEW_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    }); // LINE 231 - GEMINI MODEL

    // Build round description (technical round needs dynamic skills/field)
    const roundDescription = round === 'technical'
      ? getInterviewerTechnicalRoundDescription(skills, field)
      : INTERVIEWER_ROUND_DESCRIPTIONS[round] || INTERVIEWER_ROUND_DESCRIPTIONS.aptitude;

    // Add randomization seed for unique questions each session
    const uniqueSeed = Date.now() + Math.random().toString(36).substring(7);

    // Build exclusion list from:
    // 1. Session questions (current interview)
    // 2. DATABASE questions (all previous interviews for this user)
    let allPreviousQuestions: string[] = [...sessionAskedQuestions];

    // Load ALL previously asked questions from database if userId is provided
    if (userId) {
      try {
        const dbQuestionsText = await getPreviousQuestionsPromptText(userId);
        if (dbQuestionsText) {
          // Parse the numbered list back to array
          const dbQuestions = dbQuestionsText.split('\n').map(line => {
            // Remove numbering like "1. " from start
            return line.replace(/^\d+\.\s*/, '').trim();
          }).filter(q => q.length > 0);
          allPreviousQuestions = [...new Set([...allPreviousQuestions, ...dbQuestions])];
        }
        console.log(`📚 Loaded ${allPreviousQuestions.length} previous questions for user to avoid repetition`);
      } catch (err) {
        console.warn('Could not load previous questions from DB:', err);
      }
    }

    const previousQuestionsText = allPreviousQuestions.length > 0
      ? `\n\n⚠️ CRITICAL - PREVIOUSLY ASKED QUESTIONS (NEVER REPEAT, NEVER REPHRASE, NEVER ASK SIMILAR):\n${allPreviousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n⛔ The above ${allPreviousQuestions.length} questions have ALREADY been asked to this candidate. Generate COMPLETELY NEW and DIFFERENT questions.`
      : '';

    const prompt = INTERVIEWER_QUESTION_GENERATION_PROMPT(
      round,
      questionCount,
      uniqueSeed,
      field,
      skills,
      roundDescription,
      previousQuestionsText
    );

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(questions) && questions.length >= questionCount) {
        const newQuestions = questions.slice(0, questionCount);
        // Track these questions to avoid repetition in future rounds
        addSessionQuestions(newQuestions);
        return newQuestions;
      }
    }

    // Fallback questions if Gemini fails
    return getFallbackQuestions(round, skills);
  } catch (error) {
    console.error('Question generation error:', error);
    return getFallbackQuestions(round, skills);
  }
};

export const generateAllInterviewQuestions = async (
  field: string,
  skills: string[],
  userId?: string
): Promise<Record<'aptitude' | 'technical' | 'managerial' | 'hr', string[]>> => {
  const fallback = {
    aptitude: getFallbackQuestions('aptitude', skills),
    technical: getFallbackQuestions('technical', skills),
    managerial: getFallbackQuestions('managerial', skills),
    hr: getFallbackQuestions('hr', skills),
  } as const;

  try {
    const model = genAI.getGenerativeModel({
      model: INTERVIEW_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const uniqueSeed = Date.now() + Math.random().toString(36).substring(7);

    let allPreviousQuestions: string[] = [...sessionAskedQuestions];
    if (userId) {
      try {
        const dbQuestionsText = await getPreviousQuestionsPromptText(userId);
        if (dbQuestionsText) {
          const dbQuestions = dbQuestionsText
            .split('\n')
            .map((line) => line.replace(/^\d+\.\s*/, '').trim())
            .filter((q) => q.length > 0);
          allPreviousQuestions = [...new Set([...allPreviousQuestions, ...dbQuestions])];
        }
      } catch (err) {
        console.warn('Could not load previous questions from DB:', err);
      }
    }

    const previousQuestionsText = allPreviousQuestions.length > 0
      ? `\n\n⚠️ PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT):\n${allPreviousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const prompt = INTERVIEWER_ALL_QUESTIONS_PROMPT(uniqueSeed, field, skills, previousQuestionsText);
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

    const normalizeRound = (round: unknown, fb: string[]) => {
      if (!Array.isArray(round)) return fb;
      const items = round.map((q) => String(q).trim()).filter(Boolean);
      return items.length >= 3 ? items.slice(0, 3) : fb;
    };

    const questions = {
      aptitude: normalizeRound(parsed.aptitude, fallback.aptitude),
      technical: normalizeRound(parsed.technical, fallback.technical),
      managerial: normalizeRound(parsed.managerial, fallback.managerial),
      hr: normalizeRound(parsed.hr, fallback.hr),
    };

    addSessionQuestions([
      ...questions.aptitude,
      ...questions.technical,
      ...questions.managerial,
      ...questions.hr,
    ]);

    return questions;
  } catch (error) {
    console.error('All-question generation error:', error);
    return fallback;
  }
};

export const scoreAnswerLocally = (answer: string): { feedback: string; score: number } => {
  const trimmed = answer.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const hasExamples = /example|instance|when|time|situation|project|worked|built|created|developed/i.test(trimmed);
  const hasNumbers = /\d+/.test(trimmed);
  const hasStructure = /[.,;:]/.test(trimmed);

  let score = 50;
  if (wordCount > 60) score += 15;
  else if (wordCount > 35) score += 10;
  else if (wordCount > 18) score += 6;
  else if (wordCount > 8) score += 3;
  if (hasExamples) score += 12;
  if (hasNumbers) score += 6;
  if (hasStructure) score += 6;

  score = Math.min(95, Math.max(40, score));

  let feedback = "Thanks for your answer. Let's continue.";
  if (score >= 80) feedback = "Strong answer with good depth and clarity. Great work.";
  else if (score >= 65) feedback = "Good answer. Add a concrete example for even better impact.";
  else if (score >= 50) feedback = "Decent start. Try to be more specific and structured.";
  else feedback = "Try to answer with more detail and one clear real-world example.";

  return { feedback, score };
};

// Fallback questions if Gemini API fails
const getFallbackQuestions = (round: string, skills: string[]): string[] => {
  const fallbacks: Record<string, string[]> = {
    aptitude: [
      "If you have 5 machines that can make 5 widgets in 5 minutes, how long would it take 100 machines to make 100 widgets?",
      "A project requires 4 developers working 6 hours each. How many hours would 3 developers need to complete the same project?",
      "What comes next in the pattern: 1, 4, 9, 16, 25, ?",
    ],
    technical: [
      `Explain a complex project you built using ${skills[0] || 'your primary skill'}. What challenges did you face?`,
      `How would you optimize a slow-performing application? Walk me through your debugging process.`,
      `Describe the architecture you would design for a scalable ${skills[1] || 'web'} application.`,
    ],
    managerial: [
      "Describe a time when you had to deliver bad news to your team or stakeholders. How did you handle it?",
      "Tell me about a situation where you had to make a difficult decision with incomplete information.",
      "How do you prioritize tasks when everything seems urgent and important?",
    ],
    hr: [
      "What motivates you to do your best work? Give me a specific example.",
      "Where do you see yourself professionally in the next 5 years?",
      "Describe a situation where you had to work with someone you didn't get along with. How did you handle it?",
    ],
  };
  return fallbacks[round] || fallbacks.aptitude;
};

/**
 * Get AI response for the interview - evaluates user's answer
 */
export const getInterviewResponse = async (
  userAnswer: string,
  currentQuestion: string,
  round: string,
  questionIndex: number,
  totalQuestions: number,
  resumeContext?: string
): Promise<{ feedback: string; score: number }> => {
  try {
    const model = genAI.getGenerativeModel({ model: INTERVIEW_MODEL });

    const prompt = INTERVIEWER_ANSWER_EVALUATION_PROMPT(round, currentQuestion, userAnswer, resumeContext);

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Try multiple parsing strategies
    let score = 0;
    let feedback = "";

    // Strategy 1: Direct JSON parse
    try {
      const parsed = JSON.parse(response);
      score = parseInt(parsed.score) || 0;
      feedback = parsed.feedback || "";
    } catch {
      // Strategy 2: Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*?"feedback"[\s\S]*?"score"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          score = parseInt(parsed.score) || 0;
          feedback = parsed.feedback || "";
        } catch { /* continue to next strategy */ }
      }

      // Strategy 3: Extract score with regex
      if (!score) {
        const scoreMatch = response.match(/"score"\s*:\s*(\d+)/);
        if (scoreMatch) {
          score = parseInt(scoreMatch[1]);
        }
      }

      // Strategy 4: Extract feedback with regex
      if (!feedback) {
        const feedbackMatch = response.match(/"feedback"\s*:\s*"([^"]+)"/);
        if (feedbackMatch) {
          feedback = feedbackMatch[1];
        }
      }
    }

    // If we got a valid score from Gemini, use it
    if (score >= 40 && score <= 98) {
      console.log(`✅ Gemini Score: ${score}%, Feedback: ${feedback.substring(0, 50)}...`);
      return {
        feedback: feedback || "Good answer! Let's continue.",
        score
      };
    }

    // Fallback: Calculate score based on answer characteristics
    const answerLength = userAnswer.trim().length;
    const wordCount = userAnswer.trim().split(/\s+/).length;
    const hasExamples = /example|instance|when|time|situation|project|worked|built|created|developed/i.test(userAnswer);
    const hasNumbers = /\d+/.test(userAnswer);
    const hasStructure = userAnswer.includes(',') || userAnswer.includes('.');

    let fallbackScore = 55; // Base score
    if (wordCount > 50) fallbackScore += 15;
    else if (wordCount > 25) fallbackScore += 10;
    else if (wordCount > 10) fallbackScore += 5;
    if (hasExamples) fallbackScore += 10;
    if (hasNumbers) fallbackScore += 5;
    if (hasStructure) fallbackScore += 5;

    // Add some randomness for variety
    fallbackScore += Math.floor(Math.random() * 10) - 5;
    fallbackScore = Math.min(92, Math.max(45, fallbackScore));

    console.log(`⚠️ Using fallback score: ${fallbackScore}% (Gemini response: ${response.substring(0, 100)}...)`);

    return {
      feedback: feedback || "Good effort! Try to provide more specific examples in your answers.",
      score: fallbackScore
    };
  } catch (error) {
    console.error('Gemini response error:', error);
    // Even on error, provide varied score
    const baseScore = 55 + Math.floor(Math.random() * 20);
    return { feedback: "Good answer! Let's continue.", score: baseScore };
  }
};

/**
 * Generate comprehensive final interview feedback using Gemini
 */
export const generateFinalFeedback = async (
  answers: { question: string; answer: string; round: string; score: number }[],
  resumeScore: number,
  resumeFeedback?: string
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: INTERVIEW_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    }); // LINE 340 - GEMINI MODEL

    const answersText = answers
      .map((a, i) => `Q${i + 1} (${a.round.toUpperCase()}): ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score}/100`)
      .join('\n\n');

    const avgScore = answers.length > 0
      ? answers.reduce((sum, a) => sum + a.score, 0) / answers.length
      : 0;

    const roundBreakdown = ['aptitude', 'technical', 'managerial', 'hr'].map(round => {
      const roundAnswers = answers.filter(a => a.round === round);
      const roundAvg = roundAnswers.length > 0
        ? roundAnswers.reduce((sum, a) => sum + a.score, 0) / roundAnswers.length
        : 0;
      return `${round.toUpperCase()}: ${Math.round(roundAvg)}%`;
    }).join(', ');

    const prompt = INTERVIEWER_FINAL_FEEDBACK_PROMPT(resumeScore, avgScore, roundBreakdown, answersText, resumeFeedback);

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return ["Good effort! Keep practicing to improve your interview skills."];
  } catch (error) {
    console.error('Final feedback error:', error);
    return ["Good effort! Keep practicing to improve your interview skills."];
  }
};

// Re-export interview history functions for use in components
export { saveInterviewHistory } from './interviewHistoryService';

export default {
  speakText,
  stopSpeaking,
  isSpeaking,
  startListening,
  stopListening,
  analyzeResumeFromPDF,
  scoreAnswerLocally,
  generateAllInterviewQuestions,
  evaluateResume,
  generateInterviewQuestions,
  getInterviewResponse,
  generateFinalFeedback,
  clearSessionQuestions,
  addSessionQuestions,
};
