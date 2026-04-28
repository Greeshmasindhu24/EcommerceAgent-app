import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-gray-100">
      <Link to={`/product/${product._id}`}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
        </div>
        <div className="space-y-1 mb-4 text-sm text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded inline-block">{product.category}</span>
        </div>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <button 
            onClick={() => addToCart(product)}
            className="p-2 bg-primary text-white rounded hover:bg-blue-700 transition"
            title="Add to cart"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
