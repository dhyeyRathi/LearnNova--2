
export async function getQuizzes() {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)');

    if (error) throw error;
    
    // Map to the shape QuizzesPage expects
    return data.map((quiz: any) => ({
      id: quiz.id,
      title: quiz.title,
      courseId: quiz.course_id,
      questions: (quiz.quiz_questions || []).map((q: any) => ({
        id: q.id,
        text: q.question_text,
        options: q.options || [],
        correctAnswer: q.correct_option_index,
        basePoints: q.points,
        pointsPerAttempt: q.points
      }))
    }));
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

export async function getLessons() {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*');

    if (error) throw error;
    
    return data.map((lesson: any) => ({
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      content: lesson.content || lesson.id // Some mock data used content as ID
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, pointsEarned: number) {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        points_earned: pointsEarned,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Also update user points
    const { data: userProfile } = await supabase.from('users').select('points').eq('id', userId).single();
    if (userProfile) {
      await supabase.from('users').update({ points: userProfile.points + pointsEarned }).eq('id', userId);
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
}
