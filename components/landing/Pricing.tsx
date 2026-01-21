'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const plans = [
    {
      name: 'Growth',
      setup: '$1,000',
      price: '$499',
      period: '/month',
      description: 'For growing teams with higher call volume',
      badge: null,
      features: [
        'Everything in Starter',
        '500 calls / month',
        'Priority call handling',
        'Advanced AI summaries',
        'Call analytics & insights',
        'Lead scoring',
        'Priority support'
      ],
      popular: false,
      cta: 'Book Strategy Call'
    },
    {
      name: 'Starter',
      setup: '$1,000',
      price: '$299',
      period: '/month',
      description: 'Your AI voice receptionist, live 24/7',
      badge: 'Best for Most Clients',
      features: [
        '1 Dedicated AI Voice Agent (exclusive to your business)',
        'Up to 200 calls / month',
        'Up to 5 simultaneous calls',
        'Booking & lead capture',
        'Google Calendar integration OR Elara CRM',
        'Call summaries + transcripts',
        'Push notifications',
        'Business hours & services configuration',
        'Admin management',
        'Email + chat support'
      ],
      popular: true,
      cta: 'Get Started'
    },
    {
      name: 'Scale',
      setup: 'Custom',
      price: 'From $799',
      period: '/month',
      description: 'Enterprise-grade AI call automation',
      badge: null,
      features: [
        'Custom call volume',
        'Multi-location routing',
        'Custom AI behavior & scripts',
        'CRM integrations (HubSpot, Zoho, etc.)',
        'SLA support',
        'Dedicated account manager',
        'White-label option (later)'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32 lg:py-40 bg-gradient-to-b from-[var(--scaffold-color)] via-[var(--card-color)]/20 to-[var(--scaffold-color)]">
      
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-20 md:mb-24 lg:mb-28">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto opacity-80">
            Pricing that replaces a full-time receptionist
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full items-stretch mb-24 lg:mb-32">

          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-white/[0.04] border-purple-400/80 shadow-2xl shadow-purple-500/30 scale-105'
                  : 'bg-white/[0.03] border-white/[0.1] hover:border-purple-500/40 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-purple-500/10'
              }`}
              style={{ padding: '36px 32px', minHeight: '540px' }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/40">
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 text-sm mb-6">{plan.description}</p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-lg">{plan.period}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">
                    + {plan.setup} one-time setup
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.08] my-6" />

              {/* Features */}
              <ul className="flex-1 space-y-3.5 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center ${
                      plan.popular
                        ? 'bg-purple-500/30 border border-purple-400/40'
                        : 'bg-purple-500/20'
                    }`}>
                      <Check className="w-3 h-3 text-purple-300" />
                    </div>
                    <span className="text-gray-200 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.name === 'Scale' ? '#contact' : '/dashboard'}
                className={`w-full py-4.5 rounded-xl font-semibold text-base text-center transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white hover:scale-[1.03] shadow-xl shadow-purple-500/40'
                    : 'bg-white/[0.08] border-2 border-white/[0.15] text-white hover:bg-white/[0.12] hover:border-purple-500/50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="text-center text-sm text-gray-400 opacity-80">
          No long-term contracts • Live in 48–72 hours • Cancel anytime
        </div>
      </div>
    </section>
  );
}
