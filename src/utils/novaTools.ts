import { z } from 'zod';

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

// Mock Data Types
export interface Course {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  topics: string[];
}

export interface LearnerStats {
  learner_id: string;
  points_total: number;
  current_badge: string;
  lessons_completed: number;
  points_needed_for_next: number;
  quiz_history: QuizAttempt[];
}

export interface QuizAttempt {
  quiz_id: string;
  score: number;
  completed_at: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Mock Database
const mockCourses: Record<string, Course> = {
  'course-001': {
    id: 'course-001',
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    objectives: ['Understand JS syntax', 'Learn functions and scope', 'Master async programming'],
    lessons: [
      { id: 'lesson-001', title: 'Variables & Types', duration: 15, topics: ['var', 'let', 'const', 'types'] },
      { id: 'lesson-002', title: 'Functions', duration: 20, topics: ['function declaration', 'arrow functions', 'closures'] },
      { id: 'lesson-003', title: 'Promises & Async', duration: 25, topics: ['promises', 'async/await', 'error handling'] },
    ],
  },
  'course-002': {
    id: 'course-002',
    title: 'React Fundamentals',
    description: 'Build dynamic UIs with React',
    objectives: ['Understand components', 'Learn hooks', 'State management'],
    lessons: [
      { id: 'lesson-004', title: 'Components & JSX', duration: 20, topics: ['components', 'JSX', 'props'] },
      { id: 'lesson-005', title: 'React Hooks', duration: 25, topics: ['useState', 'useEffect', 'useContext'] },
      { id: 'lesson-006', title: 'State Management', duration: 30, topics: ['Redux', 'Context API', 'Zustand'] },
    ],
  },
  'course-003': {
    id: 'course-003',
    title: 'TypeScript Essentials',
    description: 'Master TypeScript for type-safe JavaScript',
    objectives: ['Type annotations', 'Interfaces & types', 'Advanced generics'],
    lessons: [
      { id: 'lesson-007', title: 'Type Basics', duration: 15, topics: ['primitives', 'unions', 'literals'] },
      { id: 'lesson-008', title: 'Interfaces & Types', duration: 20, topics: ['interfaces', 'type aliases', 'extends'] },
      { id: 'lesson-009', title: 'Generics', duration: 25, topics: ['generic functions', 'constraints', 'keyof'] },
    ],
  },
  'course-004': {
    id: 'course-004',
    title: 'Web Design & CSS',
    description: 'Create beautiful responsive websites',
    objectives: ['CSS layouts', 'Responsive design', 'Animation basics'],
    lessons: [
      { id: 'lesson-010', title: 'CSS Flexbox', duration: 18, topics: ['flex container', 'flex items', 'alignment'] },
      { id: 'lesson-011', title: 'CSS Grid', duration: 20, topics: ['grid container', 'auto-placement', 'areas'] },
      { id: 'lesson-012', title: 'Responsive Design', duration: 22, topics: ['media queries', 'mobile-first', 'viewport'] },
    ],
  },
  'course-005': {
    id: 'course-005',
    title: 'Python Programming',
    description: 'Learn Python from basics to advanced',
    objectives: ['Python syntax', 'OOP concepts', 'Libraries & frameworks'],
    lessons: [
      { id: 'lesson-013', title: 'Python Basics', duration: 20, topics: ['variables', 'data types', 'operators'] },
      { id: 'lesson-014', title: 'Functions & Modules', duration: 25, topics: ['def', 'parameters', 'return'] },
      { id: 'lesson-015', title: 'OOP in Python', duration: 30, topics: ['classes', 'inheritance', 'polymorphism'] },
    ],
  },
  'course-006': {
    id: 'course-006',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend services',
    objectives: ['Express.js', 'Database integration', 'REST APIs'],
    lessons: [
      { id: 'lesson-016', title: 'Express Basics', duration: 20, topics: ['routing', 'middleware', 'requests'] },
      { id: 'lesson-017', title: 'Databases', duration: 25, topics: ['MongoDB', 'PostgreSQL', 'queries'] },
      { id: 'lesson-018', title: 'API Design', duration: 28, topics: ['REST', 'GraphQL', 'authentication'] },
    ],
  },
  'course-007': {
    id: 'course-007',
    title: 'SQL & Databases',
    description: 'Master SQL and database design',
    objectives: ['SQL basics', 'Data modeling', 'Query optimization'],
    lessons: [
      { id: 'lesson-019', title: 'SQL Basics', duration: 18, topics: ['SELECT', 'WHERE', 'JOINs'] },
      { id: 'lesson-020', title: 'Data Design', duration: 22, topics: ['normalization', 'schema', 'relationships'] },
      { id: 'lesson-021', title: 'Advanced Queries', duration: 25, topics: ['subqueries', 'aggregation', 'window functions'] },
    ],
  },
  'course-008': {
    id: 'course-008',
    title: 'Git & Version Control',
    description: 'Master Git and collaborative development',
    objectives: ['Git basics', 'Branching strategies', 'Collaboration'],
    lessons: [
      { id: 'lesson-022', title: 'Git Fundamentals', duration: 15, topics: ['init', 'commit', 'push/pull'] },
      { id: 'lesson-023', title: 'Branching & Merging', duration: 18, topics: ['branches', 'merge conflicts', 'rebase'] },
      { id: 'lesson-024', title: 'Team Workflows', duration: 20, topics: ['pull requests', 'code review', 'CI/CD'] },
    ],
  },
  'course-009': {
    id: 'course-009',
    title: 'Docker & Containers',
    description: 'Containerize applications with Docker',
    objectives: ['Docker basics', 'Images & containers', 'Compose'],
    lessons: [
      { id: 'lesson-025', title: 'Docker Setup', duration: 18, topics: ['installation', 'images', 'containers'] },
      { id: 'lesson-026', title: 'Dockerfiles', duration: 22, topics: ['FROM', 'RUN', 'CMD', 'volume'] },
      { id: 'lesson-027', title: 'Docker Compose', duration: 20, topics: ['services', 'networking', 'deployment'] },
    ],
  },
  'course-010': {
    id: 'course-010',
    title: 'AWS Cloud Services',
    description: 'Deploy applications on AWS',
    objectives: ['AWS fundamentals', 'EC2 & storage', 'Serverless'],
    lessons: [
      { id: 'lesson-028', title: 'AWS Basics', duration: 20, topics: ['console', 'IAM', 'regions'] },
      { id: 'lesson-029', title: 'Compute Services', duration: 25, topics: ['EC2', 'Lambda', 'load balancing'] },
      { id: 'lesson-030', title: 'Storage & DB', duration: 28, topics: ['S3', 'RDS', 'DynamoDB'] },
    ],
  },
  'course-011': {
    id: 'course-011',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML with Python',
    objectives: ['ML fundamentals', 'Algorithms', 'Model training'],
    lessons: [
      { id: 'lesson-031', title: 'ML Concepts', duration: 22, topics: ['supervised learning', 'unsupervised', 'metrics'] },
      { id: 'lesson-032', title: 'Algorithms', duration: 25, topics: ['regression', 'classification', 'clustering'] },
      { id: 'lesson-033', title: 'TensorFlow & Keras', duration: 28, topics: ['neural networks', 'training', 'evaluation'] },
    ],
  },
  'course-012': {
    id: 'course-012',
    title: 'Data Science with Pandas',
    description: 'Analyze and manipulate data effectively',
    objectives: ['Pandas basics', 'Data cleaning', 'Visualization'],
    lessons: [
      { id: 'lesson-034', title: 'Pandas Basics', duration: 15, topics: ['Series', 'DataFrames', 'indexing'] },
      { id: 'lesson-035', title: 'Data Cleaning', duration: 20, topics: ['handling missing', 'outliers', 'normalization'] },
      { id: 'lesson-036', title: 'Visualization', duration: 18, topics: ['matplotlib', 'seaborn', 'plotly'] },
    ],
  },
  'course-013': {
    id: 'course-013',
    title: 'Mobile App with Flutter',
    description: 'Build cross-platform mobile apps',
    objectives: ['Dart basics', 'Flutter widgets', 'State management'],
    lessons: [
      { id: 'lesson-037', title: 'Dart Fundamentals', duration: 20, topics: ['syntax', 'OOP', 'async'] },
      { id: 'lesson-038', title: 'Flutter Widgets', duration: 25, topics: ['StatelessWidget', 'StatefulWidget', 'layouts'] },
      { id: 'lesson-039', title: 'State Management', duration: 24, topics: ['Provider', 'GetX', 'Riverpod'] },
    ],
  },
  'course-014': {
    id: 'course-014',
    title: 'Web Security Best Practices',
    description: 'Secure your web applications',
    objectives: ['Common vulnerabilities', 'Authentication', 'Encryption'],
    lessons: [
      { id: 'lesson-040', title: 'Security Basics', duration: 18, topics: ['OWASP', 'injection', 'XSS', 'CSRF'] },
      { id: 'lesson-041', title: 'Authentication', duration: 20, topics: ['passwords', 'JWT', 'OAuth', 'MFA'] },
      { id: 'lesson-042', title: 'Data Protection', duration: 22, topics: ['encryption', 'SSL/TLS', 'hashing'] },
    ],
  },
  'course-015': {
    id: 'course-015',
    title: 'Testing & Quality Assurance',
    description: 'Write reliable tests for your code',
    objectives: ['Unit testing', 'Integration testing', 'Test frameworks'],
    lessons: [
      { id: 'lesson-043', title: 'Testing Basics', duration: 16, topics: ['unit tests', 'assertions', 'mocking'] },
      { id: 'lesson-044', title: 'Jest & React Testing', duration: 20, topics: ['Jest', 'React Testing Library', 'snapshots'] },
      { id: 'lesson-045', title: 'E2E Testing', duration: 22, topics: ['Cypress', 'Playwright', 'user flows'] },
    ],
  },
  'course-016': {
    id: 'course-016',
    title: 'GraphQL API Development',
    description: 'Build flexible APIs with GraphQL',
    objectives: ['GraphQL basics', 'Query & mutations', 'Apollo Server'],
    lessons: [
      { id: 'lesson-046', title: 'GraphQL Fundamentals', duration: 18, topics: ['schema', 'queries', 'mutations'] },
      { id: 'lesson-047', title: 'Apollo Server', duration: 22, topics: ['resolvers', 'middleware', 'subscriptions'] },
      { id: 'lesson-048', title: 'Best Practices', duration: 20, topics: ['caching', 'error handling', 'performance'] },
    ],
  },
  'course-017': {
    id: 'course-017',
    title: 'Next.js Full Stack',
    description: 'Full-stack development with Next.js',
    objectives: ['Pages & routing', 'API routes', 'SSR & SSG'],
    lessons: [
      { id: 'lesson-049', title: 'Next.js Setup', duration: 15, topics: ['pages', 'routing', 'API routes'] },
      { id: 'lesson-050', title: 'Rendering Modes', duration: 20, topics: ['SSR', 'SSG', 'ISR', 'SPA'] },
      { id: 'lesson-051', title: 'Database Integration', duration: 24, topics: ['Prisma', 'MongoDB', 'PostgreSQL'] },
    ],
  },
  'course-018': {
    id: 'course-018',
    title: 'Webpack & Module Bundling',
    description: 'Optimize your module bundling',
    objectives: ['Webpack basics', 'Loaders & plugins', 'Optimization'],
    lessons: [
      { id: 'lesson-052', title: 'Webpack Configuration', duration: 20, topics: ['entry', 'output', 'loaders'] },
      { id: 'lesson-053', title: 'Advanced Loaders', duration: 22, topics: ['babel', 'sass', 'file handling'] },
      { id: 'lesson-054', title: 'Performance', duration: 24, topics: ['code splitting', 'lazy loading', 'minification'] },
    ],
  },
  'course-019': {
    id: 'course-019',
    title: 'Microservices Architecture',
    description: 'Design and build microservices',
    objectives: ['Architecture patterns', 'Communication', 'Scaling'],
    lessons: [
      { id: 'lesson-055', title: 'Microservices Patterns', duration: 22, topics: ['monolith vs micro', 'domain-driven', 'API gateway'] },
      { id: 'lesson-056', title: 'Service Communication', duration: 24, topics: ['REST', 'messaging', 'event-driven'] },
      { id: 'lesson-057', title: 'Deployment & Scaling', duration: 26, topics: ['containers', 'orchestration', 'load balancing'] },
    ],
  },
  'course-020': {
    id: 'course-020',
    title: 'Kubernetes Orchestration',
    description: 'Master container orchestration',
    objectives: ['K8s concepts', 'Deployments', 'Services'],
    lessons: [
      { id: 'lesson-058', title: 'K8s Fundamentals', duration: 20, topics: ['pods', 'nodes', 'clusters'] },
      { id: 'lesson-059', title: 'Deployments & Services', duration: 24, topics: ['ReplicaSets', 'Services', 'Ingress'] },
      { id: 'lesson-060', title: 'Advanced Topics', duration: 28, topics: ['StatefulSets', 'Operators', 'Helm'] },
    ],
  },
  'course-021': {
    id: 'course-021',
    title: 'Vue.js Framework',
    description: 'Build UIs with Vue.js',
    objectives: ['Vue basics', 'Components', 'State management'],
    lessons: [
      { id: 'lesson-061', title: 'Vue Fundamentals', duration: 18, topics: ['templates', 'data binding', 'directives'] },
      { id: 'lesson-062', title: 'Components & Props', duration: 20, topics: ['single-file', 'lifecycle', 'composition'] },
      { id: 'lesson-063', title: 'Pinia & Routing', duration: 22, topics: ['state store', 'Vue Router', 'lazy loading'] },
    ],
  },
  'course-022': {
    id: 'course-022',
    title: 'Svelte Framework',
    description: 'Build reactive components with Svelte',
    objectives: ['Svelte basics', 'Reactivity', 'Animations'],
    lessons: [
      { id: 'lesson-064', title: 'Svelte Fundamentals', duration: 16, topics: ['syntax', 'reactivity', 'stores'] },
      { id: 'lesson-065', title: 'Components & Lifecycle', duration: 18, topics: ['slots', 'props', 'events'] },
      { id: 'lesson-066', title: 'Animations & Transitions', duration: 20, topics: ['transitions', 'animations', 'spring'] },
    ],
  },
  'course-023': {
    id: 'course-023',
    title: 'Firebase & Firestore',
    description: 'Build with Firebase backend',
    objectives: ['Firebase setup', 'Firestore', 'Authentication'],
    lessons: [
      { id: 'lesson-067', title: 'Firebase Basics', duration: 15, topics: ['setup', 'console', 'projects'] },
      { id: 'lesson-068', title: 'Firestore Database', duration: 20, topics: ['collections', 'documents', 'queries'] },
      { id: 'lesson-069', title: 'Auth & Hosting', duration: 18, topics: ['authentication', 'rules', 'hosting'] },
    ],
  },
  'course-024': {
    id: 'course-024',
    title: 'Agile & Scrum Methodology',
    description: 'Learn Agile development practices',
    objectives: ['Scrum framework', 'Sprint planning', 'Team collaboration'],
    lessons: [
      { id: 'lesson-070', title: 'Agile Principles', duration: 16, topics: ['values', 'manifesto', 'ceremonies'] },
      { id: 'lesson-071', title: 'Scrum Framework', duration: 18, topics: ['roles', 'events', 'artifacts'] },
      { id: 'lesson-072', title: 'Tools & Practices', duration: 16, topics: ['user stories', 'estimation', 'retrospectives'] },
    ],
  },
  'course-025': {
    id: 'course-025',
    title: 'System Design & Scalability',
    description: 'Design large-scale systems',
    objectives: ['Design patterns', 'Scalability', 'High availability'],
    lessons: [
      { id: 'lesson-073', title: 'System Design Basics', duration: 22, topics: ['requirements', 'trade-offs', 'components'] },
      { id: 'lesson-074', title: 'Scaling Techniques', duration: 24, topics: ['caching', 'databases', 'load balancing'] },
      { id: 'lesson-075', title: 'Real-world Examples', duration: 26, topics: ['case studies', 'architecture', 'optimization'] },
    ],
  },
};

// Mock Quizzes
export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

const mockQuizzes: Record<string, Quiz> = {
  'quiz-001': {
    id: 'quiz-001',
    course_id: 'course-001',
    title: 'JavaScript Basics Quiz',
    passing_score: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is the difference between let and var?',
        options: ['No difference', 'let is block-scoped', 'var is block-scoped', 'let is function-scoped'],
        correct_answer: 'let is block-scoped',
      },
      {
        id: 'q2',
        question: 'What does async/await do?',
        options: ['Speeds up code', 'Makes asynchronous code look synchronous', 'Prevents errors', 'Reduces file size'],
        correct_answer: 'Makes asynchronous code look synchronous',
      },
      {
        id: 'q3',
        question: 'What is a closure?',
        options: ['A function that closes the program', 'A function that has access to outer scope', 'Type of loop', 'Error handling'],
        correct_answer: 'A function that has access to outer scope',
      },
    ],
  },
  'quiz-002': {
    id: 'quiz-002',
    course_id: 'course-002',
    title: 'React Hooks Quiz',
    passing_score: 75,
    questions: [
      {
        id: 'q1',
        question: 'What does useState return?',
        options: ['A state object', 'An array with state and setter', 'A function', 'A promise'],
        correct_answer: 'An array with state and setter',
      },
      {
        id: 'q2',
        question: 'When does useEffect run?',
        options: ['Once on mount', 'After every render', 'On specific dependencies', 'All of the above with dependencies'],
        correct_answer: 'On specific dependencies',
      },
      {
        id: 'q3',
        question: 'What is useContext used for?',
        options: ['Styling components', 'Sharing state globally', 'Form handling', 'Animation'],
        correct_answer: 'Sharing state globally',
      },
    ],
  },
  'quiz-003': {
    id: 'quiz-003',
    course_id: 'course-003',
    title: 'TypeScript Fundamentals',
    passing_score: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is an interface in TypeScript?',
        options: ['A class', 'A contract for object shape', 'A function', 'A variable'],
        correct_answer: 'A contract for object shape',
      },
      {
        id: 'q2',
        question: 'What are generics?',
        options: ['General functions', 'Reusable components with types', 'Type errors', 'Collections'],
        correct_answer: 'Reusable components with types',
      },
    ],
  },
  'quiz-004': {
    id: 'quiz-004',
    course_id: 'course-004',
    title: 'CSS Flexbox Quiz',
    passing_score: 65,
    questions: [
      {
        id: 'q1',
        question: 'What does display: flex do?',
        options: ['Hides element', 'Creates flex container', 'Changes color', 'Rotates element'],
        correct_answer: 'Creates flex container',
      },
    ],
  },
  'quiz-005': {
    id: 'quiz-005',
    course_id: 'course-005',
    title: 'Python Basics Quiz',
    passing_score: 72,
    questions: [
      {
        id: 'q1',
        question: 'How do you define a function in Python?',
        options: ['function myFunc()', 'def myFunc():', 'func myFunc:', 'function: myFunc'],
        correct_answer: 'def myFunc():',
      },
    ],
  },
  'quiz-006': {
    id: 'quiz-006',
    course_id: 'course-006',
    title: 'Express.js Quiz',
    passing_score: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is middleware in Express?',
        options: ['Database layer', 'Function that processes requests', 'Template engine', 'Router'],
        correct_answer: 'Function that processes requests',
      },
    ],
  },
};

const mockLearners: Record<string, LearnerStats> = {
  'learner-001': {
    learner_id: 'learner-001',
    points_total: 450,
    current_badge: 'Scholar',
    lessons_completed: 8,
    points_needed_for_next: 50,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 85, completed_at: '2026-03-20' },
      { quiz_id: 'quiz-002', score: 92, completed_at: '2026-03-21' },
    ],
  },
  'learner-002': {
    learner_id: 'learner-002',
    points_total: 850,
    current_badge: 'Expert',
    lessons_completed: 18,
    points_needed_for_next: 150,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 95, completed_at: '2026-03-15' },
      { quiz_id: 'quiz-002', score: 98, completed_at: '2026-03-18' },
      { quiz_id: 'quiz-003', score: 88, completed_at: '2026-03-21' },
    ],
  },
  'learner-003': {
    learner_id: 'learner-003',
    points_total: 210,
    current_badge: 'Newbie',
    lessons_completed: 3,
    points_needed_for_next: 40,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 68, completed_at: '2026-03-20' },
    ],
  },
  'learner-004': {
    learner_id: 'learner-004',
    points_total: 620,
    current_badge: 'Scholar',
    lessons_completed: 12,
    points_needed_for_next: 80,
    quiz_history: [
      { quiz_id: 'quiz-004', score: 78, completed_at: '2026-03-19' },
      { quiz_id: 'quiz-005', score: 82, completed_at: '2026-03-21' },
    ],
  },
  'learner-005': {
    learner_id: 'learner-005',
    points_total: 1250,
    current_badge: 'Master',
    lessons_completed: 35,
    points_needed_for_next: 250,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 100, completed_at: '2026-03-10' },
      { quiz_id: 'quiz-002', score: 99, completed_at: '2026-03-12' },
      { quiz_id: 'quiz-003', score: 96, completed_at: '2026-03-15' },
      { quiz_id: 'quiz-004', score: 94, completed_at: '2026-03-18' },
    ],
  },
  'learner-006': {
    learner_id: 'learner-006',
    points_total: 340,
    current_badge: 'Learner',
    lessons_completed: 6,
    points_needed_for_next: 60,
    quiz_history: [
      { quiz_id: 'quiz-005', score: 75, completed_at: '2026-03-20' },
    ],
  },
  'learner-007': {
    learner_id: 'learner-007',
    points_total: 720,
    current_badge: 'Expert',
    lessons_completed: 14,
    points_needed_for_next: 80,
    quiz_history: [
      { quiz_id: 'quiz-006', score: 89, completed_at: '2026-03-21' },
      { quiz_id: 'quiz-002', score: 85, completed_at: '2026-03-20' },
    ],
  },
  'learner-008': {
    learner_id: 'learner-008',
    points_total: 180,
    current_badge: 'Newbie',
    lessons_completed: 2,
    points_needed_for_next: 20,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 55, completed_at: '2026-03-19' },
    ],
  },
  'learner-009': {
    learner_id: 'learner-009',
    points_total: 560,
    current_badge: 'Scholar',
    lessons_completed: 10,
    points_needed_for_next: 40,
    quiz_history: [
      { quiz_id: 'quiz-003', score: 81, completed_at: '2026-03-21' },
      { quiz_id: 'quiz-004', score: 79, completed_at: '2026-03-20' },
    ],
  },
  'learner-010': {
    learner_id: 'learner-010',
    points_total: 1050,
    current_badge: 'Master',
    lessons_completed: 28,
    points_needed_for_next: 200,
    quiz_history: [
      { quiz_id: 'quiz-001', score: 98, completed_at: '2026-03-12' },
      { quiz_id: 'quiz-002', score: 96, completed_at: '2026-03-14' },
      { quiz_id: 'quiz-003', score: 94, completed_at: '2026-03-18' },
    ],
  },
}

// Tool Implementations

/**
 * Summarize course content and lessons
 */
export async function summarize_course(input: CourseSummaryInput): Promise<ToolResult> {
  try {
    const course = mockCourses[input.course_id];
    if (!course) {
      return { success: false, error: `Course ${input.course_id} not found` };
    }

    const lessonsToSummarize = input.lesson_ids
      ? course.lessons.filter(l => input.lesson_ids!.includes(l.id))
      : course.lessons;

    const summary = {
      course_title: course.title,
      course_description: course.description,
      objectives: course.objectives,
      lessons: lessonsToSummarize.map(l => ({
        title: l.title,
        duration: l.duration,
        topics: l.topics,
      })),
      tldr: `${course.title} covers ${course.objectives.join(', ')}. You'll learn through ${lessonsToSummarize.length} lessons, each with practical examples and exercises.`,
      total_duration_minutes: lessonsToSummarize.reduce((sum, l) => sum + l.duration, 0),
    };

    return { success: true, data: summary };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Provide feedback on quiz performance
 */
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

/**
 * Get learner progress and stats
 */
export async function get_learner_progress(input: LearnerProgressInput): Promise<ToolResult> {
  try {
    const learner = mockLearners[input.learner_id];
    if (!learner) {
      return { success: false, error: `Learner ${input.learner_id} not found` };
    }

    const badges = ['Newbie', 'Learner', 'Scholar', 'Expert', 'Master'];
    const currentBadgeIndex = badges.indexOf(learner.current_badge);
    const nextBadge = currentBadgeIndex < badges.length - 1 ? badges[currentBadgeIndex + 1] : 'Grandmaster';

    return {
      success: true,
      data: {
        points_total: learner.points_total,
        current_badge: learner.current_badge,
        lessons_completed: learner.lessons_completed,
        points_needed_for_next_badge: learner.points_needed_for_next,
        next_badge: nextBadge,
        progress_percentage: Math.min(
          ((learner.points_total % 100) / 100) * 100,
          100
        ),
        recent_quizzes: learner.quiz_history.slice(-3),
        streak_days: 5, // Mock data
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Recommend next lesson based on progress and quiz gaps
 */
export async function recommend_next_lesson(input: RecommendLessonInput): Promise<ToolResult> {
  try {
    const course = mockCourses[input.course_id];
    if (!course) {
      return { success: false, error: `Course ${input.course_id} not found` };
    }

    const learner = mockLearners[input.learner_id];
    if (!learner) {
      return { success: false, error: `Learner ${input.learner_id} not found` };
    }

    // Simple logic: recommend next uncompleted lesson
    const recommendedLessonIndex = learner.lessons_completed % course.lessons.length;
    const nextLesson = course.lessons[recommendedLessonIndex];

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
          duration_minutes: nextLesson.duration,
          topics: nextLesson.topics,
        },
        reason: `Based on your progress, you're ready for "${nextLesson.title}". This lesson builds on concepts you've already mastered!`,
        estimated_completion_time: `${nextLesson.duration} minutes`,
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
    execute: summarize_course,
  },
  {
    name: 'give_quiz_feedback',
    description: 'Provide detailed feedback on quiz performance with revision tips',
    schema: QuizFeedbackSchema,
    execute: give_quiz_feedback,
  },
  {
    name: 'get_learner_progress',
    description: 'Get learner statistics including points, badge level, and progress',
    schema: LearnerProgressSchema,
    execute: get_learner_progress,
  },
  {
    name: 'recommend_next_lesson',
    description: 'Recommend the next lesson to study based on progress and quiz gaps',
    schema: RecommendLessonSchema,
    execute: recommend_next_lesson,
  },
];
