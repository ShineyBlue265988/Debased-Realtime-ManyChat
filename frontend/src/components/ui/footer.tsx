import React from 'react';
import { Github, Twitter } from 'lucide-react';
import base from '../icons/base.svg';
function Footer() {
  return (
    <footer className="bg-white text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="flex items-center">
            {/* Base Logo */}
            <div className="flex items-center gap-4">
              <img src={base} alt="Base Logo" className="w-12 h-12 " />
              <span className="text-5xl font-bold bg-gradient-to-b from-gray-300 to-gray-900 bg-gray-100 bg-clip-text text-transparent">
                deBase
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>© 2024 deBase. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;