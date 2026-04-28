const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Load associations

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main function to run the app
const startApp = async () => {
  try {
    await connectDB();
    
    // Use { force: true } only in development if you want to drop and recreate tables
    await sequelize.sync({ alter: true });
    console.log('Database Synced');

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    app.get('/', (req, res) => {
      res.send('Ecommerce API (PostgreSQL) is running...');
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the application:', err);
  }
};

startApp();
