import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

const Hero = () => {
    return (
        <div id="hero" className="relative bg-slate-900 min-h-screen flex items-center pt-16 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Luxury Interior"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Star className="w-3 h-3 fill-accent-400" /> Premium P.O.P & Gypsum Services
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                        Transforming <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">Spaces</span> into Art.
                    </h1>

                    <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
                        Malik Art Decor brings 20+ years of craftsmanship to your home. We specialize in false ceilings, detailed P.O.P work, and modern interior finishes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-accent-500/25 flex items-center justify-center gap-2 group"
                        >
                            Get a Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold transition-all flex items-center justify-center"
                        >
                            Explore Services
                        </button>
                    </div>

                    <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
                        <div>
                            <p className="text-3xl font-bold text-white">500+</p>
                            <p className="text-sm text-slate-400">Projects Completed</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">98%</p>
                            <p className="text-sm text-slate-400">Client Satisfaction</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">20+</p>
                            <p className="text-sm text-slate-400">Years Experience</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;