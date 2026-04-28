import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        products: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total
      };
      
      await axios.post('/api/orders', orderData);
      setSuccess(true);
      clearCart();
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-lg max-w-2xl mx-auto border border-green-100">
        <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-8 px-10">
          Thank you for your purchase. We've received your order and will begin processing it immediately.
          You can track your order status in your profile.
        </p>
        <button onClick={() => navigate('/profile')} className="btn-primary px-10 py-3 text-lg font-bold">
          View My Orders
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Truck className="mr-2 text-primary" /> Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input type="text" defaultValue={user.name} className="input-field" required />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Address</label>
                <input type="text" placeholder="Street Address" className="input-field" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <input type="text" className="input-field" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Postal Code</label>
                <input type="text" className="input-field" required />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CreditCard className="mr-2 text-primary" /> Payment Method
            </h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm mb-4">
              This is a dummy payment flow. No actual money will be charged.
            </div>
            <div className="space-y-4">
              <label className="block text-gray-700 mb-2">Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="MM/YY" className="input-field" required />
                <input type="text" placeholder="CVC" className="input-field" required />
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-md border sticky top-24">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">Order Summary</h2>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x {item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t mb-8">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-xl text-lg font-bold shadow-lg"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
