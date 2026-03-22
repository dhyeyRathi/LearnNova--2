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

async function deleteAllDuplicates() {
  try {
    console.log('🔍 Scanning for ALL duplicate courses (including unpublished)...\n');

    // Get ALL courses regardless of published status
    const { data: allCourses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title, is_published')
      .order('title', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching courses:', fetchError.message);
      process.exit(1);
    }

    console.log(`Total courses in database: ${allCourses.length}\n`);

    // Group by title to find duplicates
    const titleMap = {};
    allCourses.forEach(course => {
      if (!titleMap[course.title]) {
        titleMap[course.title] = [];
      }
      titleMap[course.title].push(course);
    });

    // Find which titles have duplicates
    const duplicates = Object.entries(titleMap).filter(([_, courses]) => courses.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      process.exit(0);
    }

    console.log(`⚠️  Found ${duplicates.length} course titles with duplicates:\n`);
    duplicates.forEach(([title, courses]) => {
      console.log(`"${title}" - ${courses.length} instances`);
    });

    console.log('\n🗑️  Deleting duplicate course rows...\n');

    let deletedCount = 0;
    let failedCount = 0;

    // For each duplicate title, keep only the first one
    for (const [title, coursesWithTitle] of duplicates) {
      // Keep the first, delete the rest
      const toDelete = coursesWithTitle.slice(1);

      for (const dup of toDelete) {
        try {
          const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .eq('id', dup.id);

          if (deleteError) {
            console.error(`❌ Failed to delete "${title}" (ID: ${dup.id}):`, deleteError.message);
            failedCount++;
          } else {
            deletedCount++;
            console.log(`✅ Deleted duplicate: "${title}" (ID: ${dup.id})`);
          }
        } catch (error) {
          console.error(`❌ Error:`, error.message);
          failedCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ DUPLICATE DELETION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Deleted: ${deletedCount} duplicate rows`);
    console.log(`❌ Failed: ${failedCount}`);

    // Get final count
    const { data: finalCourses } = await supabase
      .from('courses')
      .select('id');

    console.log(`\n📚 Final total courses in database: ${finalCourses?.length || 0}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

deleteAllDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
