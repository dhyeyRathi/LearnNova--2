import { GoogleGenerativeAI } from '@google/generative-ai';
import { ASSISTANT_SYSTEM_PROMPT } from './prompts';

// Check if API key exists
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.error('❌ CRITICAL: VITE_GEMINI_API_KEY is not set in .env.local');
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'dummy-key');
console.log('✅ Gemini Service initialized');

// System prompt imported from prompts.ts (AI Assistant category)
const SYSTEM_PROMPT = ASSISTANT_SYSTEM_PROMPT;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: Array<{role: string; parts: Array<{text: string}>}> = [];

export async function initializeChat() {
  conversationHistory = [];
}

export async function getChatResponse(userMessage: string): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('❌ Gemini API key missing');
      return 'I need a Gemini API key to work. Please check your .env.local file.';
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Generate response
    const chat = model.startChat({
      history: conversationHistory,
    });

    let result;
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        result = await chat.sendMessage(userMessage);
        break;
      } catch (error: any) {
        if ((error?.message?.includes('503') || error?.status === 503) && attempt < maxRetries - 1) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.warn(`[503 Error] Retrying Gemini chat message (attempt ${attempt}/${maxRetries - 1}) in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    const assistantResponse = result!.response.text();

    // Add assistant response to history (Gemini uses 'model' not 'assistant')
    conversationHistory.push({
      role: 'model',
      parts: [{ text: assistantResponse }],
    });

    return assistantResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get response from AI assistant. Please try again.');
  }
}

export async function resetConversation() {
  conversationHistory = [];
}

export function getConversationHistory(): ChatMessage[] {
  return conversationHistory.map(msg => ({
    role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant',
    content: msg.parts[0].text || '',
  }));
}
