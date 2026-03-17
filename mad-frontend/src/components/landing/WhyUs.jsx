import React from 'react';
import { Award, Shield, Clock, Brush, CheckCircle, Star } from 'lucide-react';

const features = [
    {
        icon: <Award className="w-5 h-5" />,
        title: '10+ Years, 500+ Homes',
        description: 'A proven track record across India',
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: 'Licensed & Insured',
        description: 'Your safety and peace of mind, always',
    },
    {
        icon: <Star className="w-5 h-5" />,
        title: 'Premium Materials Only',
        description: 'Saint-Gobain & top-grade gypsum products',
    },
    {
        icon: <Clock className="w-5 h-5" />,
        title: 'On-Time Guarantee',
        description: 'We respect your schedule — always',
    },
    {
        icon: <Brush className="w-5 h-5" />,
        title: 'Clean Worksite Policy',
        description: 'Daily cleanup — minimal disruption',
    },
    {
        icon: <CheckCircle className="w-5 h-5" />,
        title: '30-Day Touch-Up Free',
        description: 'Post-work touch-up guarantee included',
    },
];

const WhyUs = () => {
    return (
        <section id="whyus" className="section-py relative overflow-hidden">
            {/* Warm dark cream background */}
            <div className="absolute inset-0 bg-[#EDE8E2]" />
            {/* Blueprint grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(93,64,55,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(93,64,55,0.3) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />
            {/* Top/bottom accent lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-terra/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream-dark to-transparent" />
            {/* Ambient glows */}
            <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-terra/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

                    {/* Left: Image with floating badges */}
                    <div className="relative hidden lg:block">
                        {/* Decorative border frame */}
                        <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl border-2 border-terra/15 pointer-events-none" />

                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                                alt="Completed interior project by Malik Art Decor"
                                className="w-full h-[500px] object-cover"
                            />
                            {/* Inner overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent rounded-3xl" />
                        </div>

                        {/* Floating: Rating card */}
                        <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl px-5 py-4 shadow-xl border border-cream-dark/40 max-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-9 h-9 bg-terra rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Star className="w-4 h-4 text-white fill-white" />
                                </div>
                                <div>
                                    <p className="font-heading font-bold text-charcoal text-sm leading-tight">4.9 ★ Rating</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-brown-muted font-body">Based on 200+ Google Reviews</p>
                        </div>

                        {/* Floating: Years badge */}
                        <div className="absolute -top-4 -left-4 bg-terra text-white rounded-2xl px-4 py-3 shadow-xl">
                            <p className="font-display font-black text-2xl leading-none">10+</p>
                            <p className="text-[11px] font-body text-white/80 mt-0.5">Years of Trust</p>
                        </div>

                        {/* Floating: Projects done */}
                        <div className="absolute top-1/2 -right-5 -translate-y-1/2 bg-charcoal text-white rounded-2xl px-4 py-3 shadow-xl">
                            <p className="font-display font-black text-2xl leading-none text-terra">500+</p>
                            <p className="text-[11px] font-body text-white/70 mt-0.5">Projects Done</p>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div>
                        <span className="section-badge mb-4 block">Why Choose Us</span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold mb-5 leading-tight">
                            Why India Trusts<br />
                            <span className="text-terra">Malik Art Decor</span>
                        </h2>
                        <p className="text-brown/65 text-base md:text-lg font-body mb-9 leading-relaxed">
                            We're not just contractors — we're craftsmen who take pride in every ceiling, every wall, every detail. Here's what sets us apart:
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3.5 group cursor-default">
                                    <div className="feature-icon w-10 h-10 flex-shrink-0 mt-0.5">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-body font-bold text-charcoal text-sm mb-0.5 leading-snug">
                                            {feature.title}
                                        </h4>
                                        <p className="text-brown-muted text-xs font-body leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn-primary cursor-pointer"
                        >
                            Get Free Consultation
                        </button>

                        {/* Mobile image */}
                        <div className="lg:hidden mt-8 relative">
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                                alt="Completed interior project"
                                className="w-full h-52 object-cover rounded-2xl shadow-lg"
                            />
                            <div className="absolute bottom-4 left-4 bg-terra text-white rounded-xl px-3 py-2 shadow-lg">
                                <p className="font-display font-black text-xl leading-none">10+</p>
                                <p className="text-[10px] font-body text-white/80">Years of Trust</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
