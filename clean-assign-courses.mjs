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

async function cleanAssignCoursesToTutors() {
  try {
    console.log('🔄 CLEAN COURSE & TUTOR ASSIGNMENT - NO DUPLICATES\n');

    // Step 1: Get all tutors
    const { data: tutors, error: tutorsError } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'tutor')
      .like('email', '%learnnova-inst.com%');

    if (tutorsError || !tutors || tutors.length === 0) {
      console.error('❌ No tutors found');
      process.exit(1);
    }

    console.log(`Found ${tutors.length} tutors\n`);

    // Step 2: Get all courses
    const { data: allCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title');

    if (coursesError || !allCourses || allCourses.length === 0) {
      console.error('❌ No courses found');
      process.exit(1);
    }

    console.log(`Found ${allCourses.length} courses\n`);
    console.log('📊 Assigning courses to tutors (NO DUPLICATES):\n');

    // Step 3: Get admin user to reset defaults
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    // Reset all courses to admin first
    console.log('🔄 Resetting all courses to admin...');
    const { error: resetError } = await supabase
      .from('courses')
      .update({
        instructor_id: adminUser.id,
        instructor_name: adminUser.name,
      });

    if (resetError) {
      console.log('⚠️  Some courses might already be assigned');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Assign each course to exactly ONE tutor (round-robin)
    let assignmentCount = 0;

    for (let i = 0; i < allCourses.length; i++) {
      const course = allCourses[i];
      const tutorIndex = i % tutors.length; // Round-robin assignment
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
          console.error(`❌ Error assigning "${course.title}":`, updateError.message);
        } else {
          assignmentCount++;
          console.log(`✅ "${course.title}" → ${tutor.name} (Tutor #${tutorIndex + 1})`);
        }
      } catch (error) {
        console.error(`❌ Error:`, error.message);
      }

      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ CLEAN ASSIGNMENT COMPLETE - NO DUPLICATES');
    console.log('='.repeat(70));
    console.log(`✅ Courses assigned: ${assignmentCount}/${allCourses.length}`);
    console.log(`👨‍🏫 Total tutors: ${tutors.length}`);

    // Step 5: Verify - check each tutor's course count
    console.log('\n📋 Tutor Course Distribution:');
    console.log('='.repeat(70));

    for (const tutor of tutors) {
      const { data: tutorCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', tutor.id);

      const count = tutorCourses?.length || 0;
      console.log(`${tutor.name}: ${count} courses`);

      if (count > 0 && count <= 5) {
        // Show course titles
        const { data: courses } = await supabase
          .from('courses')
          .select('title')
          .eq('instructor_id', tutor.id);

        courses?.forEach(c => {
          console.log(`  • ${c.title}`);
        });
      }
    }

    console.log('='.repeat(70));

    // Final verification - check for any duplicates
    console.log('\n🔍 Final Verification:');
    const { data: allAssignedCourses } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .order('title', { ascending: true });

    const titleMap = {};
    allAssignedCourses?.forEach(course => {
      if (!titleMap[course.title]) {
        titleMap[course.title] = [];
      }
      titleMap[course.title].push(course);
    });

    const dupsCheck = Object.entries(titleMap).filter(([_, courses]) => courses.length > 1);

    if (dupsCheck.length === 0) {
      console.log('✅ VERIFIED: No duplicate courses assigned!');
    } else {
      console.log(`⚠️  FOUND ${dupsCheck.length} duplicate titles!`);
      dupsCheck.forEach(([title, courses]) => {
        console.log(`   "${title}": ${courses.length} instances`);
      });
    }

    console.log('='.repeat(70));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

cleanAssignCoursesToTutors().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
