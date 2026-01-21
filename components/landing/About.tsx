import { Sparkles, Clock, Zap } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Sparkles,
      title: 'Intelligent Voice AI',
      desc: 'Elara uses advanced natural language processing to understand context and provide responses that feel natural and human-like.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      desc: 'Never miss a booking. Elara works around the clock to capture leads and manage your calendar even when you are offline.'
    },
    {
      icon: Zap,
      title: 'Seamless Integration',
      desc: 'Connect Elara with your existing calendar, CRM, and booking systems. Sync appointments automatically in perfect harmony.'
    }
  ];

  return (
    /* Increased height with py-48 and lg:py-64 */
    <section 
      className="relative overflow-hidden px-6 py-32 md:py-48 lg:py-64 bg-gradient-to-b from-[var(--scaffold-color)] to-[var(--scaffold-color)]"
      style={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px]" />

      <div 
        className="relative max-w-7xl mx-auto flex flex-col items-center"
        style={{
          width: '100%'
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-20 md:mb-28">
          <h2 
            className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tighter text-white"
            style={{
              marginBottom: '16px',
              marginTop: '48px'
            }}
          >
            About Elara AI
          </h2>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed opacity-80">
            Revolutionizing how businesses handle customer communications
          </p>
        </div>
        
        {/* Layout Grid: 0.9fr to 1.1fr split for visual balance */}
        <div 
          className="grid lg:grid-cols-[1fr_1.1fr] items-center gap-16 md:gap-24 w-full"
          style={{
            gap: '60px'
          }}
        >
          
          {/* Left Side: Feature Cards */}
          <div className="space-y-12 md:space-y-16 w-full">
            {features.map((item, idx) => (
              <div key={idx} className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 transition-all duration-500">
                <div className="flex gap-6 items-start">
                  <div className="mt-1 p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg opacity-70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Side: Chat UI Mockup */}
          <div 
            className="relative w-full"
            style={{
              transform: 'scale(1)',
              opacity: 1
            }}
          >
            {/* Subtle glow behind the chat box */}
            <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full scale-75" />
            
            <div className="relative rounded-[2.5rem] bg-[#0A0A0F]/60 backdrop-blur-2xl p-8 md:p-12 border border-white/[0.1] shadow-2xl">
              <div className="space-y-8">
                {/* Message 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <span className="text-white font-black">E</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/5">
                    <p className="text-white font-semibold text-sm mb-1">Elara AI</p>
                    <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                      Hello! I'm Elara, your AI assistant. How can I help you today?
                    </p>
                  </div>
                </div>
                
                {/* Message 2 */}
                <div className="flex items-start gap-4 justify-end">
                  <div className="bg-purple-600/20 p-5 rounded-2xl rounded-tr-none border border-purple-500/20 max-w-[80%]">
                    <p className="text-purple-300 font-semibold text-sm mb-1 text-right">Customer</p>
                    <p className="text-white text-base leading-relaxed text-right">
                      I'd like to book an appointment for next Tuesday at 2 PM.
                    </p>
                  </div>
                </div>
                
                {/* Message 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black">E</span>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/5">
                    <p className="text-white font-semibold text-sm mb-1">Elara AI</p>
                    <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                      Perfect! Tuesday at 2 PM works. I've added it to your calendar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}