'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section 
      className="relative overflow-hidden"
      style={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1E1E5F 0%, #7B4FFF 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>
      
      <div 
        className="relative z-10 py-24 md:py-32 px-6"
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        <div 
          className="max-w-4xl mx-auto text-center"
          style={{
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center',
            alignItems: 'center'
          }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Let Elara Handle Your Calls?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses that trust Elara to manage their bookings 
              and provide exceptional customer service around the clock.
            </p>
            <div 
              className="flex justify-center"
              style={{
                marginTop: '48px'
              }}
            >
              <Link
                href="/dashboard"
                className="py-5 md:py-6 rounded-full bg-white text-[var(--deep-blue)] text-lg md:text-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 hover:scale-[1.03] transition-transform transition-colors shadow-xl"
                style={{
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
      </div>
    </section>
  );
}
