import React from 'react';
import { Facebook, Instagram, Phone, MapPin, Mail, ArrowRight, MessageCircle } from 'lucide-react';

const Footer = () => {
    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const quickLinks = [
        { label: 'Home', id: 'hero' },
        { label: 'Services', id: 'services' },
        { label: 'Our Work', id: 'portfolio' },
        { label: 'How It Works', id: 'process' },
        { label: 'Why Choose Us', id: 'whyus' },
        { label: 'Contact', id: 'contact' },
    ];

    const services = [
        'POP False Ceilings',
        'Gypsum Partitions',
        'Acoustic Tiles',
        'Decorative Moldings',
        'Drywall Installation',
        'Plastering & Finishing',
    ];

    return (
        <footer className="bg-charcoal text-white relative overflow-hidden">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terra/40 to-transparent" />

            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #E07A5F 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* CTA Band */}
            <div className="relative border-b border-white/8">
                <div className="container mx-auto px-4 py-10 md:py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                        <div>
                            <p className="font-heading font-bold text-xl md:text-2xl text-white mb-1">
                                Ready to start your project?
                            </p>
                            <p className="text-white/50 text-sm font-body">
                                Get a free consultation — no commitment required.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <a
                                href="tel:+919769626310"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-xl transition-all text-sm cursor-pointer"
                            >
                                <Phone className="w-4 h-4 text-terra" />
                                +91 97696 26310
                            </a>
                            <button
                                onClick={() => scrollToSection('contact')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-terra hover:bg-terra-dark text-white font-bold rounded-xl transition-all shadow-[0_4px_16px_-4px_rgba(224,122,95,0.45)] hover:-translate-y-0.5 text-sm cursor-pointer"
                            >
                                Get Free Quote
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">

                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-heading font-bold text-white mb-1">
                            Malik Art Decor
                        </h3>
                        <p className="text-terra text-[11px] font-body tracking-[0.2em] mb-4 font-semibold">
                            P.O.P. &amp; GYPSUM WORKS
                        </p>
                        <p className="text-white/45 text-sm font-body leading-relaxed mb-6">
                            Premium P.O.P. and Gypsum solutions for homes and offices across India. Crafting beautiful interiors since 2014.
                        </p>

                        {/* Social icons */}
                        <div className="flex gap-2.5">
                            <a
                                href="#"
                                className="w-9 h-9 bg-white/8 hover:bg-terra text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-white/8 hover:bg-terra text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://wa.me/919769626310"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/8 hover:bg-[#25D366] text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-body font-bold text-white text-xs mb-5 uppercase tracking-[0.15em]">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.id}>
                                    <button
                                        onClick={() => scrollToSection(link.id)}
                                        className="text-white/45 hover:text-terra transition-colors text-sm font-body flex items-center gap-1.5 group cursor-pointer"
                                    >
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-body font-bold text-white text-xs mb-5 uppercase tracking-[0.15em]">
                            Services
                        </h4>
                        <ul className="space-y-2.5">
                            {services.map((service, i) => (
                                <li key={i}>
                                    <button
                                        onClick={() => scrollToSection('services')}
                                        className="text-white/45 hover:text-terra transition-colors text-sm font-body text-left cursor-pointer"
                                    >
                                        {service}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-body font-bold text-white text-xs mb-5 uppercase tracking-[0.15em]">
                            Contact
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-terra flex-shrink-0 mt-0.5" />
                                <p className="text-white/45 text-sm font-body leading-relaxed">
                                    Mumbai · Jaipur · Hyderabad · Delhi &amp; More
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-terra flex-shrink-0" />
                                <a href="tel:+919769626310" className="text-white/45 hover:text-terra text-sm font-body transition-colors">
                                    +91 97696 26310
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-terra flex-shrink-0" />
                                <a href="mailto:contact@malikartdecor.com" className="text-white/45 hover:text-terra text-sm font-body transition-colors">
                                    contact@malikartdecor.com
                                </a>
                            </div>
                        </div>

                        {/* Map placeholder */}
                        <div className="mt-5 rounded-xl overflow-hidden border border-white/8 bg-white/5 h-24 flex items-center justify-center">
                            <p className="text-white/20 text-xs font-body">Pan-India Operations</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/8 relative">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <p className="text-white/25 text-xs font-body">
                            © {new Date().getFullYear()} Malik Art Decor. All rights reserved.
                        </p>
                        <p className="text-white/25 text-xs font-body">
                            Crafted with care in India
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
