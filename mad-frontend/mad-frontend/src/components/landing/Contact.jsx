import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { leadService } from '../../services/leadService';

const contactInfo = [
    {
        icon: <Phone className="w-5 h-5" />,
        label: 'Call Us',
        value: '+91 97696 26310',
        sub: 'Mon–Sat, 9am – 7pm',
        href: 'tel:+919769626310',
    },
    {
        icon: <Mail className="w-5 h-5" />,
        label: 'Email Us',
        value: 'contact@malikartdecor.com',
        href: 'mailto:contact@malikartdecor.com',
    },
    {
        icon: <MapPin className="w-5 h-5" />,
        label: 'We Serve',
        value: 'Mumbai · Jaipur · Hyderabad · Delhi',
        sub: 'And more cities across India',
    },
];

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        phone: '',
        email: '',
        service: 'POP Ceiling',
        message: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.phone.trim()) {
            setError('Please provide your name and phone number.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await leadService.submitLead({
                name: formData.firstName,
                phone: formData.phone,
                email: formData.email,
                serviceNeeded: formData.service,
                message: formData.message,
                source: 'contact'
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to submit request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section id="contact" className="section-py relative overflow-hidden">
            {/* Warm parchment background */}
            <div className="absolute inset-0 bg-[#FAF7F3]" />
            {/* Chevron/herringbone subtle pattern */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        120deg,
                        transparent,
                        transparent 30px,
                        rgba(224,122,95,0.15) 30px,
                        rgba(224,122,95,0.15) 31px
                    ), repeating-linear-gradient(
                        60deg,
                        transparent,
                        transparent 30px,
                        rgba(224,122,95,0.15) 30px,
                        rgba(224,122,95,0.15) 31px
                    )`,
                }}
            />
            {/* Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-terra/8 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-400/6 blur-3xl pointer-events-none" />
            {/* Top strong accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-terra/60 to-transparent" />

            <div className="container mx-auto px-4 relative">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
                    <span className="section-badge mb-4 justify-center">Get in Touch</span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold mb-4 leading-tight">
                        Ready to Transform<br className="hidden sm:block" /> Your Space?
                    </h2>
                    <p className="text-brown/65 text-base md:text-lg font-body leading-relaxed">
                        Book a free site visit — we'll come to you, take measurements, and give you a no-obligation quote.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-10 max-w-5xl mx-auto">

                    {/* Left: Info panel */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Urgency banner */}
                        <div className="bg-terra text-white rounded-2xl p-5 shadow-[0_8px_24px_-4px_rgba(224,122,95,0.4)]">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-body font-bold text-sm mb-0.5">Free Site Visit This Week</p>
                                    <p className="text-white/75 text-xs font-body">Limited slots available — book now before they fill up</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="warm-card p-5 space-y-5">
                            {contactInfo.map((info, i) => (
                                <div key={i} className="flex items-start gap-3.5 group">
                                    <div className="feature-icon w-10 h-10 flex-shrink-0 mt-0.5">
                                        {info.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-body font-bold text-charcoal mb-0.5">{info.label}</p>
                                        {info.href ? (
                                            <a href={info.href} className="text-brown text-sm hover:text-terra transition-colors font-body block">
                                                {info.value}
                                            </a>
                                        ) : (
                                            <p className="text-brown text-sm font-body">{info.value}</p>
                                        )}
                                        {info.sub && <p className="text-brown-muted text-xs font-body mt-0.5">{info.sub}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* WhatsApp quick link */}
                        <a
                            href="https://wa.me/919769626310?text=Hi%2C%20I%27m%20interested%20in%20your%20services"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl transition-all shadow-[0_4px_16px_-4px_rgba(37,211,102,0.4)] text-sm cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                        </a>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-3 warm-card p-6 md:p-8">
                        {submitted ? (
                            <div className="h-full flex flex-col justify-center items-center text-center py-10 min-h-[300px]">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading font-bold text-charcoal mb-2">
                                    We'll Call You Back!
                                </h3>
                                <p className="text-brown/65 font-body text-sm mb-6 max-w-xs leading-relaxed">
                                    Thanks for reaching out. Our team will contact you within 2 hours during business hours.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-terra font-body font-semibold hover:underline text-sm cursor-pointer"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                                <div className="mb-2">
                                    <p className="font-heading font-bold text-charcoal text-lg mb-1">Book Your Free Site Visit</p>
                                    <p className="text-brown-muted text-xs font-body">Fill in your details and we'll reach out to you shortly.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-charcoal mb-1.5 font-body" htmlFor="firstName">
                                            Your Name *
                                        </label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all font-body text-sm text-charcoal placeholder:text-brown-muted/60"
                                            required
                                            placeholder="e.g. Ravi Sharma"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-charcoal mb-1.5 font-body" htmlFor="phone">
                                            Phone *
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all font-body text-sm text-charcoal placeholder:text-brown-muted/60"
                                            required
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-charcoal mb-1.5 font-body" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all font-body text-sm text-charcoal placeholder:text-brown-muted/60"
                                        placeholder="you@email.com (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-charcoal mb-1.5 font-body" htmlFor="service">
                                        Service Needed
                                    </label>
                                    <select
                                        id="service"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all font-body text-sm text-charcoal cursor-pointer"
                                    >
                                        <option>POP Ceiling</option>
                                        <option>Gypsum Board</option>
                                        <option>Plastering</option>
                                        <option>Drywall Installation</option>
                                        <option>Decorative Moldings</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-charcoal mb-1.5 font-body" htmlFor="message">
                                        Tell Us About Your Project
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all font-body text-sm text-charcoal placeholder:text-brown-muted/60 resize-none"
                                        placeholder="e.g., Need a false ceiling for my 3BHK living room in Mumbai..."
                                    />
                                </div>

                                {error && <div className="text-red-500 text-sm font-body text-center">{error}</div>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-terra hover:bg-terra-dark disabled:bg-terra/70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_4px_20px_-4px_rgba(224,122,95,0.45)] hover:shadow-[0_8px_28px_-4px_rgba(224,122,95,0.5)] transition-all flex items-center justify-center gap-2 font-body text-sm md:text-base cursor-pointer hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {loading ? 'Submitting...' : 'Book Free Site Visit'}
                                </button>

                                <p className="text-brown-muted text-[11px] font-body text-center">
                                    No spam. We'll only contact you about your project.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;