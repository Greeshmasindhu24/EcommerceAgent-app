const { sequelize } = require('./config/db');
const { Product, User } = require('./models');
require('dotenv').config();

const products = [
  {
    name: 'Aura Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: 'Premium noise-canceling wireless headphones with high-fidelity audio and incredible battery life.',
    category: 'Electronics',
    price: 299.99,
    stock: 15
  },
  {
    name: 'Nova Smartwatch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: 'Advanced health monitoring, GPS tracking, and seamless smartphone integration in a sleek design.',
    category: 'Wearables',
    price: 199.50,
    stock: 20
  },
  {
    name: 'Zenith Keyboard',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
    description: 'Mechanical keyboard with customizable RGB lighting and tactile switches for the ultimate typing experience.',
    category: 'Peripherals',
    price: 149.00,
    stock: 10
  },
  {
    name: 'Lumina Desk Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    description: 'Minimalist smart desk lamp with adjustable brightness and color temperature for perfect focus.',
    category: 'Home Office',
    price: 79.99,
    stock: 30
  },
  {
    name: 'Urban Backpack',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    description: 'Water-resistant, anti-theft backpack with a dedicated laptop compartment and ergonomic design.',
    category: 'Accessories',
    price: 89.00,
    stock: 25
  },
  {
    name: 'Vortex Coffee Maker',
    image: 'https://images.unsplash.com/photo-1579938153644-126902264426?w=800&q=80',
    description: 'Precision brewing technology with programmable settings for your perfect morning cup.',
    category: 'Lifestyle',
    price: 129.99,
    stock: 8
  }
];

const seedData = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Careful: drops tables
    
    await Product.bulkCreate(products);
    
    console.log('Data Seeded Successfully to Postgres!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
