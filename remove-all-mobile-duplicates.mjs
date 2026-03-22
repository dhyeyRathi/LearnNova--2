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

async function removeAllMobieDuplicates() {
  try {
    console.log('🔍 Finding and replacing all remaining mobile dev courses...\n');

    // Find courses with "Mobile App" in the title
    const { data: courses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', '%mobile app%')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching courses:', fetchError.message);
      process.exit(1);
    }

    if (!courses || courses.length === 0) {
      console.log('✅ No mobile app development courses found!');
      process.exit(0);
    }

    console.log(`Found ${courses.length} mobile app development courses to replace:\n`);

    // Different topics to replace with
    const replacements = [
      {
        title: 'Cybersecurity Fundamentals',
        description: 'Learn essential cybersecurity concepts, threat prevention, and secure coding practices.',
        category: 'Security',
        level: 'intermediate',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=90',
      },
      {
        title: 'Artificial Intelligence for Beginners',
        description: 'Introduction to AI concepts, neural networks, and practical AI applications.',
        category: 'AI/ML',
        level: 'beginner',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      },
    ];

    let replacedCount = 0;

    for (let i = 0; i < courses.length; i++) {
      if (i >= replacements.length) break;

      const course = courses[i];
      const replacement = replacements[i];

      try {
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            title: replacement.title,
            description: replacement.description,
            category: replacement.category,
            level: replacement.level,
            cover_image: replacement.image,
          })
          .eq('id', course.id);

        if (updateError) {
          console.error(`❌ Error updating "${course.title}":`, updateError.message);
          continue;
        }

        replacedCount++;
        console.log(`✅ Replaced: "${course.title}"`);
        console.log(`   ➜ New: "${replacement.title}" (${replacement.category})\n`);
      } catch (error) {
        console.error(`❌ Error:`, error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('='.repeat(60));
    console.log('✨ ALL MOBILE APP DUPLICATES REMOVED');
    console.log('='.repeat(60));
    console.log(`✅ Courses replaced: ${replacedCount}`);

    // Get final stats
    const { data: allCourses } = await supabase
      .from('courses')
      .select('category')
      .eq('is_published', true);

    if (allCourses) {
      const categoryCount = {};
      allCourses.forEach(course => {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
      });

      console.log('\n📊 Updated Course Distribution:');
      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`   ${category}: ${count} courses`);
        });
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

removeAllMobieDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
