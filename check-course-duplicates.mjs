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

async function checkCourseDuplicates() {
  try {
    console.log('🔍 Checking for duplicate course assignments...\n');

    // Get all courses with their instructors
    const { data: courses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title, instructor_name, instructor_id')
      .eq('is_published', true)
      .order('title', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching courses:', fetchError.message);
      process.exit(1);
    }

    if (!courses || courses.length === 0) {
      console.log('No courses found');
      process.exit(0);
    }

    // Group by title to find duplicates
    const titleMap = {};
    courses.forEach(course => {
      if (!titleMap[course.title]) {
        titleMap[course.title] = [];
      }
      titleMap[course.title].push(course);
    });

    // Find duplicate titles
    const duplicates = Object.entries(titleMap).filter(([_, courses]) => courses.length > 1);

    console.log(`Total courses: ${courses.length}`);
    console.log(`Unique titles: ${Object.keys(titleMap).length}`);
    console.log(`Duplicate titles: ${duplicates.length}\n`);

    if (duplicates.length > 0) {
      console.log('📋 Duplicate Courses Found:\n');
      duplicates.forEach(([title, coursesWithTitle]) => {
        console.log(`"${title}" (${coursesWithTitle.length} times):`);
        coursesWithTitle.forEach((course, idx) => {
          console.log(`  ${idx + 1}. ID: ${course.id}`);
          console.log(`     Instructor: ${course.instructor_name}`);
        });
        console.log();
      });
    } else {
      console.log('✅ No duplicate course titles found!');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

checkCourseDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
