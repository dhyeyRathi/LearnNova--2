
export async function getUserProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Map to mockData shape
    return data.map((p: any) => ({
      userId: p.user_id,
      courseId: p.course_id,
      completedLessons: p.completed_lessons || [],
      timeSpent: p.time_spent_minutes || 0,
      lastAccessed: p.last_accessed || p.created_at
    }));
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
}

export async function getUserCreatedCourses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', userId);

    if (error) throw error;
    return data as Course[];
  } catch (error) {
    console.error('Error fetching created courses:', error);
    throw error;
  }
}
