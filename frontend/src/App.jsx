import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Setup default axios config
import axios from 'axios';
axios.defaults.baseURL = 'http://192.168.0.103:5000';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-gray-400 py-10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">E-Shop</h2>
            <p className="mb-6">Modern e-commerce solution built with MERN stack.</p>
            <div className="border-t border-gray-800 pt-8 mt-4 text-sm text-gray-500">
              &copy; {new Date().getFullYear()} E-Shop Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
