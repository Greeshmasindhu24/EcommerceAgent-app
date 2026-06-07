import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, ShoppingBag, Edit, Trash, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: 0, description: '', image: '', category: '', stock: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/orders')
        ]);
        setProducts(prodRes.data);
        setOrders(orderRes.data);
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/products', newProduct);
      setProducts([...products, data]);
      setShowAddModal(false);
      setNewProduct({ name: '', price: 0, description: '', image: '', category: '', stock: 0 });
    } catch (error) {
      alert('Error adding product');
    }
  };

  if (loading) return <div className="text-center py-10">Loading admin panel...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" /> Add Product
        </button>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <ShoppingBag className="mr-2 text-primary" /> Manage Products
        </h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Package className="mr-2 text-primary" /> All Orders
        </h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Order ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Total</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4 text-xs font-mono">#{order._id}</td>
                  <td className="px-6 py-4">{order.user?.name || 'Deleted User'}</td>
                  <td className="px-6 py-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className="text-sm border rounded p-1"
                      defaultValue={order.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input 
                type="text" placeholder="Product Name" className="input-field" 
                value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" placeholder="Price" className="input-field"
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} required
                />
                <input 
                  type="number" placeholder="Stock" className="input-field"
                  value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} required
                />
              </div>
              <input 
                type="text" placeholder="Category" className="input-field"
                value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required
              />
              <input 
                type="text" placeholder="Image URL" className="input-field"
                value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} required
              />
              <textarea 
                placeholder="Description" className="input-field h-24"
                value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required
              ></textarea>
              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-grow">Create Product</button>
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
