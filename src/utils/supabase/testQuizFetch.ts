import { supabase } from './client';

export async function testQuizFetch() {
  console.log('🧪 Starting quiz fetch test...');
  
  try {
    // Test 1: Simple fetch without relations
    console.log('📌 Test 1: Fetching quizzes (simple)...');
    const { data: simpleQuizzes, error: simpleError } = await supabase
      .from('quizzes')
      .select('*');
    
    if (simpleError) {
      console.error('❌ Simple fetch failed:', simpleError);
    } else {
      console.log('✅ Simple fetch success:', simpleQuizzes?.length, 'quizzes');
      if (simpleQuizzes && simpleQuizzes.length > 0) {
        console.log('   First quiz:', simpleQuizzes[0]);
      }
    }
    
    // Test 2: With quiz_questions relation
    console.log('📌 Test 2: Fetching quizzes with quiz_questions...');
    const { data: relatedQuizzes, error: relatedError } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)');
    
    if (relatedError) {
      console.error('❌ Related fetch failed:', relatedError);
    } else {
      console.log('✅ Related fetch success:', relatedQuizzes?.length, 'quizzes');
      if (relatedQuizzes && relatedQuizzes.length > 0) {
        console.log('   First quiz:', relatedQuizzes[0]);
      }
    }
    
    // Test 3: Fetch quiz_questions directly
    console.log('📌 Test 3: Fetching quiz_questions directly...');
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*');
    
    if (questionsError) {
      console.error('❌ Questions fetch failed:', questionsError);
    } else {
      console.log('✅ Questions fetch success:', questions?.length, 'questions');
    }
    
    // Test 4: Check RLS policies
    console.log('📌 Test 4: Checking if you can delete (RLS test)...');
    const { data: userData } = await supabase.auth.getUser();
    console.log('   Current user:', userData.user?.email);
    
    return {
      simpleQuizzes: simpleQuizzes?.length || 0,
      relatedQuizzes: relatedQuizzes?.length || 0,
      questions: questions?.length || 0
    };
  } catch (err) {
    console.error('🚨 Test failed with exception:', err);
    return null;
  }
}

// Export for manual testing - don't auto-run
