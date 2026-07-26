const supabase = require('./supabaseClient');

const checkDatabase = async () => {
  console.log('--- DATABASE DIAGNOSTIC START ---');
  try {
    // 1. Test Supabase reachability and check users table
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, role');

    if (userErr) {
      console.error('ERROR querying users table:', userErr.message);
      console.log('\nTIP: Make sure you ran the SQL commands inside your Supabase SQL Editor to create the users table!');
      return;
    }

    console.log(`Connection successful! Found ${users.length} user(s) in the database:`);
    users.forEach((u, i) => {
      console.log(`  [${i + 1}] ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
    });

    if (users.length === 0) {
      console.log('\nTIP: The table exists, but is empty. Please run the SQL INSERT statements in your Supabase SQL editor to seed the admin account!');
    }

  } catch (err) {
    console.error('Unexpected diagnostic error:', err);
  }
  console.log('--- DATABASE DIAGNOSTIC END ---');
};

checkDatabase();
