/**
 * Interview History Service
 *
 * Stores interview questions and answers by user in Supabase.
 * Ensures the AI Interviewer NEVER repeats questions.
 *
 * 🔄 ROLLING WINDOW: Keeps only the last 5 interviews per user.
 * When a 6th interview is completed, the oldest interview is automatically deleted.
 * This prevents token overflow in AI prompts while maintaining question uniqueness.
 *
 * Table: interview_history
 *   - user_id (UUID, FK → users, UNIQUE)
 *   - interview_data (TEXT) — JSON array of interview sessions
 *   - updated_at (TIMESTAMP)
 *
 * Data Structure (per user):
 *   [
 *     {
 *       sessionId: "interview-123456789-abc",
 *       timestamp: "2026-03-24T10:30:00.000Z",
 *       entries: [
 *         { question: "...", answer: "...", round: "aptitude", score: 85, ... },
 *         ...
 *       ]
 *     },
 *     ... (up to 5 most recent sessions)
 *   ]
 */

import { supabase } from './supabase/client';

// ------------------------------------------------------------------
// TABLE CREATION (run once — guarded by IF NOT EXISTS)
// ------------------------------------------------------------------

/**
 * Ensures the `interview_history` table exists in Supabase.
 * Safe to call repeatedly — uses IF NOT EXISTS.
 */
export async function ensureInterviewHistoryTable(): Promise<void> {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS interview_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          interview_data TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_interview_history_user_id ON interview_history(user_id);
      `,
    });

    if (error) {
      // If RPC doesn't exist, fall back — table might already be created via migration
      console.warn('⚠️ Could not auto-create interview_history table via RPC:', error.message);
      console.log('💡 If the table does not exist, run the SQL migration manually in Supabase SQL Editor.');
    } else {
      console.log('✅ interview_history table ensured');
    }
  } catch (err) {
    console.warn('⚠️ interview_history table check skipped:', err);
  }
}

// ------------------------------------------------------------------
// DATA TYPES
// ------------------------------------------------------------------

export interface InterviewHistoryEntry {
  question: string;
  answer: string;
  round: string;
  score: number;
  field?: string;
  subField?: string;
  timestamp: string;
}

// Interview session - represents one complete interview with all Q&A pairs
interface InterviewSession {
  sessionId: string; // Unique ID for this interview session
  timestamp: string; // When this interview was completed
  entries: InterviewHistoryEntry[]; // All Q&A pairs from this interview
}

// Max number of interviews to keep (rolling window)
const MAX_INTERVIEWS_TO_KEEP = 5;

// ------------------------------------------------------------------
// LOAD — fetch the user's full interview history string
// ------------------------------------------------------------------

/**
 * Load the raw interview_data string for a given user.
 * Returns empty string if no history exists yet.
 */
export async function loadInterviewHistory(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('interview_history')
      .select('interview_data')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found → no history yet
        return '';
      }
      // Table might not exist yet — log and return empty
      console.warn('⚠️ Could not load interview history:', error.message);
      return '';
    }

    return data?.interview_data || '';
  } catch (err) {
    console.warn('⚠️ loadInterviewHistory error:', err);
    return '';
  }
}

// ------------------------------------------------------------------
// SAVE — upsert the user's interview history
// ------------------------------------------------------------------

/**
 * Append new Q&A entries to the user's interview history in Supabase.
 * The data is stored as a single TEXT blob (stringified sessions).
 *
 * 🔄 ROLLING WINDOW: Keeps only the last 5 interviews.
 * When a 6th interview is saved, the oldest interview is automatically deleted.
 * This prevents token overflow in AI prompts.
 */
export async function saveInterviewHistory(
  userId: string,
  newEntries: InterviewHistoryEntry[]
): Promise<void> {
  try {
    if (!userId || newEntries.length === 0) return;

    // Load existing data
    const existingData = await loadInterviewHistory(userId);

    // Parse existing sessions (if any)
    let allSessions: InterviewSession[] = [];
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);

        // Handle migration from old flat array format to session format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if ('sessionId' in parsed[0]) {
            // New format: array of sessions
            allSessions = parsed as InterviewSession[];
          } else {
            // Old format: flat array of entries
            // Convert to single session for backward compatibility
            allSessions = [{
              sessionId: `migration-${Date.now()}`,
              timestamp: new Date().toISOString(),
              entries: parsed as InterviewHistoryEntry[]
            }];
          }
        }
      } catch {
        // If existing data isn't valid JSON, start fresh
        allSessions = [];
      }
    }

    // Create new session with unique ID and timestamp
    const newSession: InterviewSession = {
      sessionId: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      entries: newEntries
    };

    // Add new session
    allSessions.push(newSession);

    // 🎯 ROLLING WINDOW LOGIC: Keep only the last 5 interviews
    // Sort by timestamp (oldest first) and remove excess
    allSessions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (allSessions.length > MAX_INTERVIEWS_TO_KEEP) {
      const removedCount = allSessions.length - MAX_INTERVIEWS_TO_KEEP;
      const removedSessions = allSessions.splice(0, removedCount);
      console.log(`🗑️ Removed ${removedCount} oldest interview(s) to maintain rolling window of ${MAX_INTERVIEWS_TO_KEEP}`);
      console.log(`🗑️ Deleted sessions: ${removedSessions.map(s => s.sessionId).join(', ')}`);
    }

    // Stringify everything as a single TEXT value
    const updatedData = JSON.stringify(allSessions);

    // Upsert (insert or update)
    const { error } = await supabase
      .from('interview_history')
      .upsert(
        {
          user_id: userId,
          interview_data: updatedData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('❌ Failed to save interview history:', error.message);
    } else {
      const totalQuestions = allSessions.reduce((sum, s) => sum + s.entries.length, 0);
      console.log(`✅ Interview history saved: ${newEntries.length} new questions (${allSessions.length} sessions, ${totalQuestions} total questions)`);
    }
  } catch (err) {
    console.error('❌ saveInterviewHistory error:', err);
  }
}

// ------------------------------------------------------------------
// EXTRACT — get just the previously asked questions as a string list
// ------------------------------------------------------------------

/**
 * Returns a flat list of all previously asked questions for a user.
 * Used to pass into the Gemini prompt so it never generates duplicates.
 * Works with both old flat array format and new session format.
 */
export async function getPreviouslyAskedQuestions(userId: string): Promise<string[]> {
  try {
    const raw = await loadInterviewHistory(userId);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Check if it's the new session format or old flat array format
    if (parsed.length > 0 && 'sessionId' in parsed[0]) {
      // New format: array of sessions
      const sessions = parsed as InterviewSession[];
      const allQuestions: string[] = [];

      for (const session of sessions) {
        const questions = session.entries.map((e) => e.question).filter(Boolean);
        allQuestions.push(...questions);
      }

      return allQuestions;
    } else {
      // Old format: flat array of entries (for backward compatibility)
      const entries = parsed as InterviewHistoryEntry[];
      return entries.map((e) => e.question).filter(Boolean);
    }
  } catch {
    return [];
  }
}

/**
 * Returns all previously asked questions formatted as a prompt-ready string.
 * Example output:
 *   "1. What is a closure?\n2. Explain event loop.\n..."
 */
export async function getPreviousQuestionsPromptText(userId: string): Promise<string> {
  const questions = await getPreviouslyAskedQuestions(userId);
  if (questions.length === 0) return '';

  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
}
