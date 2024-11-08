import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 0);
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Base
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Products</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Developers</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-all">
              Launch App
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 absolute left-0 right-0 p-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Products</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Developers</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-all">
                Launch App
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;