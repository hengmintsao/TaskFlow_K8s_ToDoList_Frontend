'use client';

import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isAuthenticated, logout, getUserFromToken, getCurrentUser } from '@/lib/authenticate';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = isAuthenticated();
      setAuthenticated(loggedIn);

      if (!loggedIn) {
        setUserName('User');
        setUserEmail('user@example.com');
        return;
      }

      // try decode token first
      const decoded = getUserFromToken();
      if (decoded) {
        if (decoded.name) setUserName(String(decoded.name));
        if (decoded.email) setUserEmail(String(decoded.email));
      }

      // optionally fetch full user object from API
      void getCurrentUser().then(u => {
        if (u) {
          setUserName(u.name);
          setUserEmail(u.email);
        }
      });
    };

    syncAuthState();

    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              TaskFlow
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {authenticated ? (
              <>
                {/* Notifications */}
                <button className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>


                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{userEmail}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg">
                      Profile
                    </Link>
                    <hr className="my-1 dark:border-gray-600" />
                    <button onClick={() => { logout(); router.push('/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 rounded-b-lg flex items-center gap-2">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Login
                </a>
                <a href="/register" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Register
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-2">
            {authenticated ? (
              <>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  Notifications
                </a>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  Profile
                </Link>
                <hr className="my-2 dark:border-gray-700" />
                <button onClick={() => { logout(); router.push('/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  Login
                </a>
                <a href="/register" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  Register
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
