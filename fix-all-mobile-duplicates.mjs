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

// 9 unique replacement courses
const replacements = [
  {
    title: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts, threat prevention, and secure coding practices.',
    category: 'Security',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&q=90',
  },
  {
    title: 'Artificial Intelligence & Deep Learning',
    description: 'Advanced AI concepts, neural networks, and practical deep learning applications.',
    category: 'AI/ML',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    title: 'Containerization with Docker',
    description: 'Master Docker containers, microservices architecture, and orchestration.',
    category: 'DevOps',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=left',
  },
  {
    title: 'GraphQL API Development',
    description: 'Build powerful GraphQL APIs, query language, and modern API architecture.',
    category: 'Backend',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=400&fit=crop',
  },
  {
    title: 'Web3 & Smart Contracts',
    description: 'Blockchain fundamentals, Solidity programming, and decentralized applications.',
    category: 'Blockchain',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1516534775068-bb57e39c5f75?w=800&h=400&fit=crop',
  },
  {
    title: 'Cloud Infrastructure with Terraform',
    description: 'Infrastructure as Code, Terraform, and cloud deployment automation.',
    category: 'Cloud',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
  },
  {
    title: 'Advanced CSS & Frontend Performance',
    description: 'Modern CSS techniques, responsive design, and web performance optimization.',
    category: 'Web Development',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop&crop=bottom',
  },
  {
    title: 'Kubernetes Orchestration',
    description: 'Container orchestration, microservices, and production deployments with Kubernetes.',
    category: 'DevOps',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1552764051-e92bdc10fcf8?w=800&h=400&fit=crop',
  },
  {
    title: 'Natural Language Processing',
    description: 'NLP fundamentals, text analysis, and building AI-powered NLP applications.',
    category: 'AI/ML',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=800&h=400&fit=crop',
  },
];

async function removeAllMobileDuplicates() {
  try {
    console.log('🔍 Finding ALL mobile app development courses...\n');

    // Find all courses
    const { data: allCourses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching courses:', fetchError.message);
      process.exit(1);
    }

    // Find all mobile/app dev courses and keep track
    const mobileCoursesToReplace = [];
    const otherCourses = [];

    allCourses.forEach(course => {
      const titleLower = course.title.toLowerCase();
      if (titleLower.includes('mobile') || titleLower.includes('app development')) {
        mobileCoursesToReplace.push(course);
      } else {
        otherCourses.push(course);
      }
    });

    console.log(`Found ${mobileCoursesToReplace.length} mobile/app dev courses to replace\n`);

    if (mobileCoursesToReplace.length === 0) {
      console.log('✅ No mobile app development courses found!');
      process.exit(0);
    }

    console.log('🗑️  Replacing with unique courses...\n');

    let replacedCount = 0;

    for (let i = 0; i < mobileCoursesToReplace.length; i++) {
      const course = mobileCoursesToReplace[i];
      const replacement = replacements[i % replacements.length]; // Cycle through replacements if more than 9

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
        console.log(`✅ ${i + 1}. Replaced: "${course.title}"`);
        console.log(`   ➜ New: "${replacement.title}" (${replacement.category})\n`);
      } catch (error) {
        console.error(`❌ Error:`, error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('='.repeat(60));
    console.log('✨ ALL MOBILE APP DUPLICATES REMOVED');
    console.log('='.repeat(60));
    console.log(`✅ Total replaced: ${replacedCount} courses`);

    // Get final stats
    const { data: finalCourses } = await supabase
      .from('courses')
      .select('id, title, category')
      .eq('is_published', true);

    if (finalCourses) {
      const categoryCount = {};
      const mobileCount = finalCourses.filter(c => 
        c.title.toLowerCase().includes('mobile') || 
        c.title.toLowerCase().includes('app development')
      ).length;

      finalCourses.forEach(course => {
        categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
      });

      console.log('\n📊 Updated Course Distribution:');
      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`   ${category}: ${count} courses`);
        });

      console.log(`\n🎯 Mobile/App Dev courses remaining: ${mobileCount}`);
      console.log(`📚 Total unique courses: ${finalCourses.length}`);
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

removeAllMobileDuplicates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
