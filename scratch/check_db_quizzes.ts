
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('--- Database Check ---');
  
  // 1. Check quizzes table
  console.log('\nChecking "quizzes" table...');
  const { data: quizzes, error: quizError } = await supabase.from('quizzes').select('*');
  if (quizError) {
    console.error('Error fetching quizzes:', quizError);
  } else {
    console.log(`Found ${quizzes?.length || 0} quizzes.`);
    if (quizzes && quizzes.length > 0) {
      console.log('Sample quiz columns:', Object.keys(quizzes[0]));
      console.log('First quiz:', quizzes[0]);
    }
  }

  // 2. Check quiz_questions table
  console.log('\nChecking "quiz_questions" table...');
  const { data: questions, error: questionError } = await supabase.from('quiz_questions').select('*');
  if (questionError) {
    console.error('Error fetching questions:', questionError);
  } else {
    console.log(`Found ${questions?.length || 0} questions.`);
    if (questions && questions.length > 0) {
      console.log('Sample question columns:', Object.keys(questions[0]));
    }
  }

  // 3. Check if they are linked
  if (quizzes && quizzes.length > 0 && questions && questions.length > 0) {
    const linked = questions.filter(q => quizzes.some(qz => qz.id === q.quiz_id));
    console.log(`\nLinked questions: ${linked.length} out of ${questions.length}`);
  }
}

checkDatabase();
