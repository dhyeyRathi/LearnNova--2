import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key] = valueParts.join('=');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Course data
const courseData = [
  {
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
    category: 'Web Development',
    level: 'beginner',
    duration: '6 weeks',
  },
  {
    title: 'Advanced React Mastery',
    description: 'Master React hooks, context API, and state management patterns.',
    category: 'Web Development',
    level: 'advanced',
    duration: '8 weeks',
  },
  {
    title: 'Python Programming 101',
    description: 'Start your programming journey with Python, one of the easiest languages to learn.',
    category: 'Programming',
    level: 'beginner',
    duration: '5 weeks',
  },
  {
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning basics.',
    category: 'Data Science',
    level: 'intermediate',
    duration: '10 weeks',
  },
  {
    title: 'Mobile App Development',
    description: 'Build cross-platform mobile apps using React Native.',
    category: 'Mobile Development',
    level: 'intermediate',
    duration: '8 weeks',
  },
  {
    title: 'Cloud Computing with AWS',
    description: 'Deploy and manage applications on Amazon Web Services.',
    category: 'Cloud',
    level: 'intermediate',
    duration: '6 weeks',
  },
  {
    title: 'Full Stack Web Development',
    description: 'Complete guide to frontend and backend development with Node.js.',
    category: 'Web Development',
    level: 'advanced',
    duration: '12 weeks',
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Master design thinking and create beautiful user interfaces.',
    category: 'Design',
    level: 'beginner',
    duration: '4 weeks',
  },
  {
    title: 'Database Design and SQL',
    description: 'Learn relational databases and write efficient SQL queries.',
    category: 'Database',
    level: 'intermediate',
    duration: '5 weeks',
  },
  {
    title: 'DevOps Essentials',
    description: 'Learn CI/CD pipelines, Docker, and Kubernetes.',
    category: 'DevOps',
    level: 'advanced',
    duration: '7 weeks',
  },
  {
    title: 'JavaScript ES6+ Deep Dive',
    description: 'Understand modern JavaScript features and best practices.',
    category: 'Programming',
    level: 'intermediate',
    duration: '4 weeks',
  },
  {
    title: 'TypeScript for Developers',
    description: 'Add type safety to your JavaScript projects.',
    category: 'Programming',
    level: 'intermediate',
    duration: '3 weeks',
  },
  {
    title: 'Vue.js Framework Basics',
    description: 'Build interactive web applications with Vue.js.',
    category: 'Web Development',
    level: 'beginner',
    duration: '5 weeks',
  },
  {
    title: 'Angular Professional Development',
    description: 'Enterprise-level Angular development for large-scale projects.',
    category: 'Web Development',
    level: 'advanced',
    duration: '10 weeks',
  },
  {
    title: 'API Development Best Practices',
    description: 'Build RESTful and GraphQL APIs that scale.',
    category: 'Backend',
    level: 'intermediate',
    duration: '6 weeks',
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to ML algorithms and practical applications.',
    category: 'AI/ML',
    level: 'intermediate',
    duration: '8 weeks',
  },
  {
    title: 'Web Security Essentials',
    description: 'Protect your applications from common vulnerabilities.',
    category: 'Security',
    level: 'intermediate',
    duration: '4 weeks',
  },
  {
    title: 'Git and Version Control',
    description: 'Master Git and collaborative development workflows.',
    category: 'Tools',
    level: 'beginner',
    duration: '2 weeks',
  },
];

// Quiz templates with questions
const quizTemplates = [
  {
    title: 'HTML Basics Quiz',
    description: 'Test your knowledge of HTML fundamentals.',
    passing_score: 70,
    questions: [
      {
        question_text: 'What does HTML stand for?',
        question_type: 'multiple-choice',
        options: {
          A: 'Hyper Text Markup Language',
          B: 'High Tech Modern Language',
          C: 'Home Tool Markup Language',
          D: 'Hyperlinks and Text Markup Language',
        },
        correct_answer: 'A',
        explanation: 'HTML stands for Hyper Text Markup Language.',
        points: 1,
      },
      {
        question_text: 'Which tag is used for the largest heading?',
        question_type: 'multiple-choice',
        options: {
          A: '<heading>',
          B: '<h1>',
          C: '<head>',
          D: '<header>',
        },
        correct_answer: 'B',
        explanation: 'The <h1> tag is used for the largest heading in HTML.',
        points: 1,
      },
      {
        question_text: 'HTML is a programming language.',
        question_type: 'true-false',
        options: {
          A: 'True',
          B: 'False',
        },
        correct_answer: 'B',
        explanation: 'HTML is a markup language, not a programming language.',
        points: 1,
      },
      {
        question_text: 'What is the correct way to create a link?',
        question_type: 'multiple-choice',
        options: {
          A: '<link href="url">Click here</link>',
          B: '<a href="url">Click here</a>',
          C: '<url>Click here</url>',
          D: '<href>Click here</href>',
        },
        correct_answer: 'B',
        explanation: 'The <a> tag with href attribute is used to create links.',
        points: 1,
      },
    ],
  },
  {
    title: 'CSS Styling Quiz',
    description: 'Test your understanding of CSS.',
    passing_score: 75,
    questions: [
      {
        question_text: 'Which property is used to change text color?',
        question_type: 'multiple-choice',
        options: {
          A: 'font-color',
          B: 'text-color',
          C: 'color',
          D: 'text-style',
        },
        correct_answer: 'C',
        explanation: 'The color property is used to change text color in CSS.',
        points: 1,
      },
      {
        question_text: 'CSS stands for Cascading Style Sheets.',
        question_type: 'true-false',
        options: {
          A: 'True',
          B: 'False',
        },
        correct_answer: 'A',
        explanation: 'Yes, CSS stands for Cascading Style Sheets.',
        points: 1,
      },
      {
        question_text: 'How do you select an element with id "header"?',
        question_type: 'multiple-choice',
        options: {
          A: '.header',
          B: '#header',
          C: '*header',
          D: '>header',
        },
        correct_answer: 'B',
        explanation: 'The # selector is used to select elements by ID.',
        points: 1,
      },
    ],
  },
  {
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics.',
    passing_score: 70,
    questions: [
      {
        question_text: 'Which keyword is used to declare a variable that cannot be changed?',
        question_type: 'multiple-choice',
        options: {
          A: 'let',
          B: 'const',
          C: 'var',
          D: 'static',
        },
        correct_answer: 'B',
        explanation: 'The const keyword is used for variables that cannot be changed.',
        points: 1,
      },
      {
        question_text: 'JavaScript is a strongly typed language.',
        question_type: 'true-false',
        options: {
          A: 'True',
          B: 'False',
        },
        correct_answer: 'B',
        explanation: 'JavaScript is dynamically typed, not strongly typed.',
        points: 1,
      },
      {
        question_text: 'What does the function console.log() do?',
        question_type: 'multiple-choice',
        options: {
          A: 'Creates a new log file',
          B: 'Displays data in the browser console',
          C: 'Logs out the user',
          D: 'Clears the console',
        },
        correct_answer: 'B',
        explanation: 'console.log() displays output in the browser console.',
        points: 1,
      },
      {
        question_text: 'What is a callback function?',
        question_type: 'multiple-choice',
        options: {
          A: 'A function that calls itself',
          B: 'A function passed to another function to be called later',
          C: 'A function that returns another function',
          D: 'A function that has no parameters',
        },
        correct_answer: 'B',
        explanation: 'A callback is a function passed as argument to be called later.',
        points: 1,
      },
    ],
  },
  {
    title: 'Python Basics Quiz',
    description: 'Test your Python programming knowledge.',
    passing_score: 70,
    questions: [
      {
        question_text: 'What symbol is used for comments in Python?',
        question_type: 'multiple-choice',
        options: {
          A: '//',
          B: '/*',
          C: '#',
          D: '--',
        },
        correct_answer: 'C',
        explanation: 'The # symbol is used for single-line comments in Python.',
        points: 1,
      },
      {
        question_text: 'Python is case-sensitive.',
        question_type: 'true-false',
        options: {
          A: 'True',
          B: 'False',
        },
        correct_answer: 'A',
        explanation: 'Python is case-sensitive, myVar and myvar are different.',
        points: 1,
      },
      {
        question_text: 'Which of the following is NOT a Python data type?',
        question_type: 'multiple-choice',
        options: {
          A: 'String',
          B: 'Dictionary',
          C: 'Class',
          D: 'List',
        },
        correct_answer: 'C',
        explanation: 'Class is not a data type; the others are built-in data types.',
        points: 1,
      },
    ],
  },
  {
    title: 'React Hooks Quiz',
    description: 'Test your knowledge of React Hooks.',
    passing_score: 75,
    questions: [
      {
        question_text: 'What is the purpose of the useEffect hook?',
        question_type: 'multiple-choice',
        options: {
          A: 'To manage component styling',
          B: 'To perform side effects in functional components',
          C: 'To create new components',
          D: 'To manage routing',
        },
        correct_answer: 'B',
        explanation: 'useEffect is used for side effects like API calls and subscriptions.',
        points: 1,
      },
      {
        question_text: 'Hooks can only be called at the top level of a component.',
        question_type: 'true-false',
        options: {
          A: 'True',
          B: 'False',
        },
        correct_answer: 'A',
        explanation: 'Rules of Hooks state they must be called at top level.',
        points: 1,
      },
      {
        question_text: 'Which hook is used to share state between components?',
        question_type: 'multiple-choice',
        options: {
          A: 'useState',
          B: 'useContext',
          C: 'useReducer',
          D: 'useMemo',
        },
        correct_answer: 'B',
        explanation: 'useContext allows sharing state across multiple components.',
        points: 1,
      },
      {
        question_text: 'What does the dependency array in useEffect control?',
        question_type: 'multiple-choice',
        options: {
          A: 'Component rendering',
          B: 'When the effect runs',
          C: 'Component state',
          D: 'Component props',
        },
        correct_answer: 'B',
        explanation: 'The dependency array controls when the effect should run.',
        points: 1,
      },
    ],
  },
];

async function seedCoursesAndQuizzes() {
  try {
    // Get admin user to use as instructor
    console.log('👤 Fetching admin user...\n');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error('❌ Could not find admin user. Please run seed-test-users.mjs first.');
      process.exit(1);
    }

    const instructorId = adminUser.id;
    const instructorName = adminUser.name;

    console.log(`✅ Using instructor: ${instructorName}\n`);
    console.log('📚 Creating courses...\n');

    const courseIds = [];
    const createdCourses = [];

    // Create courses
    for (let i = 0; i < courseData.length; i++) {
      try {
        const course = courseData[i];
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            instructor_id: instructorId,
            instructor_name: instructorName,
            rating: (Math.random() * 2 + 3).toFixed(1),
            rating_count: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 5000),
            is_published: true,
            visibility: 'public',
            access_rule: 'open',
            price: Math.random() > 0.5 ? null : Math.floor(Math.random() * 200) + 10,
            tags: course.category.toLowerCase().split(' '),
          })
          .select();

        if (courseError) {
          console.error(`❌ Course ${i + 1}/${courseData.length} - Error:`, courseError.message);
          continue;
        }

        courseIds.push(newCourse[0].id);
        createdCourses.push(newCourse[0]);
        console.log(`✅ Course ${i + 1}/${courseData.length} - Created: ${course.title}`);
      } catch (error) {
        console.error(`❌ Course ${i + 1}/${courseData.length} - Unexpected error:`, error.message);
      }

      // Add delay every 5 courses
      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`\n📝 Creating quizzes (4-5 per type)...\n`);

    let totalQuizzesCreated = 0;

    // Create quizzes for each template
    for (let t = 0; t < quizTemplates.length; t++) {
      const template = quizTemplates[t];
      const numQuizzesPerTemplate = 1; // 1 quiz per template = 5 total quizzes

      for (let q = 0; q < numQuizzesPerTemplate; q++) {
        try {
          const randomCourse = createdCourses[Math.floor(Math.random() * createdCourses.length)];

          if (!randomCourse) {
            console.log('⚠️ No courses available to assign quiz to');
            continue;
          }

          // Create quiz
          const { data: newQuiz, error: quizError } = await supabase
            .from('quizzes')
            .insert({
              course_id: randomCourse.id,
              title: template.title,
              description: template.description,
              passing_score: template.passing_score,
              is_published: true,
              random_questions: false,
              show_correct_answers: true,
              time_limit_minutes: Math.floor(Math.random() * 30) + 10,
            })
            .select();

          if (quizError) {
            console.error(
              `❌ Quiz ${totalQuizzesCreated + 1} - Error:`,
              quizError.message
            );
            continue;
          }

          const quizId = newQuiz[0].id;

          // Add questions to quiz
          const questionsWithSequence = template.questions.map((q, idx) => ({
            ...q,
            quiz_id: quizId,
            sequence_number: idx + 1,
          }));

          const { error: questionsError } = await supabase
            .from('quiz_questions')
            .insert(questionsWithSequence);

          if (questionsError) {
            console.error(
              `❌ Quiz ${totalQuizzesCreated + 1} - Error adding questions:`,
              questionsError.message
            );
            continue;
          }

          totalQuizzesCreated++;
          console.log(
            `✅ Quiz ${totalQuizzesCreated} - Created: "${template.title}" for course "${randomCourse.title}"`
          );
          console.log(
            `   📋 Added ${template.questions.length} questions | Passing Score: ${template.passing_score}%`
          );
        } catch (error) {
          console.error(`❌ Quiz ${totalQuizzesCreated + 1} - Unexpected error:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Courses created: ${courseIds.length}`);
    console.log(`✅ Quizzes created: ${totalQuizzesCreated}`);
    console.log(`📊 Total questions: ${totalQuizzesCreated * 4}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedCoursesAndQuizzes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
