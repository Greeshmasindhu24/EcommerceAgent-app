const express = require('express');
const router = express.Router();
const products = require('../data/products.json');

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).send('Product not found');
  res.json(product);
});

module.exports = router;
