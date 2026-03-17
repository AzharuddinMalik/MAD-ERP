import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, LogIn, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Services', href: '#services' },
    { label: 'Our Work', href: '#portfolio' },
    { label: 'How It Works', href: '#process' },
    { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (href) => {
        setMobileOpen(false);
        const id = href.replace('#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            {/* ── TOP INFO BAR ── */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 text-xs font-body transition-all duration-500 ${scrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                    } bg-charcoal/60 backdrop-blur-sm text-white/70`}
            >
                <div className="container mx-auto px-4 flex items-center justify-between h-8">
                    <p className="hidden md:block">
                        Serving <span className="text-terra font-semibold">Mumbai · Jaipur · Hyderabad · Delhi</span> &amp; More
                    </p>
                    <div className="flex items-center gap-4 ml-auto">
                        <a href="tel:+919769626310" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Phone className="w-3 h-3 text-terra" />+91 97696 26310
                        </a>
                        <Link to="/login" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <LogIn className="w-3 h-3" />Employee Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── MAIN NAVBAR ── */}
            <nav
                className={`fixed left-0 right-0 z-40 transition-all duration-500 ${scrolled
                        ? 'top-0 glass-nav mx-3 md:mx-8 lg:mx-16 mt-3 rounded-2xl px-5 py-3 shadow-xl'
                        : 'top-8 px-6 py-4 bg-transparent'
                    }`}
            >
                <div className="flex items-center justify-between max-w-6xl mx-auto">

                    {/* Logo */}
                    <button onClick={() => scrollTo('#hero')} className="cursor-pointer flex-shrink-0">
                        <span className={`font-heading font-bold text-lg md:text-xl leading-tight transition-colors duration-300 ${scrolled ? 'text-charcoal' : 'text-white drop-shadow-lg'
                            }`}>
                            Malik Art Decor
                        </span>
                        <br />
                        <span className={`font-body text-[9px] uppercase tracking-[0.22em] leading-none transition-colors duration-300 ${scrolled ? 'text-terra' : 'text-terra'
                            }`}>P.O.P. &amp; Gypsum Works</span>
                    </button>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => scrollTo(link.href)}
                                className={`px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-200 cursor-pointer ${scrolled
                                        ? 'text-brown hover:text-terra hover:bg-terra/8'
                                        : 'text-white/85 hover:text-white hover:bg-white/12'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/login"
                            className={`text-sm font-body font-medium transition-colors cursor-pointer ${scrolled ? 'text-brown hover:text-charcoal' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Login
                        </Link>
                        <button
                            onClick={() => scrollTo('#contact')}
                            className={`px-5 py-2.5 rounded-xl font-body font-bold text-sm transition-all cursor-pointer ${scrolled
                                    ? 'bg-terra text-white hover:bg-terra-dark shadow-md'
                                    : 'bg-terra text-white hover:bg-terra-dark shadow-[0_4px_16px_rgba(224,122,95,0.5)]'
                                }`}
                        >
                            Free Quote
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${scrolled
                                ? 'bg-terra/10 text-charcoal hover:bg-terra/20'
                                : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* ── MOBILE MENU ── */}
            {mobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30 bg-charcoal/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Panel */}
                    <div className="fixed top-0 right-0 bottom-0 z-40 w-72 bg-white shadow-2xl flex flex-col pt-20 pb-8 px-6">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-5 right-5 w-9 h-9 bg-cream rounded-xl flex items-center justify-center cursor-pointer"
                        >
                            <X className="w-5 h-5 text-charcoal" />
                        </button>

                        {/* Brand */}
                        <div className="mb-8 pb-6 border-b border-cream-dark">
                            <p className="font-heading font-bold text-charcoal text-lg">Malik Art Decor</p>
                            <p className="text-terra text-[10px] font-body uppercase tracking-widest">P.O.P. &amp; Gypsum Works</p>
                        </div>

                        {/* Nav links */}
                        <div className="flex flex-col gap-1 flex-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => scrollTo(link.href)}
                                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-brown font-body font-medium text-sm hover:bg-terra/8 hover:text-terra transition-all cursor-pointer text-left"
                                >
                                    {link.label}
                                    <ChevronRight className="w-4 h-4 opacity-30" />
                                </button>
                            ))}
                        </div>

                        {/* Mobile CTAs */}
                        <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-cream-dark">
                            <a
                                href="tel:+919769626310"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-terra/10 text-terra font-body font-bold text-sm rounded-xl"
                            >
                                <Phone className="w-4 h-4" />
                                Call Now
                            </a>
                            <button
                                onClick={() => scrollTo('#contact')}
                                className="btn-primary justify-center"
                            >
                                Get Free Quote
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;