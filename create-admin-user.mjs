import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() { //fesfsefs
  const email = 'admin@learnnova.com';
  const password = 'admin@123';
  const name = 'Admin User';

  try {
    console.log('Creating admin user...');

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role: 'admin',
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authUser.user.id);

    // 2. Create user profile in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        role: 'admin',
        points: 0,
        badge_level: 0,
        is_verified: true,
        is_active: true,
      })
      .select();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return;
    }

    console.log('✅ User profile created:', profile);
    console.log('\n✅ Admin user successfully created!');
    console.log('📧 Email: admin@learnnova.com');
    console.log('🔐 Password: admin@123');
    console.log('✨ User is verified and active');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
