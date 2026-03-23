// Mock data for the LMS platform

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

// Mock Users
export const users: User[] = [
  {
    id: 'learner-1',
    email: 'learner@learnnova.com',
    name: 'Alex Johnson',
    role: 'learner',
    points: 85,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'tutor-1',
    email: 'tutor@learnnova.com',
    name: 'Sarah Williams',
    role: 'tutor',
    points: 0,
    verified: false,
    verificationStatus: 'unverified',
    adminApplicationStatus: 'none',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    phone: '',
    bio: ''
  },
  {
    id: 'admin-1',
    email: 'admin@learnnova.com',
    name: 'Michael Chen',
    role: 'admin',
    points: 0,
    verified: true,
    verificationStatus: 'approved',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'learner-2',
    email: 'emma@example.com',
    name: 'Emma Davis',
    role: 'learner',
    points: 120,
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150'
  },
  {
    id: 'learner-3',
    email: 'john@example.com',
    name: 'John Smith',
    role: 'learner',
    points: 45,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'tutor-2',
    email: 'james@learnnova.com',
    name: 'Dr. James Mitchell',
    role: 'tutor',
    points: 0,
    verified: true,
    verificationStatus: 'approved',
    adminApplicationStatus: 'none',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '',
    bio: 'Experienced instructor specializing in cloud technologies, AI, and blockchain'
  }
];

// Mock Courses
export const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Master React & TypeScript',
    description: 'Learn modern React development with TypeScript, hooks, and best practices. Build production-ready applications.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '12 hours',
    views: 1543,
    tags: ['React', 'TypeScript', 'Frontend'],
    published: true,
    visibility: 'everyone',
    accessRule: 'open',
    createdAt: '2026-01-15',
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: 'course-2',
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of user interface and experience design. Create beautiful, functional designs.',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '8 hours',
    views: 982,
    tags: ['Design', 'UI/UX', 'Figma'],
    published: true,
    visibility: 'everyone',
    accessRule: 'open',
    createdAt: '2026-02-01',
    rating: 4.9,
    reviewCount: 87
  },
  {
    id: 'course-3',
    title: 'Advanced Node.js Development',
    description: 'Build scalable backend applications with Node.js, Express, and modern database solutions.',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '15 hours',
    views: 756,
    tags: ['Node.js', 'Backend', 'API'],
    published: true,
    visibility: 'signed-in',
    accessRule: 'invitation',
    createdAt: '2026-02-10',
    rating: 4.7,
    reviewCount: 63
  },
  {
    id: 'course-4',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning with Python and popular libraries.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '20 hours',
    views: 1234,
    tags: ['Python', 'Data Science', 'ML'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 49.99,
    createdAt: '2026-01-20',
    rating: 4.6,
    reviewCount: 156
  },
  {
    id: 'course-5',
    title: 'Mobile App Development',
    description: 'Create cross-platform mobile apps with React Native. Deploy to iOS and Android.',
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '18 hours',
    views: 891,
    tags: ['React Native', 'Mobile', 'iOS', 'Android'],
    published: false,
    visibility: 'everyone',
    accessRule: 'open',
    createdAt: '2026-03-01',
    rating: 0,
    reviewCount: 0
  },
  {
    id: 'course-6',
    title: 'Web Development Advanced',
    description: 'Master advanced web development concepts including performance optimization, security best practices, and scalable architecture.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '22 hours',
    views: 2145,
    tags: ['Web Development', 'Advanced', 'Performance'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 39.99,
    createdAt: '2026-01-10',
    rating: 4.8,
    reviewCount: 189
  },
  {
    id: 'course-7',
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning with hands-on projects. Learn algorithms, model evaluation, and real-world applications using scikit-learn and TensorFlow.',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b841?w=800',
    instructorId: 'tutor-2',
    instructorName: 'Dr. James Mitchell',
    duration: '25 hours',
    views: 3421,
    tags: ['Machine Learning', 'Python', 'AI'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 59.99,
    createdAt: '2026-01-18',
    rating: 4.9,
    reviewCount: 267
  },
  {
    id: 'course-8',
    title: 'Cloud Computing with AWS',
    description: 'Complete AWS certification preparation course. Deploy and manage applications on Amazon Web Services with hands-on labs.',
    coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800',
    instructorId: 'tutor-2',
    instructorName: 'Dr. James Mitchell',
    duration: '28 hours',
    views: 2876,
    tags: ['AWS', 'Cloud', 'DevOps'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 69.99,
    createdAt: '2026-02-05',
    rating: 4.7,
    reviewCount: 234
  },
  {
    id: 'course-9',
    title: 'Full Stack JavaScript',
    description: 'Build complete web applications with JavaScript from frontend to backend. Includes MongoDB, Express, React, and Node.js (MERN stack).',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '30 hours',
    views: 3654,
    tags: ['JavaScript', 'MERN', 'Full Stack'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 49.99,
    createdAt: '2026-01-25',
    rating: 4.9,
    reviewCount: 312
  },
  {
    id: 'course-10',
    title: 'iOS Development with Swift',
    description: 'Create professional iOS applications using Swift, SwiftUI, and Core Data. Build production-ready apps for iPhone and iPad.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    instructorId: 'tutor-2',
    instructorName: 'Dr. James Mitchell',
    duration: '24 hours',
    views: 2143,
    tags: ['iOS', 'Swift', 'Mobile'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 79.99,
    createdAt: '2026-02-12',
    rating: 4.8,
    reviewCount: 198
  },
  {
    id: 'course-11',
    title: 'Blockchain Development',
    description: 'Learn blockchain technology and smart contract development. Build decentralized applications using Solidity and Ethereum.',
    coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '26 hours',
    views: 1876,
    tags: ['Blockchain', 'Web3', 'Solidity'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 99.99,
    createdAt: '2026-02-18',
    rating: 4.6,
    reviewCount: 143
  },
  {
    id: 'course-12',
    title: 'DevOps & CI/CD Pipelines',
    description: 'Master DevOps practices and continuous integration/deployment. Work with Docker, Jenkins, GitLab CI, and Kubernetes.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    instructorId: 'tutor-2',
    instructorName: 'Dr. James Mitchell',
    duration: '20 hours',
    views: 2534,
    tags: ['DevOps', 'CI/CD', 'Docker'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 44.99,
    createdAt: '2026-02-08',
    rating: 4.7,
    reviewCount: 176
  },
  {
    id: 'course-13',
    title: 'Cybersecurity Fundamentals',
    description: 'Essential cybersecurity concepts and practices. Learn about encryption, network security, and ethical hacking fundamentals.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '23 hours',
    views: 2456,
    tags: ['Cybersecurity', 'Security', 'Networking'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 54.99,
    createdAt: '2026-02-22',
    rating: 4.8,
    reviewCount: 201
  },
  {
    id: 'course-14',
    title: 'GraphQL API Development',
    description: 'Build modern APIs with GraphQL. Learn query language, mutations, subscriptions, and integration with Node.js and Apollo Server.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    instructorId: 'tutor-2',
    instructorName: 'Dr. James Mitchell',
    duration: '18 hours',
    views: 1654,
    tags: ['GraphQL', 'API', 'Backend'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 39.99,
    createdAt: '2026-02-28',
    rating: 4.6,
    reviewCount: 127
  },
  {
    id: 'course-15',
    title: 'Docker & Kubernetes Mastery',
    description: 'Complete containerization and orchestration course. Master Docker, build scalable applications, and deploy with Kubernetes in production.',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    instructorId: 'tutor-1',
    instructorName: 'Sarah Williams',
    duration: '27 hours',
    views: 2789,
    tags: ['Docker', 'Kubernetes', 'Containers'],
    published: true,
    visibility: 'everyone',
    accessRule: 'payment',
    price: 64.99,
    createdAt: '2026-03-02',
    rating: 4.9,
    reviewCount: 221
  }
];

// Mock Lessons
export const lessons: Lesson[] = [
  // Course 1 lessons
  {
    id: 'lesson-1-1',
    courseId: 'course-1',
    title: 'Introduction to React & TypeScript',
    description: 'Get started with React and TypeScript basics',
    type: 'video',
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '45 min',
    order: 1,
    resources: [
      { id: 'r1', title: 'React Docs', type: 'link', url: 'https://react.dev' },
      { id: 'r2', title: 'TypeScript Cheatsheet', type: 'file', url: '/resources/ts-cheatsheet.pdf' }
    ]
  },
  {
    id: 'lesson-1-2',
    courseId: 'course-1',
    title: 'Setting Up Your Development Environment',
    description: 'Install and configure tools for React development',
    type: 'video',
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '30 min',
    order: 2
  },
  {
    id: 'lesson-1-3',
    courseId: 'course-1',
    title: 'React Components Deep Dive',
    description: 'Learn about functional and class components',
    type: 'document',
    content: 'https://example.com/docs/components.pdf',
    duration: '60 min',
    order: 3
  },
  {
    id: 'lesson-1-4',
    courseId: 'course-1',
    title: 'Quiz: React Fundamentals',
    description: 'Test your knowledge of React basics',
    type: 'quiz',
    content: 'quiz-1',
    order: 4
  },
  {
    id: 'lesson-1-5',
    courseId: 'course-1',
    title: 'Hooks: useState & useEffect',
    description: 'Master the most common React hooks',
    type: 'video',
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '55 min',
    order: 5
  },
  // Course 2 lessons
  {
    id: 'lesson-2-1',
    courseId: 'course-2',
    title: 'Design Principles Overview',
    description: 'Understanding core design principles',
    type: 'video',
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '40 min',
    order: 1
  },
  {
    id: 'lesson-2-2',
    courseId: 'course-2',
    title: 'Color Theory in UI Design',
    description: 'Learn how to use colors effectively',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200',
    order: 2
  },
  {
    id: 'lesson-2-3',
    courseId: 'course-2',
    title: 'Typography Best Practices',
    description: 'Choose and pair fonts like a pro',
    type: 'video',
    content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '35 min',
    order: 3
  },
  {
    id: 'lesson-2-4',
    courseId: 'course-2',
    title: 'Quiz: Design Fundamentals',
    description: 'Test your design knowledge',
    type: 'quiz',
    content: 'quiz-2',
    order: 4
  }
];

// Mock Quizzes
export const quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'React Fundamentals Quiz',
    questions: [
      {
        id: 'q1-1',
        text: 'What is the virtual DOM in React?',
        options: [
          'A real DOM copy stored in memory',
          'A lightweight representation of the real DOM',
          'A database for storing component state',
          'A CSS framework'
        ],
        correctAnswer: 1,
        basePoints: 10,
        pointsPerAttempt: 3
      },
      {
        id: 'q1-2',
        text: 'Which hook is used for side effects in React?',
        options: [
          'useState',
          'useContext',
          'useEffect',
          'useReducer'
        ],
        correctAnswer: 2,
        basePoints: 10,
        pointsPerAttempt: 3
      },
      {
        id: 'q1-3',
        text: 'What does JSX stand for?',
        options: [
          'JavaScript XML',
          'Java Syntax Extension',
          'JavaScript Extra',
          'Java XML'
        ],
        correctAnswer: 0,
        basePoints: 10,
        pointsPerAttempt: 3
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'Design Fundamentals Quiz',
    questions: [
      {
        id: 'q2-1',
        text: 'What is the 60-30-10 rule in design?',
        options: [
          'A color distribution ratio',
          'A spacing measurement',
          'A font size guideline',
          'A margin specification'
        ],
        correctAnswer: 0,
        basePoints: 10,
        pointsPerAttempt: 3
      },
      {
        id: 'q2-2',
        text: 'Which principle describes visual hierarchy?',
        options: [
          'Balance',
          'Contrast',
          'Both contrast and size',
          'Unity'
        ],
        correctAnswer: 2,
        basePoints: 10,
        pointsPerAttempt: 3
      }
    ]
  }
];

// Mock User Progress
export const userProgress: UserProgress[] = [
  {
    userId: 'learner-1',
    courseId: 'course-1',
    completedLessons: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3'],
    quizResults: [
      {
        quizId: 'quiz-1',
        score: 2,
        pointsEarned: 17,
        attempts: 2,
        completedAt: '2026-03-15'
      }
    ],
    timeSpent: 145,
    lastAccessed: '2026-03-20'
  },
  {
    userId: 'learner-1',
    courseId: 'course-2',
    completedLessons: ['lesson-2-1', 'lesson-2-2', 'lesson-2-3', 'lesson-2-4'],
    quizResults: [
      {
        quizId: 'quiz-2',
        score: 2,
        pointsEarned: 20,
        attempts: 1,
        completedAt: '2026-03-18'
      }
    ],
    timeSpent: 95,
    lastAccessed: '2026-03-19'
  },
  {
    userId: 'learner-2',
    courseId: 'course-1',
    completedLessons: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3', 'lesson-1-4', 'lesson-1-5'],
    quizResults: [
      {
        quizId: 'quiz-1',
        score: 3,
        pointsEarned: 30,
        attempts: 1,
        completedAt: '2026-03-10'
      }
    ],
    timeSpent: 210,
    lastAccessed: '2026-03-21'
  }
];

// Mock Reviews
export const reviews: Review[] = [
  {
    id: 'rev-1',
    courseId: 'course-1',
    userId: 'learner-2',
    userName: 'Emma Davis',
    userAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    rating: 5,
    comment: 'Excellent course! The instructor explains complex concepts in a very clear way. Highly recommended for anyone learning React.',
    createdAt: '2026-03-10'
  },
  {
    id: 'rev-2',
    courseId: 'course-1',
    userId: 'learner-3',
    userName: 'John Smith',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4,
    comment: 'Great content overall. Would love to see more real-world project examples.',
    createdAt: '2026-03-12'
  },
  {
    id: 'rev-3',
    courseId: 'course-2',
    userId: 'learner-1',
    userName: 'Alex Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rating: 5,
    comment: 'This course transformed my design skills! The color theory section was particularly helpful.',
    createdAt: '2026-03-18'
  }
];

// Mock Blogs
export const blogs: Blog[] = [
  {
    id: 'blog-1',
    title: 'The Future of Online Learning: Trends to Watch in 2024',
    excerpt: 'Explore the emerging technologies and methodologies shaping the future of education.',
    content: 'Online learning has revolutionized the way we acquire knowledge. In 2024, we expect to see significant advancements in AI-powered personalized learning, increased adoption of microlearning formats, and greater emphasis on interactive content. Institutions are now focusing on creating more immersive and engaging learning experiences through virtual and augmented reality technologies. The rise of competency-based education is also creating new opportunities for learners to demonstrate their skills in practical ways.',
    featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=800',
    category: 'Education',
    authorId: 'tutor-1',
    authorName: 'Sarah Williams',
    published: true,
    views: 2450,
    likes: 342,
    comments: 45,
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
    readTime: '8 min'
  },
  {
    id: 'blog-2',
    title: 'How to Build Confidence as a New Tutor',
    excerpt: 'Practical tips for instructors starting their teaching journey.',
    content: 'Starting as a tutor can be intimidating, but with the right strategies, you can build confidence quickly. First, thoroughly prepare your materials and understand your content deeply. Second, practice your explanations before teaching to ensure clarity. Third, start with small groups or one-on-one sessions to gain experience. Remember that mistakes are learning opportunities, not failures. Engage with your students, be open to feedback, and continuously improve your teaching methods. Building a supportive community of fellow tutors can also help you grow and feel more confident in your role.',
    featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    category: 'Education',
    authorId: 'tutor-1',
    authorName: 'Sarah Williams',
    published: true,
    views: 1820,
    likes: 256,
    comments: 32,
    createdAt: '2026-02-20',
    updatedAt: '2026-02-20',
    readTime: '6 min'
  },
  {
    id: 'blog-3',
    title: 'Best Practices for Creating Engaging Course Content',
    excerpt: 'Strategies to keep your students motivated and interested throughout their courses.',
    content: 'Creating engaging course content is essential for student retention and satisfaction. Use a mix of media types including videos, interactive quizzes, and discussion forums. Break down complex topics into smaller, manageable chunks. Include real-world examples and case studies to make content relatable. Utilize storytelling techniques to make lessons memorable. Encourage active participation and provide regular feedback. Incorporate gamification elements like points and badges to keep students motivated. Finally, ensure your content is mobile-friendly and accessible to all learners, including those with disabilities.',
    featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    category: 'Education',
    authorId: 'tutor-1',
    authorName: 'Sarah Williams',
    published: true,
    views: 1550,
    likes: 198,
    comments: 28,
    createdAt: '2026-02-25',
    updatedAt: '2026-02-25',
    readTime: '7 min'
  }
];

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

// Enrollments tracking (separate from progress - tracks enrollment state)
export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: string;
  completed: boolean;
  completedAt?: string;
}

export const enrollments: Enrollment[] = [
  { userId: 'learner-1', courseId: 'course-1', enrolledAt: '2026-02-15', completed: false },
  { userId: 'learner-1', courseId: 'course-2', enrolledAt: '2026-02-20', completed: true, completedAt: '2026-03-19' },
  { userId: 'learner-2', courseId: 'course-1', enrolledAt: '2026-01-20', completed: true, completedAt: '2026-03-21' },
];

// Invited users for invitation-based courses
export const courseInvitations: { courseId: string; userId: string }[] = [
  { courseId: 'course-3', userId: 'learner-1' },
  { courseId: 'course-3', userId: 'learner-2' },
];

// Mock Tutor Applications
export const tutorApplications: TutorApplication[] = [
  {
    id: 'app-1',
    userId: 'tutor-2',
    userName: 'Jessica Martinez',
    userEmail: 'jessica@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    status: 'pending',
    submittedAt: '2026-03-18',
    message: 'I have 5 years of experience teaching web development and would love to join the LearnNova admin team to help shape the platform\'s educational vision.'
  },
  {
    id: 'app-2',
    userId: 'tutor-3',
    userName: 'David Kim',
    userEmail: 'david@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'pending',
    submittedAt: '2026-03-20',
    message: 'As an experienced educator with expertise in course design and student engagement, I believe I can contribute significantly to the admin team.'
  },
  {
    id: 'app-3',
    userId: 'tutor-4',
    userName: 'Linda Foster',
    userEmail: 'linda@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150',
    status: 'approved',
    submittedAt: '2026-03-10',
    message: 'I\'m passionate about online education and have successfully managed multiple learning platforms.',
    reviewedAt: '2026-03-12',
    reviewedBy: 'admin-1'
  }
];