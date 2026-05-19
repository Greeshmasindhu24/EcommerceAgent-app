const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  const { name, price, description, image, category, stock } = req.body;
  
  try {
    const product = await Product.create({
      name, price, description, image, category, stock
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
