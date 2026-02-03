import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <span className={`text-2xl font-extrabold tracking-tighter ${scrolled ? 'text-brand-900' : 'text-white'}`}>
                            MAD<span className="text-accent-500">.</span>
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Services', 'Portfolio', 'About', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className={`text-sm font-medium transition-colors hover:text-accent-500 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}
                            >
                                {item}
                            </button>
                        ))}
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-accent-500/30 flex items-center gap-2 text-sm"
                        >
                            <LogIn className="w-4 h-4" /> Portal Login
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className={`${scrolled ? 'text-slate-800' : 'text-white'}`}>
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t border-slate-100">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {['Services', 'Portfolio', 'About', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase())}
                                className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                            >
                                {item}
                            </button>
                        ))}
                        <div className="pt-4 border-t border-slate-100 mt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-brand-600 text-white px-3 py-3 rounded-lg font-bold flex justify-center items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" /> Employee Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;