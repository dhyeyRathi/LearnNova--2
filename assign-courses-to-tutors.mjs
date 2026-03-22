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

async function assignCoursesToTutors() {
  try {
    console.log('📚 Assigning courses to tutors...\n');

    // Fetch all tutors (role = 'tutor')
    const { data: tutors, error: tutorsError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'tutor')
      .like('email', '%learnnova-inst.com%')
      .order('created_at', { ascending: true });

    if (tutorsError || !tutors || tutors.length === 0) {
      console.error('❌ No tutors found:', tutorsError?.message);
      process.exit(1);
    }

    console.log(`Found ${tutors.length} tutors\n`);

    // Fetch all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ No courses found:', coursesError?.message);
      process.exit(1);
    }

    console.log(`Found ${courses.length} courses\n`);

    // Distribute courses among tutors
    let assignmentCount = 0;
    let skippedCount = 0;

    courses.forEach((course, index) => {
      // Assign each course to a tutor in round-robin fashion
      const tutorIndex = index % tutors.length;
      const tutor = tutors[tutorIndex];

      // Skip if already assigned to this tutor
      if (course.instructor_id === tutor.id) {
        console.log(`⏭️  Course ${index + 1}/${courses.length} - "${course.title}" already assigned to ${tutor.name}`);
        skippedCount++;
        return;
      }

      assignmentCount++;
      console.log(`✅ Course ${index + 1}/${courses.length} - Assigning "${course.title}" to ${tutor.name} (Tutor ${tutorIndex + 1})`);
    });

    // Update courses with tutor assignments
    console.log('\n🔄 Updating database...\n');

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const tutorIndex = i % tutors.length;
      const tutor = tutors[tutorIndex];

      try {
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            instructor_id: tutor.id,
            instructor_name: tutor.name,
          })
          .eq('id', course.id);

        if (updateError) {
          console.error(`❌ Failed to assign "${course.title}" to ${tutor.name}:`, updateError.message);
          failedCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating course:`, error.message);
        failedCount++;
      }

      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ COURSE ASSIGNMENT COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Courses successfully assigned: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`⏭️  Already assigned (skipped): ${skippedCount}`);
    console.log(`👨‍🏫 Total tutors: ${tutors.length}`);
    console.log(`📚 Total courses: ${courses.length}`);
    console.log('\n📋 Course Distribution:');
    console.log('='.repeat(60));

    // Show distribution by tutor
    for (let i = 0; i < tutors.length; i++) {
      const tutorCourses = courses.filter((_, idx) => idx % tutors.length === i);
      console.log(`\n${tutors[i].name}:`);
      tutorCourses.forEach(course => {
        console.log(`  • ${course.title}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

assignCoursesToTutors().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
