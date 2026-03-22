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

// Additional unique courses to add
const newUniqueCourses = [
  {
    title: 'Advanced Mobile App Development',
    description: 'Deep dive into advanced mobile patterns, performance optimization, and best practices for production apps.',
    category: 'Mobile Development',
    level: 'advanced',
    duration: '10 weeks',
  },
  {
    title: 'Python Web Development with Django',
    description: 'Build robust web applications using Django framework and best practices.',
    category: 'Backend',
    level: 'intermediate',
    duration: '8 weeks',
  },
  {
    title: 'Advanced Data Science Applications',
    description: 'Applied machine learning and advanced analytics for real-world problems.',
    category: 'Data Science',
    level: 'advanced',
    duration: '12 weeks',
  },
  {
    title: 'Mobile App Performance Optimization',
    description: 'Learn techniques to optimize mobile app performance, battery life, and user experience.',
    category: 'Mobile Development',
    level: 'advanced',
    duration: '6 weeks',
  },
  {
    title: 'Cross-Platform Mobile Development',
    description: 'Master building applications that work seamlessly across iOS and Android platforms.',
    category: 'Mobile Development',
    level: 'intermediate',
    duration: '9 weeks',
  },
];

// Image URLs for new courses
const newCourseImages = [
  'https://images.unsplash.com/photo-1512941691920-25d81d41605a?w=800&h=400&fit=crop&crop=top',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=left',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=right',
  'https://images.unsplash.com/photo-1512941691920-25d81d41605a?w=800&h=400&fit=crop&crop=bottom',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=80',
];

async function createUniqueCourses() {
  try {
    console.log('🎓 Creating additional unique courses to eliminate duplicates...\n');

    // Get admin user as instructor
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error('❌ Could not find admin user');
      process.exit(1);
    }

    console.log(`Using instructor: ${adminUser.name}\n`);

    let createdCount = 0;
    let failedCount = 0;
    const newCourseIds = [];

    for (let i = 0; i < newUniqueCourses.length; i++) {
      try {
        const courseData = newUniqueCourses[i];

        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            level: courseData.level,
            duration: courseData.duration,
            instructor_id: adminUser.id,
            instructor_name: adminUser.name,
            cover_image: newCourseImages[i],
            rating: (Math.random() * 2 + 3).toFixed(1),
            rating_count: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 5000),
            is_published: true,
            visibility: 'public',
            access_rule: 'open',
            price: Math.random() > 0.5 ? null : Math.floor(Math.random() * 200) + 10,
            tags: courseData.category.toLowerCase().split(' '),
          })
          .select();

        if (courseError) {
          console.error(`❌ Course ${i + 1} - Error:`, courseError.message);
          failedCount++;
          continue;
        }

        newCourseIds.push(newCourse[0].id);
        createdCount++;
        console.log(`✅ Course ${i + 1} - Created: ${courseData.title}`);
      } catch (error) {
        console.error(`❌ Course ${i + 1} - Unexpected error:`, error.message);
        failedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ NEW UNIQUE COURSES CREATED');
    console.log('='.repeat(60));
    console.log(`✅ Courses created: ${createdCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📚 Total new courses: ${newCourseIds.length}`);
    console.log('='.repeat(60));

    // Get total course count
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('is_published', true);

    console.log(`\n📊 Total courses in database: ${allCourses?.length || 0}`);
    console.log('🎯 Now you have enough unique courses for all tutors!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

createUniqueCourses().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
