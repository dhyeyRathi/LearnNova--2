// Data types for the LMS platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'tutor' | 'admin';
  points: number;
  avatar?: string;
  verified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
  adminApplicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  phone?: string;
  bio?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  instructorId: string;
  instructorName: string;
  duration: string;
  views: number;
  tags: string[];
  published: boolean;
  visibility: 'everyone' | 'signed-in';
  accessRule: 'open' | 'invitation' | 'payment';
  price?: number; // Price in USD for payment courses
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'image' | 'quiz';
  content: string; // URL for video/document/image, quiz ID for quiz
  duration?: string;
  video_duration?: number;
  order: number;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'file' | 'link';
  url: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  published?: boolean;
  publishedAt?: string;
  studentIds?: string[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  basePoints: number;
  pointsPerAttempt: number;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  quizResults: QuizResult[];
  timeSpent: number; // in minutes
  lastAccessed: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  pointsEarned: number;
  attempts: number;
  completedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TutorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  message: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface VerificationDocument {
  type: 'id' | 'selfie' | 'certificate';
  url: string;
  uploadedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  authorId: string;
  authorName: string;
  published: boolean;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  readTime: string;
}



export const badges = [
  { level: 'Newbie', minPoints: 0, maxPoints: 19, color: 'bg-purple-300', icon: '🌱' },
  { level: 'Explorer', minPoints: 20, maxPoints: 39, color: 'bg-purple-400', icon: '🧭' },
  { level: 'Achiever', minPoints: 40, maxPoints: 59, color: 'bg-purple-500', icon: '🏅' },
  { level: 'Specialist', minPoints: 60, maxPoints: 79, color: 'bg-purple-600', icon: '⚡' },
  { level: 'Expert', minPoints: 80, maxPoints: 99, color: 'bg-purple-600', icon: '🔥' },
  { level: 'Master', minPoints: 100, maxPoints: 119, color: 'bg-purple-700', icon: '💎' },
  { level: 'Grandmaster', minPoints: 120, maxPoints: Infinity, color: 'bg-purple-700', icon: '👑' }
];

export const getBadgeLevel = (points: number) => {
  return badges.find(badge => points >= badge.minPoints && points <= badge.maxPoints) || badges[0];
};
