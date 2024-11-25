import React from 'react';
import { Github, Twitter } from 'lucide-react';
// import base from '../icons/base.svg';
function Footer() {
  return (
    <footer className="bg-gray-900 text-white ">
      {/* <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600 cursor-pointer hover:scale-105">
                deBase
              </span>
            </div>
          </div>
        </div>
      </div> */}
      <div className="border-t border-white  py-4 text-center text-white">
        <p>© 2024 deBase. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;