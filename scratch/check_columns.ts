
import { supabase } from '../src/utils/supabase/client';

async function checkColumns() {
  const { data, error } = await supabase.from('quiz_questions').select('*').limit(1);
  if (error) {
    console.error('Error fetching quiz_questions:', error);
  } else {
    console.log('Columns in quiz_questions:', Object.keys(data[0] || {}));
  }
}

checkColumns();
