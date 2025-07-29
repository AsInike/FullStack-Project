import { User } from './models/index.js';
import { db } from './config/database.js';

// Fix user points to match the correct calculation
const fixUserPoints = async () => {
  try {
    console.log('🔄 Fixing user points...');
    
    // Update user ID 1 (Porcheu) to have 7 points
    const user = await User.findByPk(1);
    
    if (user) {
      console.log(`👤 Found user: ${user.name}`);
      console.log(`📊 Current points: ${user.points}`);
      
      await user.update({ points: 7 });
      
      console.log(`✅ Updated points to: 7`);
      console.log('🎉 User points fixed!');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await db.close();
  }
};

fixUserPoints();
