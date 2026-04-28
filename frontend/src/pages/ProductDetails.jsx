import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img src={product.image} alt={product.name} className="w-full h-96 md:h-full object-cover" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col">
          <span className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.description}</p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-4xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`w-full flex items-center justify-center py-4 rounded-lg text-white font-bold text-lg transition shadow-md
                ${product.stock > 0 ? 'bg-primary hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              <ShoppingCart className="mr-2" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
