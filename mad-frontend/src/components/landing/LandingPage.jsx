import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Services from './Services';
import Contact from './Contact';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <Services />
            <Contact />

            {/* Simple Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-white">MAD.</span>
                    </div>
                    <p className="text-sm mb-6">© 2026 Malik Art Decor. All rights reserved.</p>
                    <div className="flex justify-center gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;