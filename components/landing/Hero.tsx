'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      className="relative overflow-hidden"
      style={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '80px 0 0 0',
        alignItems: 'center'
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 95, 0.1) 0%, rgba(123, 79, 255, 0.1) 100%)'
        }}
      ></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      
      <div 
        className="relative z-10 flex items-center justify-center"
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px'
        }}
      >
        <div 
          className="mx-auto text-center"
          style={{
            maxWidth: '720px'
          }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-10 leading-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Let Elara Handle Your Calls
          </h1>
          <p className="text-2xl md:text-[28px] text-[var(--text-secondary)] mb-16 max-w-3xl mx-auto leading-relaxed">
            AI-powered voice booking platform that manages your appointments, 
            schedules meetings, and handles customer inquiries 24/7
          </p>
          <div className="flex justify-center items-center mt-8 md:mt-12">
            <Link
              href="/dashboard"
              className="py-5 md:py-6 rounded-full text-white text-lg md:text-xl font-semibold flex items-center gap-3 hover:scale-[1.03] hover:opacity-90 transition-transform transition-opacity shadow-xl shadow-purple-500/40"
              style={{
                background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)',
                letterSpacing: '-0.05em',
                paddingLeft: '32px',
                paddingRight: '32px'
              }}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
