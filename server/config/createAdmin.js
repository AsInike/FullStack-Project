import bcryptjs from 'bcryptjs';
import { User } from '../models/index.js';
import { db } from '../config/database.js';

const createAdminUser = async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database
    await db.sync({ force: true }); // Use force to recreate tables
    console.log('✅ Database synced');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Admin details:', {
        id: existingAdmin.id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@marche.com',
      password: hashedPassword,
      role: 'admin',
      points: 0
    });
    
    console.log('🎉 Admin user created successfully!');
    console.log('Admin login credentials:');
    console.log('Email: admin@marche.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit();
  }
};

createAdminUser();
