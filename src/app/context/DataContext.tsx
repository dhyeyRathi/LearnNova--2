import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';

// Fallback badges (used if DB table is empty or fails)
const FALLBACK_BADGES = [
  { level: 'Newbie', minPoints: 0, maxPoints: 19, color: 'bg-purple-300', icon: '🌱' },
  { level: 'Explorer', minPoints: 20, maxPoints: 39, color: 'bg-purple-400', icon: '🧭' },
  { level: 'Achiever', minPoints: 40, maxPoints: 59, color: 'bg-purple-500', icon: '🏅' },
  { level: 'Specialist', minPoints: 60, maxPoints: 79, color: 'bg-purple-600', icon: '⚡' },
  { level: 'Expert', minPoints: 80, maxPoints: 99, color: 'bg-purple-600', icon: '🔥' },
  { level: 'Master', minPoints: 100, maxPoints: 119, color: 'bg-purple-700', icon: '💎' },
  { level: 'Grandmaster', minPoints: 120, maxPoints: Infinity, color: 'bg-purple-700', icon: '👑' }
];

interface Badge {
  level: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
}

interface DataContextType {
  users: any[];
  courses: any[];
  lessons: any[];
  quizzes: any[];
  userProgress: any[];
  reviews: any[];
  blogs: any[];
  enrollments: any[];
  tutorApplications: any[];
  courseInvitations: any[];
  certificates: any[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getBadgeLevel: (points: number) => Badge;
  badges: Badge[];
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState({
    users: [] as any[],
    courses: [] as any[],
    lessons: [] as any[],
    quizzes: [] as any[],
    userProgress: [] as any[],
    reviews: [] as any[],
    blogs: [] as any[],
    enrollments: [] as any[],
    tutorApplications: [] as any[],
    courseInvitations: [] as any[],
    certificates: [] as any[],
  });
  const [badges, setBadges] = useState<Badge[]>(FALLBACK_BADGES);
  const [isLoading, setIsLoading] = useState(true);

  const getBadgeLevel = (points: number): Badge => {
    return badges.find(badge => points >= badge.minPoints && points <= badge.maxPoints) || badges[0];
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      const [
        { data: users },
        { data: courses },
        { data: lessons },
        quizzesResult,
        { data: userProgress },
        { data: reviews },
        { data: blogs },
        { data: enrollments },
        { data: tutorApplications },
        { data: badgesData },
        { data: certificates },
      ] = await Promise.all([
        supabase.from('users').select('*').catch((e) => { console.error('Users error', e); return { data: [] }; }),
        supabase.from('courses').select('*').catch((e) => { console.error('Courses error', e); return { data: [] }; }),
        supabase.from('lessons').select('*').catch((e) => { console.error('Lessons error', e); return { data: [] }; }),
        supabase.from('quizzes').select('*, quiz_questions(*)').catch((e) => { 
          console.error('Quizzes error:', e); 
          return { data: [], error: e }; 
        }),
        supabase.from('user_progress').select('*').catch(() => ({ data: [] })),
        supabase.from('course_reviews').select('*').catch(() => ({ data: [] })),
        supabase.from('blogs').select('*').catch(() => ({ data: [] })),
        supabase.from('course_enrollments').select('*').catch(() => ({ data: [] })),
        supabase.from('tutor_applications').select('*').catch(() => ({ data: [] })),
        supabase.from('badges').select('*').order('min_points', { ascending: true }).catch(() => ({ data: [] })),
        supabase.from('certificates').select('*, courses(title, instructor_name)').catch(() => ({ data: [] })),
      ]);
      
      if (quizzesResult.error) {
        console.error('❌ Quiz fetch error details:', quizzesResult.error);
      }
      
      let quizzes = quizzesResult.data || [];
      
      // If quiz_questions weren't included, fetch them separately
      if (quizzes.length > 0 && (!quizzes[0].quiz_questions || quizzes[0].quiz_questions.length === 0)) {
        console.log('⚠️  quiz_questions not populated in JOIN, fetching separately...');
        const { data: allQuestions } = await supabase.from('quiz_questions').select('*').catch(() => ({ data: [] }));
        
        // Map questions to each quiz
        quizzes = quizzes.map(q => ({
          ...q,
          quiz_questions: (allQuestions || []).filter(qq => qq.quiz_id === q.id)
        }));
        
        console.log('✅ Quizzes with separately fetched questions:', quizzes.map(q => ({ id: q.id, questions: q.quiz_questions?.length })));
      }

      console.log('📊 DataContext loaded:', {
        users: users?.length,
        courses: courses?.length,
        lessons: lessons?.length,
        quizzes: quizzes?.length,
        userProgress: userProgress?.length,
        reviews: reviews?.length,
        blogs: blogs?.length,
        enrollments: enrollments?.length,
        tutorApplications: tutorApplications?.length,
        certificates: certificates?.length,
      });
      
      // Log first quiz structure
      if (quizzes && quizzes.length > 0) {
        console.log('🎯 First quiz structure:', JSON.stringify(quizzes[0], null, 2));
      }

      // Use DB badges if available, otherwise fallback
      if (badgesData && badgesData.length > 0) {
        const mapped: Badge[] = badgesData.map((b: any, i: number) => ({
          level: b.name,
          minPoints: b.min_points,
          maxPoints: badgesData[i + 1]?.min_points ? badgesData[i + 1].min_points - 1 : Infinity,
          color: b.color || 'bg-purple-500',
          icon: b.icon_url || '🏅',
        }));
        setBadges(mapped);
      }

      setData({
        users: users || [],
        courses: (courses || []).map(c => ({...c, instructorId: c.instructor_id, coverImage: c.cover_image, accessRule: c.access_rule})),
        lessons: (lessons || []).map(l => ({...l, courseId: l.course_id})),
        quizzes: (quizzes || []).map(q => {
          console.log('📝 Quiz raw data:', { id: q.id, title: q.title, courseId: q.course_id, published: q.published, questionsCount: q.quiz_questions?.length });
          return {
            id: q.id, 
            title: q.title, 
            courseId: q.course_id,
            published: q.published || false,
            description: q.description || '',
            questions: (q.quiz_questions || []).map((qq: any) => ({
              id: qq.id, 
              text: qq.question_text, 
              options: qq.options, 
              correctAnswer: qq.correct_option_index, 
              basePoints: qq.points, 
              pointsPerAttempt: qq.points
            }))
          };
        }),
        userProgress: (userProgress || []).map(p => ({
          userId: p.user_id, courseId: p.course_id, completedLessons: p.completed_lessons || [], timeSpent: p.time_spent_minutes || 0
        })),
        reviews: reviews || [],
        blogs: blogs || [],
        enrollments: (enrollments || []).map(e => ({
          userId: e.user_id, courseId: e.course_id, completed: e.is_completed
        })),
        tutorApplications: tutorApplications || [],
        courseInvitations: [],
        certificates: certificates || [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, isLoading, refreshData, getBadgeLevel, badges }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
