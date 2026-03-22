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

// Random data generators
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skylar', 'Jamie',
  'Pepper', 'Blake', 'Drew', 'Cameron', 'Devon', 'Sage', 'Parker', 'Austin', 'Darcy', 'Finley',
  'Ashton', 'Charlie', 'Dakota', 'Emery', 'Reese', 'Harper', 'Hayes', 'Kennedy', 'Kendall', 'London',
  'Morgan', 'Oakley', 'Owen', 'Paige', 'Phoenix', 'Presley', 'Reagan', 'Rory', 'Rowan', 'Ryan',
  'Sage', 'Salem', 'Sam', 'Sampson', 'Sasha', 'Sebastian', 'Shea', 'Shiloh', 'Sidney', 'Sienna',
  'Sierra', 'Skye', 'Spencer', 'Stafford', 'Stanley', 'Stefan', 'Stella', 'Stellan', 'Stenson', 'Stevie',
  'Stewart', 'Storm', 'Story', 'Stu', 'Stuart', 'Sullivan', 'Sunny', 'Sutton', 'Swade', 'Sven'
];

const lastNames = [
  'Anderson', 'Bailey', 'Bennett', 'Brown', 'Carter', 'Chen', 'Clark', 'Cooper', 'Davis', 'Drake',
  'Edison', 'Evans', 'Fisher', 'Foster', 'Garcia', 'Gardner', 'Gibson', 'Goldman', 'Graham', 'Grant',
  'Green', 'Gregory', 'Griffin', 'Hall', 'Hamilton', 'Hansen', 'Harris', 'Harrison', 'Hart', 'Harvey',
  'Hayes', 'Henderson', 'Henry', 'Hernandez', 'Higgins', 'Hill', 'Hitch', 'Holmes', 'Hopkins', 'Howard',
  'Hughes', 'Hunter', 'Ingram', 'Jackson', 'Jacobs', 'James', 'Jefferson', 'Jenkins', 'Johnson', 'Jones',
  'Jordan', 'Joseph', 'Judge', 'Kane', 'Kelly', 'Kelvin', 'Kennedy', 'Key', 'Khan', 'King',
  'Knight', 'Knox', 'Koch', 'Kowalski', 'Kumar', 'Kunz', 'Kylie', 'Lacey', 'Laird', 'Lake',
  'Lamb', 'Lambert', 'Landers', 'Landis', 'Lane', 'Lang', 'Langley', 'Larson', 'Latham', 'Lathan'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function generateRandomEmail(name) {
  const sanitized = name.toLowerCase().replace(/\s+/g, '.');
  const random = Math.floor(Math.random() * 10000);
  return `${sanitized}.${random}@learnnova-test.com`;
}

const locations = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'London', 'Toronto', 'Sydney', 'Tokyo', 'Berlin', 'Paris', 'Singapore', 'Dubai'
];

const bios = [
  'Learning enthusiast and tech explorer',
  'Student passionate about growth',
  'Always eager to learn something new',
  'Curious learner on this platform',
  'Dedicated to self-improvement',
  'Exploring new skills daily',
  'My journey of continuous learning',
  'Committed to personal development',
  'Love learning and sharing knowledge'
];

async function seedTestUsers() {
  const totalUsers = 75;
  let createdCount = 0;
  let failedCount = 0;
  const createdUserIds = [];

  console.log(`🌱 Starting to seed ${totalUsers} test users...\n`);

  for (let i = 0; i < totalUsers; i++) {
    try {
      const name = generateRandomName();
      const email = generateRandomEmail(name);
      const password = `TestPass${Math.floor(Math.random() * 10000)}!`;

      // 1. Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'learner',
        },
      });

      if (authError) {
        console.error(`❌ User ${i + 1}/${totalUsers} - Error creating auth user (${name}):`, authError.message);
        failedCount++;
        continue;
      }

      // 2. Create user profile in users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email,
          name,
          role: 'learner',
          location: getRandomElement(locations),
          bio: getRandomElement(bios),
          points: Math.floor(Math.random() * 500),
          badge_level: Math.floor(Math.random() * 5),
          is_verified: true,
          is_active: true,
        })
        .select();

      if (profileError) {
        console.error(`❌ User ${i + 1}/${totalUsers} - Error creating profile (${name}):`, profileError.message);
        failedCount++;
        continue;
      }

      createdUserIds.push(authUser.user.id);
      createdCount++;
      console.log(`✅ User ${i + 1}/${totalUsers} - Created: ${name} (${email})`);
    } catch (error) {
      console.error(`❌ User ${i + 1}/${totalUsers} - Unexpected error:`, error.message);
      failedCount++;
    }

    // Add small delay to avoid rate limiting
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Step 2: Get all courses and enroll users in courses
  console.log(`\n📚 Fetching available courses...\n`);
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id')
    .eq('is_published', true);

  if (coursesError) {
    console.error('Error fetching courses:', coursesError.message);
  } else if (courses && courses.length > 0) {
    console.log(`Found ${courses.length} published courses. Enrolling users...\n`);

    let enrollmentCount = 0;
    for (const userId of createdUserIds) {
      try {
        // Randomly select 1-3 courses for each user
        const numCourses = Math.floor(Math.random() * 3) + 1;
        const selectedCourses = [];
        
        for (let i = 0; i < numCourses; i++) {
          const course = getRandomElement(courses);
          if (!selectedCourses.find(c => c.id === course.id)) {
            selectedCourses.push(course);
          }
        }

        for (const course of selectedCourses) {
          const { error: enrollError } = await supabase
            .from('course_enrollments')
            .insert({
              user_id: userId,
              course_id: course.id,
              progress_percentage: Math.floor(Math.random() * 100),
              is_completed: Math.random() > 0.8,
            });

          if (!enrollError) {
            enrollmentCount++;
          }
        }
      } catch (error) {
        console.error('Error enrolling user:', error.message);
      }
    }
    console.log(`✅ Enrolled users in courses: ${enrollmentCount} enrollments created`);
  } else {
    console.log('⚠️ No published courses found to enroll users in');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${createdCount} users`);
  console.log(`❌ Failed to create: ${failedCount} users`);
  console.log(`📧 Domain: learnnova-test.com`);
  console.log('='.repeat(60));
}

seedTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
