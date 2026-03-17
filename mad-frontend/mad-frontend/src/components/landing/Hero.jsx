import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, MapPin, ChevronDown, Shield, Phone, CheckCircle } from 'lucide-react';
import { leadService } from '../../services/leadService';

const cities = ['Aurangabad', 'Mumbai', 'Jaipur', 'Hyderabad', 'Delhi', 'Nagpur', 'Pune'];

const serviceAreas = [
    'Aurangabad', 'Mumbai', 'Jaipur', 'Hyderabad',
    'Delhi', 'Nagpur', 'Pune', 'Other',
];

/* ── Inline Lead Form (Livspace-style) ── */
const HeroLeadForm = () => {
    const [form, setForm] = useState({ name: '', phone: '', city: '', whatsapp: true });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
        if (!form.city) e.city = 'Please select your city';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        try {
            await leadService.submitLead({
                name: form.name,
                phone: form.phone,
                city: form.city,
                whatsappConsent: form.whatsapp,
                source: 'hero'
            });
            setSubmitted(true);
        } catch (err) {
            setErrors({ submit: 'Failed to submit. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const change = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-charcoal text-lg mb-1">
                        Thank You, {form.name.split(' ')[0]}!
                    </h3>
                    <p className="text-brown/60 text-sm font-body leading-relaxed">
                        Our expert will call you within <strong className="text-charcoal">30 minutes</strong>.
                        {form.whatsapp && " We'll also send updates on WhatsApp."}
                    </p>
                </div>
                <a
                    href={`https://wa.me/919769626310?text=Hi%2C%20I%27m%20${encodeURIComponent(form.name)}%20from%20${encodeURIComponent(form.city)}%2C%20interested%20in%20your%20P.O.P.%20services`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-full cursor-pointer shadow-md"
                >
                    Chat on WhatsApp
                </a>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

            {/* Name */}
            <div>
                <label htmlFor="hero-name" className="block text-xs font-body font-semibold text-brown/70 mb-1.5">
                    Your Name
                </label>
                <input
                    id="hero-name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={e => change('name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-body text-charcoal placeholder-brown/35 bg-cream/60 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-cream-dark/70'
                        }`}
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-1 font-body">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="hero-phone" className="block text-xs font-body font-semibold text-brown/70 mb-1.5">
                    Phone Number
                </label>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-3 bg-cream border border-cream-dark/70 rounded-xl text-xs font-body text-brown/70 flex-shrink-0">
                        🇮🇳 +91
                    </span>
                    <input
                        id="hero-phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={form.phone}
                        maxLength={10}
                        onChange={e => change('phone', e.target.value.replace(/\D/g, ''))}
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-body text-charcoal placeholder-brown/35 bg-cream/60 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all ${errors.phone ? 'border-red-400 bg-red-50/50' : 'border-cream-dark/70'
                            }`}
                    />
                </div>
                {errors.phone && <p className="text-red-500 text-[11px] mt-1 font-body">{errors.phone}</p>}
            </div>

            {/* City */}
            <div>
                <label htmlFor="hero-city" className="block text-xs font-body font-semibold text-brown/70 mb-1.5">
                    Your City
                </label>
                <select
                    id="hero-city"
                    value={form.city}
                    onChange={e => change('city', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-body text-charcoal bg-cream/60 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all appearance-none cursor-pointer ${errors.city ? 'border-red-400 bg-red-50/50' : 'border-cream-dark/70'
                        } ${!form.city ? 'text-brown/40' : ''}`}
                >
                    <option value="" disabled>Select your city</option>
                    {serviceAreas.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                {errors.city && <p className="text-red-500 text-[11px] mt-1 font-body">{errors.city}</p>}
            </div>

            {/* WhatsApp checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                    <input
                        type="checkbox"
                        checked={form.whatsapp}
                        onChange={e => change('whatsapp', e.target.checked)}
                        className="sr-only"
                    />
                    <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.whatsapp
                            ? 'bg-[#25D366] border-[#25D366]'
                            : 'bg-white border-cream-dark/70'
                            }`}
                    >
                        {form.whatsapp && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                </div>
                <span className="text-xs font-body text-brown/60 leading-relaxed">
                    Send me updates &amp; photos on{' '}
                    <span className="text-[#25D366] font-semibold">WhatsApp</span>
                </span>
            </label>

            {/* Submit CTA */}
            {errors.submit && <p className="text-red-500 text-[11px] mb-1 text-center font-body">{errors.submit}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-terra hover:bg-[#C4603F] text-white font-bold text-sm font-body rounded-xl transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 20px -4px rgba(224,122,95,0.55)' }}
            >
                {loading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting…
                    </>
                ) : (
                    <>
                        Get Free Quote
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>

            {/* Privacy disclaimer */}
            <p className="text-[10px] font-body text-brown/40 text-center leading-relaxed">
                By submitting this form, you agree to our{' '}
                <span className="underline cursor-pointer hover:text-terra transition-colors">privacy policy</span>
                {' '}&amp;{' '}
                <span className="underline cursor-pointer hover:text-terra transition-colors">terms of service</span>
            </p>
        </form>
    );
};

/* ═══════════════════════════════════════
   HERO SECTION — Full screen with form
   ═══════════════════════════════════════ */
const Hero = () => {
    const [cityIndex, setCityIndex] = useState(0);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setCityIndex(prev => (prev + 1) % cities.length);
                setFading(false);
            }, 350);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden">

            {/* ── BACKGROUND IMAGE ── */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=85"
                    alt="Beautiful P.O.P ceiling interior"
                    className="w-full h-full object-cover object-center"
                />
                {/* Left-heavy dark overlay so text is legible; right stays lighter to show image */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(105deg, rgba(18,12,6,0.92) 0%, rgba(18,12,6,0.75) 42%, rgba(18,12,6,0.30) 100%)',
                    }}
                />
                {/* Bottom vignette */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-40"
                    style={{ background: 'linear-gradient(to top, rgba(18,12,6,0.55), transparent)' }}
                />
                {/* Top vignette for navbar readability */}
                <div
                    className="absolute top-0 left-0 right-0 h-36"
                    style={{ background: 'linear-gradient(to bottom, rgba(18,12,6,0.50), transparent)' }}
                />
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="relative flex-1 flex items-center">
                <div className="container mx-auto px-6 md:px-8 pt-28 pb-10">

                    {/* Two-column layout: text left, form right */}
                    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16 xl:gap-24">

                        {/* ── LEFT: Hero Text ── */}
                        <div className="flex-1 max-w-xl">

                            {/* Trust badge */}
                            <div className="flex items-center gap-3 mb-7 animate-fade-up delay-100">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full pl-3 pr-4 py-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-white text-xs font-body font-semibold">4.9 · 200+ Clients</span>
                                    <Shield className="w-3 h-3 text-green-400 flex-shrink-0" />
                                </div>
                            </div>

                            {/* Animated city name */}
                            <div className="animate-fade-up delay-200 mb-1">
                                <span
                                    className="font-display font-black block"
                                    style={{
                                        fontSize: 'clamp(3rem, 9vw, 6rem)',
                                        color: '#E07A5F',
                                        lineHeight: 1.05,
                                        opacity: fading ? 0 : 1,
                                        transform: fading ? 'translateY(-8px)' : 'translateY(0)',
                                        transition: 'opacity 0.35s ease, transform 0.35s ease',
                                    }}
                                >
                                    {cities[cityIndex]}
                                </span>
                            </div>

                            {/* Static headline */}
                            <h1
                                className="font-display font-black text-white animate-fade-up delay-300"
                                style={{
                                    fontSize: 'clamp(3rem, 9vw, 6rem)',
                                    lineHeight: 1.05,
                                    marginBottom: '1.25rem',
                                }}
                            >
                                's Trusted<br />
                                P.O.P &amp; Gypsum
                            </h1>

                            {/* Sub-description */}
                            <p className="text-white/65 text-base md:text-lg font-body leading-relaxed mb-7 max-w-lg animate-fade-up delay-400">
                                From designer false ceilings to flawless wall finishes —
                                transforming homes &amp; offices across India since{' '}
                                <strong className="text-white">2014</strong>.
                            </p>

                            {/* Quick info pills */}
                            <div className="flex flex-wrap gap-2 mb-8 animate-fade-up delay-500">
                                {[
                                    '✓ Free Site Visit',
                                    '✓ No Hidden Costs',
                                    '✓ 30-Day Touch-up',
                                ].map(item => (
                                    <span
                                        key={item}
                                        className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-white/75 text-xs font-body"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>

                            {/* Cities served */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center animate-fade-up delay-600">
                                <MapPin className="w-3.5 h-3.5 text-terra flex-shrink-0" />
                                {['Mumbai', 'Jaipur', 'Hyderabad', 'Delhi', 'Pune', 'Nagpur', '& more'].map(c => (
                                    <span key={c} className="text-white/40 text-xs font-body">{c}</span>
                                ))}
                            </div>

                            {/* Call button (mobile) */}
                            <a
                                href="tel:+919769626310"
                                className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-body font-semibold text-sm rounded-full transition-all lg:hidden cursor-pointer animate-fade-up delay-600"
                            >
                                <Phone className="w-4 h-4 text-terra" />
                                Call Now: +91 97696 26310
                            </a>
                        </div>

                        {/* ── RIGHT: Lead Capture Form Card ── */}
                        <div className="w-full lg:w-[380px] xl:w-[400px] flex-shrink-0 animate-fade-up delay-300">
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.97)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.5)',
                                }}
                            >
                                {/* Form header */}
                                <div className="px-6 pt-6 pb-4 border-b border-cream-dark/40">
                                    <h2 className="font-heading font-bold text-charcoal text-xl leading-tight mb-1">
                                        Talk to an Expert
                                    </h2>
                                    <p className="text-brown/55 text-xs font-body">
                                        Get a free consultation &amp; quote in{' '}
                                        <strong className="text-terra">30 minutes</strong>
                                    </p>
                                </div>

                                {/* Form body */}
                                <div className="px-6 py-5">
                                    <HeroLeadForm />
                                </div>
                            </div>

                            {/* Below-card social proof */}
                            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                                <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-body">
                                    <svg className="w-3.5 h-3.5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.837L0 24l6.335-1.51A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.006-1.368l-.36-.213-3.76.896.952-3.666-.232-.375A9.806 9.806 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.431 0 9.818 4.388 9.818 9.818 0 5.431-4.387 9.818-9.818 9.818z" />
                                    </svg>
                                    WhatsApp Updates
                                </div>
                                <div className="w-px h-3 bg-white/20" />
                                <div className="flex items-center gap-1 text-white/50 text-[11px] font-body">
                                    <Shield className="w-3 h-3" />
                                    100% Privacy
                                </div>
                                <div className="w-px h-3 bg-white/20" />
                                <div className="text-white/50 text-[11px] font-body">No spam, ever</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SCROLL INDICATOR ── */}
            <div className="relative pb-6 flex justify-center">
                <button
                    onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex flex-col items-center gap-1.5 text-white/35 hover:text-white/60 transition-colors cursor-pointer"
                >
                    <span className="text-[10px] font-body uppercase tracking-[0.2em]">SCROLL</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
            </div>
        </section>
    );
};

export default Hero;