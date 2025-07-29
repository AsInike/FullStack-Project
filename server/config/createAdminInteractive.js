import bcryptjs from 'bcryptjs';
import { User } from '../models/index.js';
import { db } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdminUser = async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database (don't use force to avoid deleting existing data)
    await db.sync({ alter: true });
    console.log('✅ Database synced');
    
    console.log('\n🔐 === Admin Creation System ===\n');
    
    // Get admin details from user input
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    
    // Validate input
    if (!name || !email || !password) {
      console.log('❌ All fields are required!');
      process.exit(1);
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      console.log('❌ User with this email already exists!');
      
      if (existingUser.role === 'admin') {
        console.log('This user is already an admin.');
      } else {
        const makeAdmin = await question('This user exists as a customer. Make them admin? (y/n): ');
        if (makeAdmin.toLowerCase() === 'y' || makeAdmin.toLowerCase() === 'yes') {
          await existingUser.update({ role: 'admin' });
          console.log('✅ User promoted to admin successfully!');
        }
      }
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      points: 0
    });
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('Admin login credentials:');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`ID: ${adminUser.id}`);
    
    // Show all admins
    const allAdmins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'createdAt']
    });
    
    console.log('\n👥 All Admin Users:');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit();
  }
};

createAdminUser();
