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
// Force rebuild

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

  // Log data changes (optional, can be removed if strictly no logs wanted)
  useEffect(() => {
    // Silent
  }, [data]);

  const getBadgeLevel = (points: number): Badge => {
    return badges.find(badge => points >= badge.minPoints && points <= badge.maxPoints) || badges[0];
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      const { data: users, error: usersErr } = await supabase.from('users').select('*');
      if (usersErr) console.error('❌ Users fetch error:', usersErr);
      
      const { data: courses, error: coursesErr } = await supabase.from('courses').select('*');
      if (coursesErr) console.error('❌ Courses fetch error:', coursesErr);
      
      const { data: lessons, error: lessonsErr } = await supabase.from('lessons').select('*');
      if (lessonsErr) console.error('❌ Lessons fetch error:', lessonsErr);
      
      const { data: rawQuizzes, error: quizErr } = await supabase.from('quizzes').select('*, quiz_questions(*)');
      if (quizErr) console.error('❌ Quizzes fetch error:', quizErr);
      
      const [
        { data: userProgress },
        { data: reviews },
        { data: blogs },
        { data: enrollments },
        { data: tutorApplications },
        { data: badgesData },
        { data: certificates }
      ] = await Promise.all([
        supabase.from('user_progress').select('*'),
        supabase.from('course_reviews').select('*'),
        supabase.from('blogs').select('*'),
        supabase.from('course_enrollments').select('*'),
        supabase.from('tutor_applications').select('*'),
        supabase.from('badges').select('*').order('min_points', { ascending: true }),
        supabase.from('certificates').select('*, courses(title, instructor_name)')
      ]).catch(err => {
        console.error('❌ Error in bulk fetch:', err);
        return [
          { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }
        ];
      }) as any[];

      let finalQuizzes = rawQuizzes || [];
      
      const needsQuestions = finalQuizzes.some(q => !q.quiz_questions || q.quiz_questions.length === 0);
      if (needsQuestions || finalQuizzes.length === 0) {
        const { data: allQuestions } = await supabase.from('quiz_questions').select('*');
        if (allQuestions && allQuestions.length > 0) {
          finalQuizzes = finalQuizzes.map(q => ({
            ...q,
            quiz_questions: (allQuestions || []).filter(qq => qq.quiz_id === q.id)
          }));
        }
      }

      setData({
        users: users || [],
        courses: (courses || []).map(c => ({
          ...c, 
          instructorId: c.instructor_id, 
          coverImage: c.cover_image, 
          accessRule: c.access_rule
        })),
        lessons: (lessons || []).map(l => ({
          ...l, 
          courseId: l.course_id
        })),
        quizzes: finalQuizzes.map(q => ({
          id: q.id, 
          title: q.title, 
          courseId: q.course_id,
          published: q.is_published ?? q.published ?? false,
          description: q.description || '',
          questions: (q.quiz_questions || []).sort((a: any, b: any) => (a.sequence_number || 0) - (b.sequence_number || 0)).map((qq: any) => {
            let parsedOptions = [];
            try {
              const rawOptions = typeof qq.options === 'string' ? JSON.parse(qq.options) : qq.options;
              parsedOptions = Array.isArray(rawOptions) ? rawOptions : [];
            } catch (e) {
              parsedOptions = [];
            }
            
            return {
              id: qq.id, 
              text: qq.question_text, 
              options: parsedOptions, 
              correctAnswer: parseInt(qq.correct_answer) || 0, 
              basePoints: qq.points || 10, 
              pointsPerAttempt: qq.points || 10
            };
          })
        })),
        userProgress: (userProgress || []).map(p => ({
          userId: p.user_id, 
          courseId: p.course_id, 
          completedLessons: p.completed_lessons || [], 
          timeSpent: p.time_spent_minutes || 0
        })),
        reviews: reviews || [],
        blogs: (blogs || []).map(b => ({
          ...b,
          featuredImage: b.featured_image,
          authorId: b.author_id,
          authorName: b.author_name,
          commentsCount: b.comments_count || 0,
          readTime: b.read_time,
          createdAt: b.created_at,
          updatedAt: b.updated_at
        })),
        enrollments: (enrollments || []).map(e => ({
          userId: e.user_id, 
          courseId: e.course_id, 
          completed: e.is_completed
        })),
        tutorApplications: tutorApplications || [],
        courseInvitations: [],
        certificates: certificates || [],
      });

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

    } catch (err) {
      console.error("❌ ERROR in DataContext refreshData:", err);
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
