import { db } from './config/database.js';
import { Order, OrderItem, Product } from './models/index.js';

// Backfill points for existing delivered orders
const backfillOrderPoints = async () => {
  try {
    console.log('🔄 Starting order points backfill...');
    
    // Find all delivered orders without points set
    const deliveredOrders = await Order.findAll({
      where: {
        status: 'delivered',
        points: [null, 0] // Orders without points or with 0 points
      },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }]
    });
    
    console.log(`📊 Found ${deliveredOrders.length} delivered orders to backfill`);
    
    for (const order of deliveredOrders) {
      // Calculate points for this order (same logic as in admin routes)
      const drinkItems = order.OrderItems.filter(item => 
        ['Hot', 'Ice', 'Frappe'].includes(item.Product.category)
      );
      const totalDrinks = drinkItems.reduce((sum, item) => sum + item.qty, 0);
      
      if (totalDrinks > 0) {
        await order.update({ points: totalDrinks });
        console.log(`✅ Updated order ${order.id}: ${totalDrinks} points`);
      }
    }
    
    console.log('🎉 Order points backfill completed!');
    
  } catch (error) {
    console.error('❌ Backfill failed:', error);
  } finally {
    await db.close();
  }
};

backfillOrderPoints();
