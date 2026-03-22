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

async function removeDuplicateCourses() {
  try {
    console.log('🔍 Finding and removing duplicate courses...\n');

    // Fetch all courses
    const { data: courses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (fetchError || !courses) {
      console.error('❌ Error fetching courses:', fetchError?.message);
      process.exit(1);
    }

    console.log(`Found ${courses.length} total courses\n`);

    // Find duplicates
    const titleMap = {};
    const duplicates = [];
    const unique = [];

    courses.forEach(course => {
      if (titleMap[course.title]) {
        // This is a duplicate
        duplicates.push(course);
        console.log(`📌 Duplicate found: "${course.title}" (ID: ${course.id})`);
      } else {
        // First occurrence
        titleMap[course.title] = course.id;
        unique.push(course);
      }
    });

    console.log(`\n✅ Unique courses: ${unique.length}`);
    console.log(`🔄 Duplicate courses found: ${duplicates.length}\n`);

    if (duplicates.length === 0) {
      console.log('✨ No duplicates found! All courses are unique.');
      process.exit(0);
    }

    // Delete duplicates
    console.log('🗑️  Deleting duplicate courses...\n');

    let deletedCount = 0;
    let failedCount = 0;

    for (const course of duplicates) {
      try {
        const { error: deleteError } = await supabase
          .from('courses')
          .delete()
          .eq('id', course.id);

        if (deleteError) {
          console.error(`❌ Failed to delete "${course.title}":`, deleteError.message);
          failedCount++;
        } else {
          deletedCount++;
          console.log(`✅ Deleted: "${course.title}" (ID: ${course.id})`);
        }
      } catch (error) {
        console.error(`❌ Error deleting course:`, error.message);
        failedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ DUPLICATE REMOVAL COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${deletedCount} duplicates`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📚 Remaining unique courses: ${unique.length}`);
    console.log('='.repeat(60));

    // Get final count
    const { data: finalCourses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_published', true);

    console.log(`\n🎉 Final course count: ${finalCourses?.length || 0} unique courses`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

removeDuplicateCourses().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
