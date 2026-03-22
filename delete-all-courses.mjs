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

async function deleteAllCourses() {
  try {
    console.log('🔍 Fetching all courses...\n');

    // Get all courses
    const { data: allCourses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title');

    if (fetchError) {
      console.error('❌ Error fetching courses:', fetchError.message);
      process.exit(1);
    }

    if (!allCourses || allCourses.length === 0) {
      console.log('✅ No courses found. Database is already empty.');
      process.exit(0);
    }

    console.log(`Found ${allCourses.length} courses to delete:\n`);

    allCourses.forEach((course, idx) => {
      console.log(`${idx + 1}. ${course.title}`);
    });

    console.log('\n❌ DELETING ALL COURSES...\n');

    // Delete all courses
    const { error: deleteError, count } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (this condition is always true)

    if (deleteError) {
      console.error('❌ Error deleting courses:', deleteError.message);
      process.exit(1);
    }

    console.log(`✅ Deleted ${allCourses.length} courses from database\n`);

    // Verify deletion
    const { data: remaining } = await supabase
      .from('courses')
      .select('id');

    console.log('='.repeat(60));
    console.log('✨ DELETION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Courses deleted: ${allCourses.length}`);
    console.log(`📚 Remaining courses in database: ${remaining?.length || 0}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

deleteAllCourses().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
