import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Package, Calendar, Tag } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <div className="text-gray-600 flex flex-col space-y-1">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Account Type:</span> <span className="capitalize text-primary font-medium">{user.role}</span></p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Package className="mr-2 text-primary" /> My Orders
      </h2>
      
      {loading ? (
        <div className="text-center py-10">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:border-primary">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono text-sm">#{order._id}</p>
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-600">
                  <p>{order.products.length} Items</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
