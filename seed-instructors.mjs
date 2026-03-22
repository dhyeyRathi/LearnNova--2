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

// Instructor names
const instructorNames = [
  'Dr. Sarah Chen',
  'Prof. James Wilson',
  'Emma Rodriguez',
  'Michael Johnson',
  'Dr. Priya Patel',
  'Alex Thompson',
  'Dr. Lisa Anderson',
  'David Kumar',
];

const specializations = [
  'Full Stack Web Development',
  'Mobile Development',
  'Data Science & AI',
  'Cloud Architecture',
  'UI/UX Design',
  'DevOps & Infrastructure',
  'Machine Learning',
  'Backend Development',
];

const bios = [
  'Passionate about teaching modern web technologies with real-world projects',
  'Expert in building scalable applications with years of industry experience',
  'Dedicated to helping students master the latest development frameworks',
  'Specialized in practical training with hands-on coding projects',
  'Committed to making complex concepts simple and understandable',
  'Industry veteran focused on best practices and professional development',
  'Enthusiastic educator with a knack for breaking down difficult topics',
  'Mentor and instructor dedicated to launching tech careers',
];

async function seedInstructors() {
  try {
    console.log('👨‍🏫 Creating 8 instructors...\n');

    const createdInstructors = [];
    let createdCount = 0;
    let failedCount = 0;

    for (let i = 0; i < instructorNames.length; i++) {
      try {
        const name = instructorNames[i];
        const email = `instructor${i + 1}@learnnova-inst.com`;
        const password = `InstrPass${Math.floor(Math.random() * 10000)}!`;

        // 1. Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            role: 'tutor',
          },
        });

        if (authError) {
          console.error(`❌ Instructor ${i + 1}/8 - Error creating auth user (${name}):`, authError.message);
          failedCount++;
          continue;
        }

        // 2. Create instructor profile in users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email,
            name,
            role: 'tutor',
            bio: bios[i],
            location: 'Remote',
            points: Math.floor(Math.random() * 1000) + 500,
            badge_level: Math.floor(Math.random() * 5) + 1,
            is_verified: true,
            is_active: true,
          })
          .select();

        if (profileError) {
          console.error(`❌ Instructor ${i + 1}/8 - Error creating profile (${name}):`, profileError.message);
          failedCount++;
          continue;
        }

        createdInstructors.push({
          id: authUser.user.id,
          name,
          email,
          specialization: specializations[i],
        });
        createdCount++;
        console.log(`✅ Instructor ${i + 1}/8 - Created: ${name} (${email})`);
        console.log(`   📚 Specialization: ${specializations[i]}`);
      } catch (error) {
        console.error(`❌ Instructor ${i + 1}/8 - Unexpected error:`, error.message);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      if ((i + 1) % 4 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Step 2: Get all published courses
    console.log(`\n📚 Fetching courses to assign to instructors...\n`);
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_published', true);

    if (coursesError || !courses) {
      console.error('Error fetching courses:', coursesError?.message || 'No courses found');
    } else {
      console.log(`Found ${courses.length} courses. Assigning to instructors...\n`);

      // Assign courses to instructors
      let assignmentCount = 0;
      for (let i = 0; i < createdInstructors.length; i++) {
        const instructor = createdInstructors[i];

        // Each instructor teaches 1-3 courses
        const numCourses = Math.floor(Math.random() * 3) + 1;
        const assignedCourses = [];

        for (let j = 0; j < numCourses; j++) {
          const course = courses[Math.floor(Math.random() * courses.length)];
          if (!assignedCourses.find(c => c.id === course.id)) {
            assignedCourses.push(course);
          }
        }

        for (const course of assignedCourses) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({
              instructor_id: instructor.id,
              instructor_name: instructor.name,
            })
            .eq('id', course.id);

          if (!updateError) {
            assignmentCount++;
            console.log(`   ✓ Assigned "${course.title}" to ${instructor.name}`);
          }
        }
      }
      console.log(`\n✅ Course assignments: ${assignmentCount} courses assigned`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ INSTRUCTOR SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Instructors created: ${createdCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📧 Domain: learnnova-inst.com`);
    console.log(`🎓 Specializations assigned to each instructor`);
    console.log('='.repeat(60));

    console.log('\n📋 Instructor Credentials:');
    createdInstructors.forEach((inst, idx) => {
      console.log(`${idx + 1}. ${inst.name}`);
      console.log(`   Email: ${inst.email}`);
      console.log(`   Role: Tutor/Instructor`);
    });
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedInstructors().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
