import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="w-full bg-[#00CC00] py-10 text-white font-sans text-sm font-medium shadow-inner mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-6">
        <div>
          <h4 className="font-bold text-lg mb-2">About EchoAid</h4>
          <ul className="space-y-1">
            <li><Link to="/about" className="hover:underline">Our Mission</Link></li>
            <li><Link to="/about" className="hover:underline">How It Works</Link></li>
            <li><Link to="/about" className="hover:underline">Accessibility</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-2">Resources</h4>
          <ul className="space-y-1">
            <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link to="/dictionary" className="hover:underline">Sign Dictionary</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-2">Social</h4>
          <ul className="space-y-1">
            <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a></li>
            <li><a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a></li>
            <li><a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-8 text-xs text-white/80">© 2025 EchoAid. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
