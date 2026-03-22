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

// New replacement courses for better diversity
const replacementCourses = [
  {
    old_title: 'Mobile App Performance Optimization',
    new_title: 'Blockchain Development Basics',
    description: 'Learn blockchain fundamentals and smart contract development. Build decentralized applications.',
    category: 'Blockchain',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1516534775068-bb57e39c5f75?w=800&h=400&fit=crop',
  },
  {
    old_title: 'Cross-Platform Mobile Development',
    new_title: 'IoT & Embedded Systems',
    description: 'Build IoT solutions and work with embedded systems using modern frameworks and tools.',
    category: 'IoT',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=right',
  },
];

async function replaceDuplicateTopics() {
  try {
    console.log('🔄 Replacing redundant mobile app courses with diverse topics...\n');

    for (const replacement of replacementCourses) {
      try {
        // Find course with old title
        const { data: oldCourse, error: findError } = await supabase
          .from('courses')
          .select('id')
          .eq('title', replacement.old_title)
          .limit(1)
          .single();

        if (findError || !oldCourse) {
          console.error(`❌ Could not find course "${replacement.old_title}"`);
          continue;
        }

        // Update the course with new information
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            title: replacement.new_title,
            description: replacement.description,
            category: replacement.category,
            level: replacement.level,
            cover_image: replacement.image,
          })
          .eq('id', oldCourse.id);

        if (updateError) {
          console.error(`❌ Error updating course:`, updateError.message);
          continue;
        }

        console.log(`✅ Replaced: "${replacement.old_title}"`);
        console.log(`   ➜ New Course: "${replacement.new_title}" (${replacement.category})`);
      } catch (error) {
        console.error(`❌ Unexpected error:`, error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ COURSE DIVERSITY IMPROVED');
    console.log('='.repeat(60));

    // Get course categories distribution
    const { data: allCourses } = await supabase
      .from('courses')
      .select('category')
      .eq('is_published', true);

    if (allCourses) {
      const categoryCount = {};
      allCourses.forEach(course => {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
      });

      console.log('\n📊 Course Distribution by Category:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} courses`);
      });
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

replaceDuplicateTopics().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
