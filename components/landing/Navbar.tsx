'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--scaffold-color)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div 
        className="mx-auto px-6"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Elara AI
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              How It Works
            </Link>
            <Link
              href="/dashboard"
              className="py-4 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                letterSpacing: '-0.05em',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Dashboard
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-primary)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border)]">
            <div className="flex flex-col gap-4">
              <Link href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                How It Works
              </Link>
              <Link
                href="/dashboard"
                className="py-4 rounded-lg text-white font-semibold text-center"
                style={{
                  background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                  letterSpacing: '-0.05em',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
