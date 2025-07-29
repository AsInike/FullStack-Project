import bcryptjs from 'bcryptjs';
import { User } from '../models/index.js';
import { db } from '../config/database.js';

// You can modify these admin accounts as needed
const ADMIN_ACCOUNTS = [
  {
    name: 'Main Admin',
    email: 'admin@marche.com',
    password: 'admin123'
  },
  {
    name: 'John Admin',
    email: 'john@marche.com',
    password: 'john2024'
  },
  {
    name: 'Sarah Manager',
    email: 'sarah@marche.com',
    password: 'sarah2024'
  }
];

const createMultipleAdmins = async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database (don't use force to avoid deleting existing data)
    await db.sync({ alter: true });
    console.log('✅ Database synced');
    
    console.log('\n🔐 === Creating Multiple Admin Accounts ===\n');
    
    for (const adminData of ADMIN_ACCOUNTS) {
      try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminData.email } });
        
        if (existingAdmin) {
          console.log(`⚠️  Admin ${adminData.email} already exists`);
          if (existingAdmin.role !== 'admin') {
            await existingAdmin.update({ role: 'admin' });
            console.log(`✅ ${adminData.email} promoted to admin`);
          }
          continue;
        }
        
        // Create admin user
        const hashedPassword = await bcryptjs.hash(adminData.password, 10);
        
        const adminUser = await User.create({
          name: adminData.name,
          email: adminData.email,
          password: hashedPassword,
          role: 'admin',
          points: 0
        });
        
        console.log(`✅ Admin created: ${adminUser.name} (${adminUser.email})`);
        
      } catch (error) {
        console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
      }
    }
    
    // Show all admins
    const allAdmins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'createdAt']
    });
    
    console.log('\n👥 === ALL ADMIN ACCOUNTS ===');
    allAdmins.forEach((admin, index) => {
      const adminAccount = ADMIN_ACCOUNTS.find(acc => acc.email === admin.email);
      console.log(`${index + 1}. Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${adminAccount ? adminAccount.password : 'N/A'}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('');
    });
    
    console.log('🎉 Admin creation process completed!');
    
  } catch (error) {
    console.error('❌ Error in admin creation process:', error);
  } finally {
    process.exit();
  }
};

createMultipleAdmins();
