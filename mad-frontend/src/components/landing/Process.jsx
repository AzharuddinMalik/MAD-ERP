import React from 'react';
import { Calendar, Ruler, Hammer, CheckCircle } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: <Calendar className="w-6 h-6" />,
        title: 'Free Site Visit',
        description: 'We come to your home or office, take measurements, understand your vision, and discuss possibilities — completely free.',
        color: 'from-blue-500/20 to-blue-500/5',
        accent: '#60A5FA',
    },
    {
        number: '02',
        icon: <Ruler className="w-6 h-6" />,
        title: 'Design & Quotation',
        description: 'We create a detailed design proposal with material options and a transparent quote — no hidden costs, ever.',
        color: 'from-amber-500/20 to-amber-500/5',
        accent: '#FBBF24',
    },
    {
        number: '03',
        icon: <Hammer className="w-6 h-6" />,
        title: 'Skilled Execution',
        description: 'Our in-house craftsmen handle everything — clean worksite, minimal disruption, and daily progress updates.',
        color: 'from-terra/25 to-terra/5',
        accent: '#E07A5F',
    },
    {
        number: '04',
        icon: <CheckCircle className="w-6 h-6" />,
        title: 'Quality Handover',
        description: "Final walkthrough together. We don't leave until you're 100% happy. 30-day touch-up guarantee included.",
        color: 'from-green-500/20 to-green-500/5',
        accent: '#4ADE80',
    },
];

const Process = () => {
    return (
        <section id="process" className="relative overflow-hidden">
            {/* Full photo background showing craftsmen at work */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80"
                    alt="Craftsmen at work"
                    className="w-full h-full object-cover"
                />
                {/* Deep dark overlay so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal/95 via-charcoal/90 to-[#1a0f0a]/95" />
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-terra to-transparent" />

            {/* Decorative pattern */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #E07A5F 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            <div className="container mx-auto px-4 py-20 md:py-28 relative">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
                    <span className="text-terra font-body font-semibold uppercase tracking-[0.25em] text-xs md:text-sm inline-flex items-center gap-2 mb-4">
                        <span className="w-5 h-px bg-terra inline-block" />
                        How It Works
                        <span className="w-5 h-px bg-terra inline-block" />
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-4 leading-tight">
                        Our Simple <span className="text-terra">4-Step</span> Process
                    </h2>
                    <p className="text-white/55 text-base md:text-lg font-body leading-relaxed">
                        From your first call to the final walkthrough — here's exactly what to expect when you work with us
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Glass card */}
                            <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-6 md:p-7 h-full hover:border-white/25 hover:bg-white/12 transition-all duration-300 cursor-default relative overflow-hidden">

                                {/* Color gradient bg on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                                {/* Watermark number */}
                                <div
                                    className="absolute top-3 right-4 text-7xl font-display font-black leading-none select-none pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity"
                                    style={{ color: step.accent }}
                                >
                                    {step.number}
                                </div>

                                <div className="relative">
                                    {/* Step badge */}
                                    <div className="mb-5">
                                        <span
                                            className="inline-flex items-center justify-center w-10 h-10 text-sm font-body font-black rounded-2xl border-2"
                                            style={{
                                                color: step.accent,
                                                borderColor: step.accent,
                                                backgroundColor: `${step.accent}18`,
                                            }}
                                        >
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                                        style={{
                                            backgroundColor: `${step.accent}18`,
                                            color: step.accent,
                                            border: `1px solid ${step.accent}30`,
                                        }}
                                    >
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <h3 className="font-heading text-lg md:text-xl font-bold text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/55 text-sm font-body leading-relaxed group-hover:text-white/70 transition-colors">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow connector (desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-terra/40">
                                        <path d="M5 12h14M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-14 md:mt-20 text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-5 bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-8 py-5">
                        <div className="text-left">
                            <p className="font-body font-bold text-white text-sm md:text-base">
                                Ready to start?
                            </p>
                            <p className="text-white/45 text-xs font-body">
                                Book your free site visit — no commitment required
                            </p>
                        </div>
                        <button
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn-primary shrink-0 !px-6 !py-2.5 !text-sm cursor-pointer"
                        >
                            Book Free Visit
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Process;
