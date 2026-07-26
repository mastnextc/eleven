const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

const seedUsers = async () => {
  try {
    console.log('Seeding Supabase test accounts...');

    // 1. Delete any existing test accounts to avoid duplicates
    await supabase.from('users').delete().in('email', ['admin@fashion.com', 'customer@fashion.com']);

    // 2. Hash passwords
    const adminPasswordHash = await bcrypt.hash('adminpassword', 10);
    const customerPasswordHash = await bcrypt.hash('customerpassword', 10);

    // 3. Insert Admin Account
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .insert({
        name: 'Admin User',
        email: 'admin@fashion.com',
        password: adminPasswordHash,
        role: 'admin',
        addresses: [],
        wishlist: [],
        cart: []
      })
      .select()
      .single();

    if (adminErr) {
      console.error('Error inserting Admin:', adminErr.message);
    } else {
      console.log('Admin account (admin@fashion.com / adminpassword) created successfully!');
    }

    // 4. Insert Customer Account
    const { data: customerUser, error: custErr } = await supabase
      .from('users')
      .insert({
        name: 'Radhika Patel',
        email: 'customer@fashion.com',
        password: customerPasswordHash,
        role: 'customer',
        addresses: [
          {
            id: 'ADDR_1',
            name: 'Radhika Patel',
            phone: '9876543210',
            addressLine: '102, Shanti Heights, Ring Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            zipCode: '380015',
            isDefault: true
          }
        ],
        wishlist: [],
        cart: []
      })
      .select()
      .single();

    if (custErr) {
      console.error('Error inserting Customer:', custErr.message);
    } else {
      console.log('Customer account (customer@fashion.com / customerpassword) created successfully!');
    }

  } catch (error) {
    console.error('Unexpected seeding error:', error);
  }
};

seedUsers();
