import { z } from 'zod';
import { getCourse, getLessonsByCourse, getUserProgress, getUserEnrollments } from './supabase/client';

// Tool Schemas
export const CourseSummarySchema = z.object({
  course_id: z.string(),
  lesson_ids: z.array(z.string()).optional(),
});

export const QuizFeedbackSchema = z.object({
  quiz_id: z.string(),
  attempt_number: z.number(),
  answers: z.array(
    z.object({
      question: z.string(),
      selected: z.string(),
      correct: z.string(),
      is_correct: z.boolean(),
    })
  ),
});

export const LearnerProgressSchema = z.object({
  learner_id: z.string(),
});

export const RecommendLessonSchema = z.object({
  learner_id: z.string(),
  course_id: z.string(),
});

// Type definitions
export type CourseSummaryInput = z.infer<typeof CourseSummarySchema>;
export type QuizFeedbackInput = z.infer<typeof QuizFeedbackSchema>;
export type LearnerProgressInput = z.infer<typeof LearnerProgressSchema>;
export type RecommendLessonInput = z.infer<typeof RecommendLessonSchema>;

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Tool Implementations

export async function summarize_course(input: CourseSummaryInput): Promise<ToolResult> {
  try {
    const course = await getCourse(input.course_id);
    if (!course) {
      return { success: false, error: `Course ${input.course_id} not found` };
    }

    const courseLessons = await getLessonsByCourse(input.course_id) || [];
    let lessonsToSummarize = courseLessons;

    if (input.lesson_ids && input.lesson_ids.length > 0) {
      lessonsToSummarize = courseLessons.filter((l: any) => input.lesson_ids!.includes(l.id));
    }

    const summary = {
      course_title: course.title,
      course_description: course.description,
      lessons: lessonsToSummarize.map((l: any) => ({
        title: l.title,
        duration: l.duration || 0,
      })),
      tldr: `${course.title} covers ${course.description}. You'll learn through ${lessonsToSummarize.length} lessons.`,
      total_duration_minutes: lessonsToSummarize.reduce((sum: number, l: any) => sum + parseInt(l.duration || '0'), 0),
    };

    return { success: true, data: summary };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function give_quiz_feedback(input: QuizFeedbackInput): Promise<ToolResult> {
  try {
    const correctCount = input.answers.filter(a => a.is_correct).length;
    const totalCount = input.answers.length;
    const scorePercent = Math.round((correctCount / totalCount) * 100);

    const weakAreas: string[] = [];
    const feedback = input.answers.map((answer: any) => {
      if (!answer.is_correct) {
        weakAreas.push(answer.question.split('-')[0]?.trim() || 'General understanding');
      }
      return {
        question: answer.question,
        your_answer: answer.selected,
        correct_answer: answer.correct,
        is_correct: answer.is_correct,
        feedback: answer.is_correct
          ? "✅ Perfect! You nailed this one."
          : `❌ Not quite. The correct answer is "${answer.correct}". Remember this concept!`,
      };
    });

    const revisionTips = weakAreas.length > 0
      ? `Focus on revising: ${[...new Set(weakAreas)].join(', ')}`
      : "Excellent! You have mastered all topics in this quiz.";

    return {
      success: true,
      data: {
        score: scorePercent,
        points_earned: correctCount * 10,
        total_points: totalCount * 10,
        question_feedback: feedback,
        weak_areas: [...new Set(weakAreas)],
        revision_tips: revisionTips,
        encouragement: scorePercent >= 70
          ? "Great job! You are making excellent progress. 🎉"
          : "Keep practicing! Every quiz brings you closer to mastery. 💪",
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function getCurrentBadgeLevel(points: number): string {
  if (points < 100) return 'Newbie';
  if (points < 300) return 'Learner';
  if (points < 600) return 'Scholar';
  if (points < 1000) return 'Expert';
  return 'Master';
}

function getPointsForNextBadge(points: number): number {
  const thresholds = [100, 300, 600, 1000, 2000];
  for (const threshold of thresholds) {
    if (points < threshold) return threshold - points;
  }
  return 1000;
}

export async function get_learner_progress(input: LearnerProgressInput, currentUser?: any): Promise<ToolResult> {
  try {
    const userProgress = await getUserProgress(input.learner_id) || [];
    const totalLessonsCompleted = userProgress.reduce((sum, p) => sum + (p.completedLessons?.length || 0), 0);
    
    // Attempt to get user points if currentUser is passed, else default to 0
    const points = currentUser?.points || 0;

    const badges = ['Newbie', 'Learner', 'Scholar', 'Expert', 'Master'];
    const currentBadge = getCurrentBadgeLevel(points);
    const currentBadgeIndex = badges.indexOf(currentBadge);
    const nextBadge = currentBadgeIndex < badges.length - 1 ? badges[currentBadgeIndex + 1] : 'Grandmaster';

    return {
      success: true,
      data: {
        points_total: points,
        current_badge: currentBadge,
        lessons_completed: totalLessonsCompleted,
        points_needed_for_next_badge: getPointsForNextBadge(points),
        next_badge: nextBadge,
        progress_percentage: Math.min(((points % 100) / 100) * 100, 100),
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function recommend_next_lesson(input: RecommendLessonInput): Promise<ToolResult> {
  try {
    const course = await getCourse(input.course_id);
    if (!course) {
      return { success: false, error: `Course ${input.course_id} not found` };
    }

    const courseLessons = await getLessonsByCourse(input.course_id) || [];
    const userProgress = await getUserProgress(input.learner_id) || [];
    
    const courseProgress = userProgress.find(p => p.courseId === input.course_id);
    const completedLessonIds = courseProgress ? courseProgress.completedLessons : [];

    // Find first uncompleted lesson
    const nextLesson = courseLessons.find(l => !completedLessonIds.includes(l.id));

    if (!nextLesson) {
      return {
        success: true,
        data: {
          message: 'Congratulations! You have completed all lessons in this course.',
          recommendation: 'Consider reviewing challenging topics or moving to the next course.',
        },
      };
    }

    return {
      success: true,
      data: {
        recommended_lesson: {
          lesson_id: nextLesson.id,
          title: nextLesson.title,
          duration_minutes: nextLesson.duration || 0,
        },
        reason: `Based on your progress, you're ready for "${nextLesson.title}". This lesson builds on concepts you've already mastered!`,
        estimated_completion_time: `${nextLesson.duration || 0} minutes`,
        difficulty: 'Intermediate',
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Tool Registry
export const tools = [
  {
    name: 'summarize_course',
    description: 'Get a summary of a course with objectives, lessons, and key topics',
    schema: CourseSummarySchema,
  },
  {
    name: 'give_quiz_feedback',
    description: 'Analyze quiz answers and provide constructive feedback',
    schema: QuizFeedbackSchema,
  },
  {
    name: 'get_learner_progress',
    description: 'Retrieve learner stats, badges, and recent activity',
    schema: LearnerProgressSchema,
  },
  {
    name: 'recommend_next_lesson',
    description: 'Suggest the next best lesson based on learner progress',
    schema: RecommendLessonSchema,
  },
];
