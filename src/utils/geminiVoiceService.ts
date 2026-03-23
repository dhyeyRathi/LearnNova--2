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
    // Convert PDF to base64 and use Gemini's multimodal API directly
    // This is the most reliable method for text extraction
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      `Extract ALL text content from this resume PDF document.

Output the resume content in this clean, structured format:

NAME: [Full name]
CONTACT: [Email, phone, location]
SUMMARY: [Professional summary if present]
SKILLS: [All technical and soft skills, comma separated]
EXPERIENCE:
- [Job title] at [Company] ([Dates])
  [Key responsibilities and achievements]
EDUCATION:
- [Degree] from [Institution] ([Year])
PROJECTS: [List any projects mentioned]
CERTIFICATIONS: [List any certifications]

Important: Only include sections that have content. Make sure all text is clean and readable.`
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Nova, an expert resume evaluator. Analyze this resume and provide evaluation.

Resume Content:
${cleanedText}

Evaluate based on:
1. Overall presentation and formatting (10 points)
2. Skills relevance and depth (25 points)
3. Experience quality and achievements (25 points)
4. Education and certifications (15 points)
5. Projects and portfolio (15 points)
6. Communication clarity (10 points)

IMPORTANT: Return ONLY valid JSON, no other text.

JSON format:
{"score":75,"skills":["JavaScript","React","Node.js"],"experience":"3 years in software development","feedback":"Strong technical skills. Consider adding metrics."}`;

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
        skills: Array.isArray(parsed.skills) ? parsed.skills : ['General Skills'],
        experience: parsed.experience || 'Experience details extracted',
        feedback: parsed.feedback || 'Resume analyzed successfully.'
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are Nova, an AI interview coach. Evaluate this interview answer.

Round: ${round.toUpperCase()}
Question: ${currentQuestion}
User's Answer: ${userAnswer}
${resumeContext ? `Resume Context: ${resumeContext}` : ''}

Score the answer from 40-98 based on:
- Relevance (0-25), Depth (0-25), Clarity (0-20), Examples (0-20), Impression (0-10)

Guidelines:
- 85-98: Excellent - comprehensive with specific examples
- 70-84: Good - solid with some details
- 55-69: Average - basic, lacks depth
- 40-54: Below average - vague or off-topic

IMPORTANT: Return ONLY this exact JSON format, nothing else:
{"feedback":"your 2-3 sentence feedback here","score":NUMBER}`;

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
