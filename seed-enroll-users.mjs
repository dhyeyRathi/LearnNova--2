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

async function enrollUsersInCourses() {
  try {
    console.log('📚 Fetching all test users and courses...\n');

    // Get all test users
    const { data: testUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'learner')
      .like('email', '%learnnova-test.com%');

    if (usersError || !testUsers || testUsers.length === 0) {
      console.error('❌ No test users found');
      process.exit(1);
    }

    // Get all published courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('is_published', true);

    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ No published courses found');
      process.exit(1);
    }

    console.log(`✅ Found ${testUsers.length} test users`);
    console.log(`✅ Found ${courses.length} published courses\n`);

    console.log('📝 Enrolling users in courses...\n');

    let enrollmentCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < testUsers.length; i++) {
      const userId = testUsers[i].id;

      // Each user enrolls in 2-4 random courses
      const numCourses = Math.floor(Math.random() * 3) + 2;
      const selectedCourses = [];

      for (let j = 0; j < numCourses; j++) {
        const course = courses[Math.floor(Math.random() * courses.length)];
        if (!selectedCourses.find(c => c.id === course.id)) {
          selectedCourses.push(course);
        }
      }

      for (const course of selectedCourses) {
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: userId,
            course_id: course.id,
            progress_percentage: Math.floor(Math.random() * 100),
            is_completed: Math.random() > 0.85,
          });

        if (enrollError) {
          if (enrollError.message.includes('duplicate')) {
            duplicateCount++;
          }
        } else {
          enrollmentCount++;
        }
      }

      // Show progress every 10 users
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Processed ${i + 1}/${testUsers.length} users...`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ USER ENROLLMENT COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Enrollments created: ${enrollmentCount}`);
    console.log(`⚠️ Duplicate enrollments skipped: ${duplicateCount}`);
    console.log(`👥 Total users enrolled: ${testUsers.length}`);
    console.log(`📚 Available courses: ${courses.length}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

enrollUsersInCourses().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
