import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">E-Shop</Link>
        <div className="flex items-center space-x-6">
          <Link to="/cart" className="relative text-gray-600 hover:text-primary">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center text-gray-600 hover:text-primary">
                <User size={20} className="mr-1" /> {user.name}
              </Link>
              <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-1 px-4 text-sm">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
