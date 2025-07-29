import express from 'express';
import bcryptjs from 'bcryptjs';
import { User, Order, OrderItem, Product } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new admin account (requires existing admin to create)
router.post('/create-admin', requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({ error: 'User is already an admin' });
      } else {
        // Promote existing customer to admin
        await existingUser.update({ role: 'admin' });
        return res.json({ 
          message: 'Customer promoted to admin successfully',
          admin: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role
          }
        });
      }
    }
    
    // Create new admin user
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      points: 0
    });
    
    res.json({ 
      message: 'Admin created successfully',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
    
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Get all admins
router.get('/admins', requireAdmin, async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Get dashboard statistics
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get total customers
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    
    // Get total orders
    const totalOrders = await Order.count();
    
    // Get pending orders
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    
    // Get monthly income (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyIncome = await Order.sum('total', {
      where: {
        status: { [Op.in]: ['approved', 'preparing', 'ready', 'delivered'] },
        createdAt: { [Op.gte]: currentMonth }
      }
    }) || 0;
    
    // Get best selling products
    const bestSellingProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('qty')), 'totalSold']
      ],
      include: [{
        model: Product,
        as: 'Product',
        attributes: ['name', 'price', 'img']
      }],
      group: ['productId', 'Product.id'],
      order: [[OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('qty')), 'DESC']],
      limit: 5
    });

    res.json({
      totalCustomers,
      totalOrders,
      pendingOrders,
      monthlyIncome: Number(monthlyIncome).toFixed(2),
      bestSellingProducts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all customers with their points
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: ['id', 'name', 'email', 'points', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get all orders for admin review
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'OrderItems',
          include: [{
            model: Product,
            as: 'Product',
            attributes: ['name', 'price', 'img']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:orderId/status', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(orderId, {
      include: [
        { 
          model: User,
          as: 'user'
        }, 
        { 
          model: OrderItem,
          as: 'OrderItems',
          include: [{
            model: Product,
            as: 'Product'
          }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = order.status;
    
    // Business Logic: If payment is rejected, order cannot proceed beyond pending
    if (order.paymentStatus === 'not_verified' && status !== 'pending' && status !== 'cancelled') {
      return res.status(400).json({ 
        error: 'Cannot process order with rejected payment. Only pending or cancelled status allowed.' 
      });
    }
    
    // Business Logic: Only verified payments can be delivered
    if (status === 'delivered' && order.paymentStatus !== 'verified') {
      return res.status(400).json({ 
        error: 'Cannot deliver order without verified payment.' 
      });
    }
    
    await order.update({ status });

    // Award points when order is delivered (final state) AND payment is verified
    // BUT NEVER for free drink orders (they have order.points = 0)
    if (oldStatus !== 'delivered' && status === 'delivered' && 
        order.paymentStatus === 'verified' && 
        order.total > 0) { // Free drinks have total = 0, so this prevents point awarding for free drinks
      
      const user = order.user;
      const drinkItems = order.OrderItems.filter(item => 
        ['Hot', 'Ice', 'Frappe'].includes(item.Product.category)
      );
      const totalDrinks = drinkItems.reduce((sum, item) => sum + item.qty, 0);
      
      console.log('Order delivered with verified payment - awarding points:', { 
        orderId: order.id,
        orderTotal: order.total,
        totalDrinks, 
        currentPoints: user.points,
        newPoints: user.points + totalDrinks,
        isFreeDrink: order.total === 0 ? 'YES (NO POINTS AWARDED)' : 'NO'
      });
      
      // Update user's total points
      await user.update({ 
        points: user.points + totalDrinks 
      });
      
      // Also store the points earned in this specific order
      await order.update({ 
        points: totalDrinks 
      });
      
      console.log('Points successfully updated for user and order:', { 
        userId: user.id, 
        orderId: order.id, 
        pointsEarned: totalDrinks 
      });
    } else if (oldStatus !== 'delivered' && status === 'delivered' && order.total === 0) {
      console.log('Free drink order delivered - NO POINTS AWARDED:', { 
        orderId: order.id,
        orderTotal: order.total,
        userId: order.user.id
      });
    } else if (oldStatus !== 'delivered' && status === 'delivered' && order.paymentStatus !== 'verified') {
      console.log('Order delivered but payment not verified - no points awarded:', { 
        orderId: order.id,
        paymentStatus: order.paymentStatus
      });
    }    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order payment status
router.put('/orders/:orderId/payment-status', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    
    console.log('Updating payment status:', { orderId, paymentStatus });
    
    if (!['pending_verification', 'verified', 'not_verified'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    const order = await Order.findByPk(orderId, {
      include: [
        { 
          model: User,
          as: 'user'
        }, 
        { 
          model: OrderItem,
          as: 'OrderItems',
          include: [{
            model: Product,
            as: 'Product'
          }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await order.update({ paymentStatus });
    
    // Business Logic: If payment is rejected, automatically set order status to cancelled
    if (paymentStatus === 'not_verified' && order.status !== 'cancelled') {
      await order.update({ status: 'cancelled' });
      console.log('Payment rejected - order automatically cancelled:', { orderId, oldStatus: order.status });
    }
    
    console.log('Payment status updated successfully:', { orderId, paymentStatus });
    
    res.json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Reset user points (when they claim free drink)
router.put('/customers/:userId/reset-points', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    await user.update({ points: 0 });
    
    res.json({ message: 'Points reset successfully', user });
  } catch (error) {
    console.error('Error resetting points:', error);
    res.status(500).json({ error: 'Failed to reset points' });
  }
});

// Claim free drink (deduct 10 points)
router.put('/customers/:userId/claim-free-drink', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (user.points < 10) {
      return res.status(400).json({ error: 'Customer does not have enough points for a free drink' });
    }
    
    await user.update({ points: user.points - 10 });
    
    console.log(`Free drink claimed for user ${userId}. Points: ${user.points} -> ${user.points - 10}`);
    
    res.json({ 
      message: 'Free drink claimed successfully', 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points - 10
      }
    });
  } catch (error) {
    console.error('Error claiming free drink:', error);
    res.status(500).json({ error: 'Failed to claim free drink' });
  }
});

export default router;
