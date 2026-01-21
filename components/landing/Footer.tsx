import Link from "next/link";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-32 min-h-[40vh] bg-[#030303] border-t border-white/[0.06] flex flex-col justify-between overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[520px] w-[900px] -translate-x-1/2 translate-y-1/3 rounded-full bg-purple-600/15 blur-[160px]" />

      {/* Main Content */}
      <div 
        className="relative mx-auto pb-16 md:pb-20 lg:pb-24 w-full"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '64px'
        }}
      >
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:gap-8 md:grid-cols-2 lg:grid-cols-12 items-start w-full">

          {/* Brand */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Elara AI
            </h3>
            <p className="max-w-md text-gray-400 leading-loose text-base md:text-lg" style={{ lineHeight: '1.9' }}>
              AI-powered voice booking platform that transforms how you handle customer communications 24/7.
            </p>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h4 className="mb-10 text-base font-semibold uppercase tracking-[0.3em] text-white/40">
              Explore
            </h4>
            <ul className="space-y-5">
              {["Features", "About", "Contact", "Help Center"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-purple-400 text-sm md:text-base transition-all duration-300"
                    style={{ lineHeight: '1.8' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="mb-10 text-base font-semibold uppercase tracking-[0.3em] text-white/40">
              Support
            </h4>
            <ul className="space-y-5">
              {["Documentation", "Privacy Policy", "Terms of Service"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-purple-400 text-sm md:text-base transition-all duration-300"
                      style={{ lineHeight: '1.8' }}
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-3">
            <h4 className="mb-12 text-base font-semibold uppercase tracking-[0.3em] text-white/40 lg:text-right">
              Follow us
            </h4>
            <div className="flex gap-4 lg:justify-end">
              {[Mail, Twitter, Linkedin, Github].map((Icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
                >
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06] w-full mt-auto">
        <div 
          className="mx-auto py-6 md:py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px'
          }}
        >
          <p className="text-sm text-gray-500">
            © 2026 Elara AI. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Powered by <span className="text-gray-400">FynkTech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
