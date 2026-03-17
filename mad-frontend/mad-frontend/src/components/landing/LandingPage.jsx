import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import Navbar from './Navbar';
import Hero from './Hero';
import Stats from './Stats';
import Services from './Services';
import Process from './Process';
import Portfolio from './Portfolio';
import WhyUs from './WhyUs';
import Testimonials from './Testimonials';
import Contact from './Contact';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-cream">
            <Navbar />
            <Hero />
            <Stats />
            <Services />
            <Process />
            <Portfolio />
            <WhyUs />
            <Testimonials />
            <Contact />
            <Footer />

            {/* ═══ FLOATING ACTION BUTTONS ═══ */}

            {/* WhatsApp — Bottom Right */}
            <a
                href="https://wa.me/919769626310?text=Hi%2C%20I%27m%20interested%20in%20your%20P.O.P.%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white pl-4 pr-5 py-3 rounded-full shadow-[0_8px_24px_-4px_rgba(37,211,102,0.5)] hover:shadow-[0_12px_32px_-4px_rgba(37,211,102,0.6)] transition-all hover:-translate-y-0.5 group"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="w-5 h-5" />
                <span className="font-body font-semibold text-sm">Chat with us</span>
            </a>

            {/* Click-to-Call — Bottom Left (mobile only) */}
            <a
                href="tel:+919769626310"
                className="fixed bottom-6 left-6 z-50 w-13 h-13 w-[52px] h-[52px] bg-terra hover:bg-terra-dark text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(224,122,95,0.5)] transition-all hover:-translate-y-0.5 md:hidden"
                aria-label="Call us"
            >
                <Phone className="w-5 h-5" />
            </a>
        </div>
    );
};

export default LandingPage;