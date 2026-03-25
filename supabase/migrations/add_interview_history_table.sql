-- ============================================================================
-- INTERVIEW_HISTORY TABLE
-- Stores AI interviewer history per learner (one row per user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interview_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_data TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_interview_history_user_id ON interview_history(user_id);

DROP TRIGGER IF EXISTS update_interview_history_updated_at ON interview_history;
CREATE TRIGGER update_interview_history_updated_at
BEFORE UPDATE ON interview_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
