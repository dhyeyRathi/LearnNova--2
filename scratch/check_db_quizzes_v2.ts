
import { supabase } from '../src/utils/supabase/client';

async function checkDatabase() {
  console.log('--- Database Check ---');
  
  try {
    const { data: quizzes, error: quizError } = await supabase.from('quizzes').select('*');
    if (quizError) {
      console.error('Error fetching quizzes:', quizError);
    } else {
      console.log(`Found ${quizzes?.length || 0} quizzes.`);
      if (quizzes && quizzes.length \u003e 0) {
        console.log('Sample quiz columns:', Object.keys(quizzes[0]));
        console.log('First quiz is_published:', quizzes[0].is_published);
        console.log('First quiz published:', quizzes[0].published);
      }
    }

    const { data: questions, error: questionError } = await supabase.from('quiz_questions').select('*');
    if (questionError) {
      console.error('Error fetching questions:', questionError);
    } else {
      console.log(`Found ${questions?.length || 0} questions.`);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkDatabase();
