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

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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
// Model: gemini-1.5-flash (Line 184, 231, 280, 340)
// For generating intelligent interview feedback
// ============================================

/**
 * Extract text from PDF file using Gemini AI
 * Converts PDF to base64 and uses Gemini's multimodal capabilities
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Read PDF as ArrayBuffer in-memory (file is never saved anywhere)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract raw text from PDF binary by finding text between BT/ET markers
    // and decoding readable strings from the binary data
    let rawText = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const fullText = decoder.decode(uint8Array);

    // Extract text from PDF content streams (between parentheses in Tj/TJ operators)
    const textMatches = fullText.match(/\(([^)]+)\)/g);
    if (textMatches) {
      rawText = textMatches
        .map(m => m.slice(1, -1)) // Remove parentheses
        .filter(t => t.length > 1 && /[a-zA-Z]/.test(t)) // Keep only meaningful text
        .join(' ');
    }

    // Also extract any readable ASCII strings from the binary
    if (rawText.length < 100) {
      const asciiStrings = fullText.match(/[\x20-\x7E]{4,}/g);
      if (asciiStrings) {
        rawText = asciiStrings
          .filter(s => /[a-zA-Z]{2,}/.test(s) && !s.startsWith('/') && !s.includes('obj') && !s.includes('stream'))
          .join(' ');
      }
    }

    // If we extracted some text, send it to Gemini for structured parsing
    // If not, fall back to sending the base64 PDF to Gemini
    if (rawText.length > 50) {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

      const prompt = `The following is raw text extracted from a resume PDF. Parse and structure it into a clean, readable resume format.
Extract: Name, Contact Info, Skills, Experience, Education, Projects, Certifications.
If some text looks garbled, try your best to interpret it.

Raw text:
${rawText.substring(0, 8000)}`;

      const result = await model.generateContent(prompt);
      return result.response.text() || rawText;
    }

    // Fallback: send base64 PDF to Gemini's multimodal API
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

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      `Extract ALL text from this resume PDF. Include: Name, Contact, Skills, Experience, Education, Projects, Certifications. Provide in structured readable format.`
    ]);

    return result.response.text() || 'Unable to extract text from PDF';
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw error;
  }
};

/**
 * Evaluate resume using Gemini AI
 * Returns a score (0-100) and extracted skills/experience
 */
export const evaluateResume = async (
  resumeText: string
): Promise<{ score: number; skills: string[]; experience: string; feedback: string }> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    }); // LINE 184 - GEMINI MODEL

    const prompt = `You are Nova, an expert resume evaluator. Analyze this resume and provide a detailed evaluation.

Resume Content:
${resumeText}

Evaluate based on:
1. Overall presentation and formatting (10 points)
2. Skills relevance and depth (25 points)
3. Experience quality and achievements (25 points)
4. Education and certifications (15 points)
5. Projects and portfolio (15 points)
6. Communication clarity (10 points)

Respond in this exact JSON format:
{
  "score": 75,
  "skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
  "experience": "3 years in software development with focus on web applications",
  "feedback": "Strong technical skills with good project experience. Consider adding more quantifiable achievements."
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 70)),
        skills: parsed.skills || ['General Skills'],
        experience: parsed.experience || 'Experience extracted from resume',
        feedback: parsed.feedback || 'Resume reviewed successfully.',
      };
    }

    return { score: 70, skills: ['General Skills'], experience: 'Not specified', feedback: 'Resume reviewed.' };
  } catch (error) {
    console.error('Resume evaluation error:', error);
    return { score: 70, skills: ['General Skills'], experience: 'Not specified', feedback: 'Unable to fully evaluate resume.' };
  }
};

/**
 * Generate unique interview questions using Gemini AI
 * Questions are tailored to the user's field and resume
 * Tracks session questions to prevent repetition
 */
export const generateInterviewQuestions = async (
  round: 'aptitude' | 'technical' | 'managerial' | 'hr',
  field: string,
  skills: string[],
  questionCount: number = 3
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    }); // LINE 231 - GEMINI MODEL

    const roundDescriptions: Record<string, string> = {
      aptitude: 'logical reasoning, mathematical aptitude, analytical thinking, and problem-solving abilities',
      technical: `technical expertise in ${skills.join(', ')} and ${field}-related concepts, system design, and coding knowledge`,
      managerial: 'leadership abilities, pressure handling, conflict resolution, project management, and team collaboration',
      hr: 'behavioral questions, cultural fit, career goals, motivation, and soft skills',
    };

    // Add randomization seed for unique questions each session
    const uniqueSeed = Date.now() + Math.random().toString(36).substring(7);

    // Build exclusion list from previously asked questions
    const previousQuestionsText = sessionAskedQuestions.length > 0
      ? `\n\nPREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT OR ASK SIMILAR):\n${sessionAskedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const prompt = `You are Nova, an expert interviewer. Generate ${questionCount} unique MODERATE-LEVEL interview questions for the ${round.toUpperCase()} round.

Session ID: ${uniqueSeed} (Use this to ensure unique questions each time)

Candidate's Field: ${field}
Candidate's Skills: ${skills.join(', ')}
Round Focus: ${roundDescriptions[round]}
${previousQuestionsText}

CRITICAL REQUIREMENTS:
- Questions must be MODERATE level - challenging but answerable in 1-2 minutes
- Keep questions CONCISE (2-3 sentences max)
- For aptitude: Intermediate logic puzzles, analytics, or math
- For technical: Practical scenarios or deeper concept questions ("How would you implement X?", "What are the trade-offs of Y?")
- For managerial: Situational judgment or team conflict resolution
- For HR: Behavioral questions requiring specific examples ("Tell me about...", "What do you...")
- Generate COMPLETELY NEW and UNIQUE questions each time
- NEVER repeat or rephrase any previously asked questions
- Each question should be clear and professional

Respond with ONLY a JSON array of ${questionCount} questions:
["Question 1?", "Question 2?", "Question 3?"]`;

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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    }); // LINE 280 - GEMINI MODEL

    const prompt = `You are Nova, an AI interview coach. Evaluate this interview answer thoroughly and provide valid JSON output.

Round: ${round.toUpperCase()}
Question: ${currentQuestion}
User's Answer: ${userAnswer}
${resumeContext ? `Resume Context: ${resumeContext}` : ''}

Evaluation Criteria:
- Relevance to the question (0-25 points)
- Depth and detail of response (0-25 points)
- Communication clarity (0-20 points)
- Examples and specificity (0-20 points)
- Overall impression (0-10 points)

Scoring Guidelines:
- Excellent (85-98): Comprehensive, detailed, specific examples, clear communication
- Good (70-84): Solid answer with some details, generally clear
- Average (55-69): Basic answer, lacks depth or clarity
- Below Average (40-54): Weak answer, off-topic, or very vague

Output the following JSON:
{
  "feedback": "Your specific feedback here mentioning what was good and what could improve",
  "score": 75
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    try {
      const parsed = JSON.parse(response);
      const score = Math.min(98, Math.max(40, parseInt(parsed.score) || 70));
      const feedback = parsed.feedback || "Good answer! Let's continue.";

      console.log(`✅ Score: ${score}%, Feedback: ${feedback.substring(0, 50)}...`);

      return { feedback, score };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', response, parseError);
      return { feedback: "Good answer! Let's continue.", score: 70 };
    }
  } catch (error) {
    console.error('Gemini response error:', error);
    return { feedback: "Good answer! Let's continue.", score: 70 };
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
      model: 'gemini-1.5-flash',
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

    const prompt = `You are Nova, an AI interview coach. Generate comprehensive, actionable final feedback for this interview.

Resume Score: ${resumeScore}%
${resumeFeedback ? `Resume Feedback: ${resumeFeedback}` : ''}
Average Interview Score: ${Math.round(avgScore)}%
Round Breakdown: ${roundBreakdown}

Interview Performance:
${answersText}

Analyze the performance and provide:
1. Overall assessment of interview performance
2. Specific strengths demonstrated
3. Areas that need improvement with actionable advice
4. Round-specific feedback for weaker areas
5. Next steps for improvement

Provide 5-7 specific, actionable feedback points. Be encouraging but honest.
Each point should be a complete sentence starting with an emoji.
Return as a JSON array of strings:
["🎯 Feedback point 1", "💡 Feedback point 2", ...]`;

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

export default {
  speakText,
  stopSpeaking,
  isSpeaking,
  startListening,
  stopListening,
  evaluateResume,
  generateInterviewQuestions,
  getInterviewResponse,
  generateFinalFeedback,
  clearSessionQuestions,
  addSessionQuestions,
};
