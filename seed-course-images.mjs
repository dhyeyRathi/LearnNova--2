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

// Unique image URLs for each course (using Unsplash and other sources)
// These are high-quality course-relevant images
const courseImages = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop', // Web Development
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=top', // Advanced React
  'https://images.unsplash.com/photo-1526374965328-7f5ae4e8b08f?w=800&h=400&fit=crop', // Python Programming
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', // Data Science
  'https://images.unsplash.com/photo-1512941691920-25d81d41605a?w=800&h=400&fit=crop', // Mobile App
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop', // Cloud Computing
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=bottom', // Full Stack
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop', // UI/UX Design
  'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=800&h=400&fit=crop', // Database Design
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop', // DevOps
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=85', // JavaScript ES6
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=400&fit=crop', // TypeScript
  'https://images.unsplash.com/photo-1517694712162-7d88e20ce848?w=800&h=400&fit=crop', // Vue.js
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop', // Angular
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=400&fit=crop', // API Development
  'https://images.unsplash.com/photo-1552484081-8f10a77fdbdd?w=800&h=400&fit=crop', // Machine Learning
  'https://images.unsplash.com/photo-1517694712505-52268b440893?w=800&h=400&fit=crop', // Web Security
  'https://images.unsplash.com/photo-1564721040803-37257b207066?w=800&h=400&fit=crop', // Git & Version Control
];

async function updateCourseImages() {
  try {
    console.log('🖼️  Updating course images with unique URLs...\n');

    // Fetch all courses
    const { data: courses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .order('created_at', { ascending: true });

    if (fetchError || !courses) {
      console.error('❌ Error fetching courses:', fetchError?.message);
      process.exit(1);
    }

    if (courses.length === 0) {
      console.error('❌ No courses found in database');
      process.exit(1);
    }

    console.log(`Found ${courses.length} courses. Assigning unique images...\n`);

    let updatedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < courses.length; i++) {
      try {
        const course = courses[i];
        const imageUrl = courseImages[i] || courseImages[i % courseImages.length];

        const { error: updateError } = await supabase
          .from('courses')
          .update({
            cover_image: imageUrl,
          })
          .eq('id', course.id);

        if (updateError) {
          console.error(`❌ Course ${i + 1}/${courses.length} - Error updating ${course.title}:`, updateError.message);
          failedCount++;
        } else {
          updatedCount++;
          console.log(`✅ Course ${i + 1}/${courses.length} - Updated: ${course.title}`);
          console.log(`   🖼️  Image: ${imageUrl.substring(0, 60)}...`);
        }
      } catch (error) {
        console.error(`❌ Course ${i + 1}/${courses.length} - Unexpected error:`, error.message);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      if ((i + 1) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ COURSE IMAGES UPDATE COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Courses updated: ${updatedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`🖼️  Total unique images: ${Math.min(courses.length, courseImages.length)}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

updateCourseImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
