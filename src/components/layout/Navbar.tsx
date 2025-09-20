import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BARKHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/news') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              News
            </Link>
            <Link
              to="/tournaments"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/tournaments') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Tournaments
            </Link>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{profile?.username || 'User'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/news"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActive('/news') ? 'text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/tournaments"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActive('/tournaments') ? 'text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Tournaments
              </Link>
              
              {user ? (
                <div className="border-t border-gray-200 pt-2">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-base font-medium text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-base font-medium text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};