const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { sequelize } = require('../config/db');

router.post('/', protect, async (req, res) => {
  const { products, totalAmount } = req.body;

  if (products && products.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } else {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create({
        userId: req.user.id,
        totalAmount
      }, { transaction });

      const orderItems = products.map(item => ({
        orderId: order.id,
        productId: item.product,
        quantity: item.quantity,
        price: item.price
      }));

      await OrderItem.bulkCreate(orderItems, { transaction });

      await transaction.commit();
      res.status(201).json(order);
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: OrderItem, as: 'items' }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
