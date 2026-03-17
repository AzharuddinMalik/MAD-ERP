import React, { useEffect, useState, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Building2, User } from 'lucide-react';

/* ══════════════════════════════════════════════════
   TESTIMONIALS — Mixed B2C homeowners + B2B partners
   ══════════════════════════════════════════════════ */

const testimonials = [
    /* ── B2B PARTNERS ── */
    {
        id: 1,
        type: 'b2b',
        quote: "Malik Art Decor has been our go-to P.O.P. contractor for 3 years running. Every handover is clean, on schedule, and residents love the ceilings. We don't need to supervise — they just get it done.",
        author: "Mahima Infra Group",
        role: "Real Estate Developer · Jaipur",
        initials: "MI",
        rating: 5,
        badge: "Verified Partner",
        projects: "12+ Projects",
    },
    {
        id: 2,
        type: 'b2b',
        quote: "We've used Malik Art Decor across multiple JMJ residential towers in Jaipur. Their team handled everything from false ceilings to drywall partitions without a single delay. Truly professional.",
        author: "JMJ Group",
        role: "Infrastructure Developer · Jaipur",
        initials: "JJ",
        rating: 5,
        badge: "Verified Partner",
        projects: "8+ Projects",
    },
    {
        id: 3,
        type: 'b2b',
        quote: "We contracted Malik Art Decor for the interior ceiling work across our EON One commercial complex in Mumbai. Precision, quality, and zero rework. Would recommend for any premium project.",
        author: "EON One",
        role: "Commercial Developer · Mumbai",
        initials: "EO",
        rating: 5,
        badge: "Verified Partner",
        projects: "5+ Projects",
    },
    {
        id: 4,
        type: 'b2b',
        quote: "Safar Construction has partnered with Malik Art Decor for gypsum and POP work across our Aurangabad projects. Their site hygiene is exceptional — no dust, no delays. Clients are always happy.",
        author: "Safar Construction",
        role: "Builder & Contractor · Aurangabad",
        initials: "SC",
        rating: 5,
        badge: "Verified Partner",
        projects: "10+ Projects",
    },
    /* ── HOMEOWNERS ── */
    {
        id: 5,
        type: 'b2c',
        quote: "We got our entire 3BHK false ceiling done by Malik Art Decor. The design options were brilliant and the execution flawless. Our neighbors keep asking who did the work!",
        author: "Ravi &amp; Priya Sharma",
        role: "Homeowners · Andheri, Mumbai",
        initials: "RS",
        rating: 5,
    },
    {
        id: 6,
        type: 'b2c',
        quote: "Got the gypsum partitions done for our new clinic in Jaipur. Work was completed 2 days ahead of schedule, daily cleanups, zero disruption to our patients. Highly professional team.",
        author: "Dr. Ahmed Siddiqui",
        role: "Clinic Owner · Jaipur",
        initials: "AS",
        rating: 5,
    },
    {
        id: 7,
        type: 'b2c',
        quote: "From the free site visit to the final handover, everything was transparent and honest. The ceiling in our living room is absolutely stunning. No hidden costs. Highly recommended!",
        author: "Lakshmi Devi",
        role: "Homeowner · Aurangabad",
        initials: "LD",
        rating: 5,
    },
];

/* ── Card styles by type ── */
const typeStyles = {
    b2b: {
        badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
        icon: <Building2 className="w-4 h-4" />,
        avatarBg: 'bg-blue-600',
    },
    b2c: {
        badge: 'bg-terra/15 text-terra border border-terra/20',
        icon: <User className="w-4 h-4" />,
        avatarBg: 'bg-terra',
    },
};

const Testimonials = () => {
    const [current, setCurrent] = useState(0);
    const [filter, setFilter] = useState('all'); // 'all' | 'b2b' | 'b2c'
    const timerRef = useRef(null);

    const filtered = filter === 'all'
        ? testimonials
        : testimonials.filter(t => t.type === filter);

    /* Reset to 0 when filter changes */
    useEffect(() => { setCurrent(0); }, [filter]);

    /* Autoplay */
    const startTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % filtered.length);
        }, 6000);
    };
    useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
    }, [filtered.length, filter]);

    const go = (dir) => {
        clearInterval(timerRef.current);
        setCurrent(prev => (prev + dir + filtered.length) % filtered.length);
    };

    const t = filtered[current] ?? filtered[0];
    const style = typeStyles[t?.type] ?? typeStyles.b2c;

    return (
        <section id="testimonials" className="relative overflow-hidden py-20 md:py-28">
            {/* Dark background with texture */}
            <div className="absolute inset-0 bg-[#1E1510]" />
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #E07A5F 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Ambient terra glows */}
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(224,122,95,0.14) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(224,122,95,0.10) 0%, transparent 70%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terra/40 to-transparent" />

            <div className="container mx-auto px-4 relative">

                {/* ── Section Header ── */}
                <div className="text-center max-w-xl mx-auto mb-10 md:mb-12">
                    <span className="text-terra font-body font-semibold uppercase tracking-[0.22em] text-xs inline-flex items-center gap-2 mb-4">
                        <span className="w-5 h-px bg-terra" />
                        Client Stories
                        <span className="w-5 h-px bg-terra" />
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-4">
                        Trusted by Builders<br className="hidden md:block" />&amp; Homeowners Alike
                    </h2>
                    <p className="text-white/45 text-sm md:text-base font-body">
                        Real feedback from companies and families who chose Malik Art Decor
                    </p>
                </div>

                {/* ── Filter Tabs ── */}
                <div className="flex justify-center gap-3 mb-10">
                    {[
                        { key: 'all', label: 'All Reviews' },
                        { key: 'b2b', label: '🏢 Corporate Partners' },
                        { key: 'b2c', label: '🏠 Homeowners' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-full text-xs font-body font-semibold transition-all duration-200 cursor-pointer border ${filter === tab.key
                                ? 'bg-terra text-white border-terra'
                                : 'bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/70'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Main Testimonial Card ── */}
                {t && (
                    <div className="max-w-3xl mx-auto">
                        <div
                            className="rounded-3xl p-8 md:p-12 text-center relative"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
                            onMouseEnter={() => clearInterval(timerRef.current)}
                            onMouseLeave={startTimer}
                        >
                            {/* Type badge */}
                            <div className="flex justify-center mb-5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-semibold ${style.badge}`}>
                                    {style.icon}
                                    {t.badge ?? (t.type === 'b2c' ? 'Homeowner Review' : 'Partner Review')}
                                    {t.projects && (
                                        <span className="ml-1 opacity-70">· {t.projects}</span>
                                    )}
                                </span>
                            </div>

                            {/* Quote icon */}
                            <Quote className="w-8 h-8 md:w-10 md:h-10 text-terra/25 mx-auto mb-5" fill="currentColor" />

                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-5">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote
                                key={t.id}
                                className="text-white/80 font-body text-base md:text-lg leading-relaxed mb-8 italic"
                                style={{ animation: 'fadeInUp 0.4s ease both' }}
                                dangerouslySetInnerHTML={{ __html: `"${t.quote}"` }}
                            />

                            {/* Author */}
                            <div className="flex items-center justify-center gap-3">
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-body font-bold text-white text-sm shadow-lg"
                                    style={{ backgroundColor: style.avatarBg === 'bg-terra' ? '#E07A5F' : '#2563EB' }}
                                >
                                    {t.initials}
                                </div>
                                <div className="text-left">
                                    <p
                                        className="font-heading font-bold text-white text-sm md:text-base leading-snug"
                                        dangerouslySetInnerHTML={{ __html: t.author }}
                                    />
                                    <p className="text-white/40 text-xs md:text-sm font-body">{t.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Navigation ── */}
                        <div className="flex items-center justify-center gap-4 mt-7">
                            <button
                                onClick={() => go(-1)}
                                className="w-9 h-9 bg-white/8 hover:bg-white/15 text-white rounded-full flex items-center justify-center transition-all border border-white/10 hover:border-terra/30 cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex gap-2">
                                {filtered.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { clearInterval(timerRef.current); setCurrent(idx); }}
                                        className="h-2 rounded-full transition-all duration-300 cursor-pointer"
                                        style={{
                                            width: idx === current ? '2rem' : '0.5rem',
                                            backgroundColor: idx === current ? '#E07A5F' : 'rgba(255,255,255,0.2)',
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => go(1)}
                                className="w-9 h-9 bg-white/8 hover:bg-white/15 text-white rounded-full flex items-center justify-center transition-all border border-white/10 hover:border-terra/30 cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Partner Company Logos strip ── */}
                <div className="mt-14 md:mt-16">
                    <p className="text-center text-white/25 text-xs font-body uppercase tracking-widest mb-6">
                        Trusted by leading builders &amp; developers
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 max-w-4xl mx-auto items-center">
                        {[
                            { name: 'Mahima Infra Group', city: 'Jaipur', logo: '/logos/mahima-infra.png', bg: 'bg-white' },
                            { name: 'JMJ Group', city: 'Jaipur', logo: '/logos/jmj-group.png', bg: 'bg-white' },
                            { name: 'JKJ & Sons', city: 'Aurangabad', logo: '/logos/jkj-sons.png', bg: 'bg-[#1a5c3a]' },
                            { name: 'Saraf Corporation', city: 'Aurangabad', logo: '/logos/saraf-corp.png', bg: 'bg-white' },
                            { name: 'ConstroTech', city: 'Maharashtra', logo: '/logos/constrotech.png', bg: 'bg-[#0d2240]' },
                        ].map((partner) => (
                            <div
                                key={partner.name}
                                className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-2xl transition-all duration-300 cursor-default ${partner.bg}`}
                                style={{ border: '1px solid rgba(255,255,255,0.10)' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-10 w-full object-contain"
                                    loading="lazy"
                                />
                                <p className="text-white/30 text-[10px] font-body text-center">{partner.city}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
