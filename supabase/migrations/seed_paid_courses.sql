-- Seed 10 Premium Paid Courses for LearnNova
-- This migration adds 10 paid courses to the database

-- First, ensure we have valid tutor IDs. Using placeholder UUIDs that should exist in the users table
-- If tutors don't exist, you may need to insert them first

-- Insert 10 premium courses with payment access rule
INSERT INTO courses (
  title,
  description,
  instructor_id,
  instructor_name,
  category,
  cover_image,
  duration,
  rating,
  rating_count,
  views,
  is_published,
  visibility,
  access_rule,
  price,
  tags
) VALUES
-- Course 1: Web Development Advanced
(
  'Web Development Advanced',
  'Master advanced web development concepts including performance optimization, security best practices, and scalable architecture.',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sarah Williams',
  'Web Development',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  '22 hours',
  4.8,
  189,
  2145,
  true,
  'public',
  'payment',
  39.99,
  '{Web Development,Advanced,Performance}'
),

-- Course 2: Machine Learning Basics
(
  'Machine Learning Basics',
  'Introduction to machine learning with hands-on projects. Learn algorithms, model evaluation, and real-world applications using scikit-learn and TensorFlow.',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. James Mitchell',
  'AI & Machine Learning',
  'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b841?w=800',
  '25 hours',
  4.9,
  267,
  3421,
  true,
  'public',
  'payment',
  59.99,
  '{Machine Learning,Python,AI}'
),

-- Course 3: Cloud Computing with AWS
(
  'Cloud Computing with AWS',
  'Complete AWS certification preparation course. Deploy and manage applications on Amazon Web Services with hands-on labs.',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. James Mitchell',
  'Cloud Computing',
  'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800',
  '28 hours',
  4.7,
  234,
  2876,
  true,
  'public',
  'payment',
  69.99,
  '{AWS,Cloud,DevOps}'
),

-- Course 4: Full Stack JavaScript
(
  'Full Stack JavaScript',
  'Build complete web applications with JavaScript from frontend to backend. Includes MongoDB, Express, React, and Node.js (MERN stack).',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sarah Williams',
  'Web Development',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  '30 hours',
  4.9,
  312,
  3654,
  true,
  'public',
  'payment',
  49.99,
  '{JavaScript,MERN,Full Stack}'
),

-- Course 5: iOS Development with Swift
(
  'iOS Development with Swift',
  'Create professional iOS applications using Swift, SwiftUI, and Core Data. Build production-ready apps for iPhone and iPad.',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. James Mitchell',
  'Mobile Development',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  '24 hours',
  4.8,
  198,
  2143,
  true,
  'public',
  'payment',
  79.99,
  '{iOS,Swift,Mobile}'
),

-- Course 6: Blockchain Development
(
  'Blockchain Development',
  'Learn blockchain technology and smart contract development. Build decentralized applications using Solidity and Ethereum.',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sarah Williams',
  'Blockchain',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  '26 hours',
  4.6,
  143,
  1876,
  true,
  'public',
  'payment',
  99.99,
  '{Blockchain,Web3,Solidity}'
),

-- Course 7: DevOps & CI/CD Pipelines
(
  'DevOps & CI/CD Pipelines',
  'Master DevOps practices and continuous integration/deployment. Work with Docker, Jenkins, GitLab CI, and Kubernetes.',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. James Mitchell',
  'DevOps',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  '20 hours',
  4.7,
  176,
  2534,
  true,
  'public',
  'payment',
  44.99,
  '{DevOps,CI/CD,Docker}'
),

-- Course 8: Cybersecurity Fundamentals
(
  'Cybersecurity Fundamentals',
  'Essential cybersecurity concepts and practices. Learn about encryption, network security, and ethical hacking fundamentals.',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sarah Williams',
  'Security',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  '23 hours',
  4.8,
  201,
  2456,
  true,
  'public',
  'payment',
  54.99,
  '{Cybersecurity,Security,Networking}'
),

-- Course 9: GraphQL API Development
(
  'GraphQL API Development',
  'Build modern APIs with GraphQL. Learn query language, mutations, subscriptions, and integration with Node.js and Apollo Server.',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. James Mitchell',
  'Backend Development',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  '18 hours',
  4.6,
  127,
  1654,
  true,
  'public',
  'payment',
  39.99,
  '{GraphQL,API,Backend}'
),

-- Course 10: Docker & Kubernetes Mastery
(
  'Docker & Kubernetes Mastery',
  'Complete containerization and orchestration course. Master Docker, build scalable applications, and deploy with Kubernetes in production.',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sarah Williams',
  'DevOps',
  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
  '27 hours',
  4.9,
  221,
  2789,
  true,
  'public',
  'payment',
  64.99,
  '{Docker,Kubernetes,Containers}'
);
