import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

/*
 * LOCAL IMAGE MAP — served from /public/services/
 * (Vite serves public/ at root "/")
 */
const services = [
    {
        id: 1,
        title: 'POP False Ceilings',
        tagline: 'Most Popular',
        taglineColor: 'bg-terra text-white',
        desc: 'Designer false ceiling systems — from simple trays to multi-level patterns with LED coves. Transforms any room instantly.',
        cta: 'View Ceiling Gallery',
        points: ['LED Cove Lighting', 'Multi-Level Designs', 'Custom Shapes'],
        /* Elegant finished ceiling — Unsplash (no local POP image yet) */
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1000&q=85',
        span: 'lg:col-span-2 lg:row-span-2',
        height: 'h-72 sm:h-80 lg:h-full min-h-[440px]',
        featured: true,
    },
    {
        id: 2,
        title: 'Gypsum Board Partitions',
        tagline: 'Define Your Space',
        taglineColor: 'bg-blue-600/80 text-white',
        desc: 'Fire-resistant gypsum partitions for offices and homes. Fast to install, perfectly smooth, modern results.',
        cta: 'See Partition Projects',
        /* LOCAL: gypsum partition installation in progress */
        image: '/services/gypsum-partition-wall-installation-1024x683.jpg',
        height: 'h-full min-h-[240px]',
    },
    {
        id: 3,
        title: 'Acoustic Ceiling Tiles',
        tagline: 'Sound × Style',
        taglineColor: 'bg-purple-700/80 text-white',
        desc: 'Modular suspended grid ceilings for offices, clinics & retail. Reduces noise while looking sharp.',
        cta: 'Get a Quote',
        /* LOCAL: acoustic ceiling tile installation */
        image: '/services/Acoustic Ceiling Tiles 1.jpg',
        height: 'h-full min-h-[240px]',
    },
    {
        id: 4,
        title: 'Gypsum Office Interiors',
        tagline: 'Office-Ready',
        taglineColor: 'bg-slate-700/80 text-white',
        desc: 'Complete gypsum-based office interior solutions — ceiling, walls, partitions, and finishing in one package.',
        cta: 'View Office Projects',
        image: '/services/Gypsum Office Decor.jpg',
        height: 'h-full min-h-[240px]',
    },
    {
        id: 5,
        title: 'Partition Walls',
        tagline: 'Built to Last',
        taglineColor: 'bg-amber-600/80 text-white',
        desc: 'Full partition wall installation — drywall, metal stud framing, insulation, taping, and sanding ready for paint.',
        cta: 'Get a Quote',
        image: '/services/partition-walls-3.jpeg',
        height: 'h-full min-h-[240px]',
    },
    {
        id: 6,
        title: 'Plastering & Finishing',
        tagline: 'Perfectly Smooth',
        taglineColor: 'bg-green-700/80 text-white',
        desc: 'Smooth skimcoat plaster, textured finishes, and specialty renders. The final touch that makes paint look premium.',
        cta: 'See Finishes',
        image: '/services/Plastering & Finishing 1.jpg',
        height: 'h-full min-h-[240px]',
    },
];

const scrollToContact = () =>
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

/* ── Single Service Card ── */
const ServiceCard = ({ service }) => (
    <div
        className={`service-img-card group ${service.span || ''} h-full`}
        onClick={scrollToContact}
    >
        <div className={`relative w-full overflow-hidden block h-full min-h-[280px] lg:min-h-full ${service.height || ''}`}>
            {/* Image */}
            <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />

            {/* Dark gradient overlay — strong at bottom, light at top */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(to top, rgba(15,10,5,0.90) 0%, rgba(15,10,5,0.45) 45%, rgba(15,10,5,0.08) 100%)',
                }}
            />

            {/* Service tagline badge — TOP LEFT */}
            <div className="absolute top-4 left-4">
                <span className={`pill-tag shadow-lg ${service.taglineColor}`}>
                    {service.featured && <Sparkles className="w-2.5 h-2.5 mr-0.5" />}
                    {service.tagline}
                </span>
            </div>

            {/* Content — BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3
                    className={`font-heading font-bold text-white leading-tight mb-1.5 ${service.featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
                        }`}
                >
                    {service.title}
                </h3>

                {/* Description: always visible on featured, hover-reveal on small cards */}
                <p
                    className={`text-white/70 text-sm font-body leading-relaxed transition-all duration-300 ${service.featured
                        ? 'max-w-sm mb-3'
                        : 'max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-hover:mb-3'
                        }`}
                >
                    {service.desc}
                </p>

                {/* Feature bullet points — featured card only */}
                {service.featured && service.points && (
                    <div className="flex flex-wrap gap-3 mb-4">
                        {service.points.map((pt) => (
                            <span
                                key={pt}
                                className="inline-flex items-center gap-1 text-xs text-white/60 font-body"
                            >
                                <CheckCircle2 className="w-3 h-3 text-terra flex-shrink-0" />
                                {pt}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA button */}
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-terra hover:bg-[#C4603F] text-white text-xs font-body font-bold rounded-full transition-all duration-200 cursor-pointer shadow-lg group/btn">
                    {service.cta}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
            </div>
        </div>
    </div>
);

/* ── Services Section ── */
const Services = () => {
    const [featured, ...regular] = services;

    return (
        <section id="services" className="section-py relative overflow-hidden">
            {/* Section background */}
            <div className="absolute inset-0 bg-[#F7F3EE]" />
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        -45deg, transparent, transparent 40px,
                        rgba(224,122,95,0.06) 40px, rgba(224,122,95,0.06) 41px
                    )`,
                }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terra/25 to-transparent" />

            <div className="container mx-auto px-4 relative">

                {/* ── Section Header ── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
                    <div>
                        <span className="section-badge mb-3 block">What We Do</span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold leading-tight">
                            Our Services
                        </h2>
                    </div>
                    <div className="md:max-w-xs">
                        <p className="text-brown/60 text-sm md:text-base font-body leading-relaxed">
                            P.O.P. and gypsum crafted to perfection — for homes, offices, clinics &amp; retail.
                        </p>
                        <button
                            onClick={scrollToContact}
                            className="mt-3 text-terra font-body font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-3 transition-all cursor-pointer"
                        >
                            Talk to an expert <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Bento Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4 md:gap-5 items-stretch">
                    {/* Featured card — 2 cols × 2 rows */}
                    <div className="lg:col-span-2 lg:row-span-2">
                        <ServiceCard service={featured} />
                    </div>
                    {/* Regular 5 cards */}
                    {regular.map((svc) => (
                        <ServiceCard key={svc.id} service={svc} />
                    ))}
                </div>

                {/* ── Bottom Trust Strip ── */}
                <div className="mt-10 flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-cream-dark/50">
                    {[
                        { val: '500+', label: 'Ceilings Installed' },
                        { val: '10+', label: 'Years in Business' },
                        { val: '4.9★', label: 'Google Rating' },
                        { val: '100%', label: 'Satisfaction' },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <p className="font-display font-black text-terra text-xl md:text-2xl leading-none">
                                {item.val}
                            </p>
                            <p className="text-brown/50 text-xs font-body mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;