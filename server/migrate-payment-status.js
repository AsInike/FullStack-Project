import { db } from './config/database.js';

// Migration script to update payment status values from old to new enum
const migratePaymentStatus = async () => {
  try {
    console.log('🔄 Starting payment status migration...');
    
    // Step 1: Add a temporary column
    console.log('🔧 Adding temporary column...');
    await db.query(`ALTER TABLE Orders ADD COLUMN paymentStatus_temp VARCHAR(50) DEFAULT NULL`);
    
    // Step 2: Copy and convert data to temp column
    console.log('📋 Converting data to new values...');
    await db.query(`
      UPDATE Orders 
      SET paymentStatus_temp = CASE 
        WHEN paymentStatus = 'pending' THEN 'pending_verification'
        WHEN paymentStatus = 'approved' THEN 'verified' 
        WHEN paymentStatus = 'rejected' THEN 'not_verified'
        WHEN paymentStatus = 'pending_verification' THEN 'pending_verification'
        WHEN paymentStatus = 'verified' THEN 'verified'
        WHEN paymentStatus = 'not_verified' THEN 'not_verified'
        ELSE 'pending_verification'
      END
    `);
    
    // Step 3: Drop the old column
    console.log('🗑️ Dropping old paymentStatus column...');
    await db.query(`ALTER TABLE Orders DROP COLUMN paymentStatus`);
    
    // Step 4: Rename temp column and add enum constraint
    console.log('🔧 Creating new paymentStatus column with enum...');
    await db.query(`
      ALTER TABLE Orders 
      CHANGE paymentStatus_temp paymentStatus 
      ENUM('pending_verification', 'verified', 'not_verified') 
      NOT NULL DEFAULT 'pending_verification'
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Payment status migration finished!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Cleanup: try to remove temp column if it exists
    try {
      await db.query(`ALTER TABLE Orders DROP COLUMN paymentStatus_temp`);
      console.log('🧹 Cleaned up temporary column');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup not needed or failed');
    }
    
  } finally {
    await db.close();
  }
};

migratePaymentStatus();
