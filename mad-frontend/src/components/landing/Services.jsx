import React from 'react';
import { Home, PenTool, Layers, PaintBucket, Hammer, Crown } from 'lucide-react';

const services = [
    {
        icon: <Home className="w-8 h-8" />,
        title: "False Ceilings",
        desc: "Modern Gypsum and P.O.P false ceilings designs including cove lighting and multi-level structures."
    },
    {
        icon: <PenTool className="w-8 h-8" />,
        title: "Detailed P.O.P Work",
        desc: "Hand-crafted cornices, moldings, and arches that add a touch of royal elegance to your interiors."
    },
    {
        icon: <Layers className="w-8 h-8" />,
        title: "Gypsum Partitioning",
        desc: "High-quality dry wall partitions for offices and homes to optimize space effectively."
    },
    {
        icon: <PaintBucket className="w-8 h-8" />,
        title: "Texture Painting",
        desc: "Premium wall textures and finishes that bring life and depth to plain walls."
    },
    {
        icon: <Hammer className="w-8 h-8" />,
        title: "Repair & Renovation",
        desc: "Quick fixes for cracks, water damage, and old ceiling restorations."
    },
    {
        icon: <Crown className="w-8 h-8" />,
        title: "Luxury Finishes",
        desc: "Gold leafing, patina finishes, and bespoke art installations for luxury villas."
    }
];

const Services = () => {
    return (
        <section id="services" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-amber-600 font-bold uppercase tracking-wider text-sm">Our Expertise</span>
                    <h2 className="text-4xl font-extrabold text-slate-900 mt-2 mb-4">Craftsmanship You Can Trust</h2>
                    <p className="text-slate-600">From simple repairs to grand installations, we deliver perfection in every square foot.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((s, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {s.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;