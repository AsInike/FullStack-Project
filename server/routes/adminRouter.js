import express from 'express';
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
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'price', 'img']
      }],
      group: ['productId', 'Product.id'],
      order: [[OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'DESC']],
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
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
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
      include: [{ model: User }, { model: OrderItem, include: [Product] }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = order.status;
    await order.update({ status });
    
    // If order is approved for the first time, award points
    if (oldStatus === 'pending' && status === 'approved') {
      const user = order.User;
      const drinkItems = order.OrderItems.filter(item => 
        ['Hot', 'Ice', 'Frappe'].includes(item.Product.category)
      );
      const totalDrinks = drinkItems.reduce((sum, item) => sum + item.quantity, 0);
      
      await user.update({ 
        points: user.points + totalDrinks 
      });
    }
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
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

export default router;
