import React, { useState, useRef, useCallback } from 'react';
import { ExternalLink, MapPin, ArrowRight, Sliders } from 'lucide-react';

/* ── Before/After Slider Component ── */
const BeforeAfterSlider = ({ before, after, label }) => {
    const [pos, setPos] = useState(50);
    const containerRef = useRef(null);
    const dragging = useRef(false);

    const updatePos = useCallback((clientX) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        setPos((x / rect.width) * 100);
    }, []);

    const onMouseDown = (e) => { dragging.current = true; updatePos(e.clientX); };
    const onMouseMove = (e) => { if (dragging.current) updatePos(e.clientX); };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e) => updatePos(e.touches[0].clientX);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none overflow-hidden rounded-2xl cursor-col-resize"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove}
        >
            {/* AFTER image (background) */}
            <img src={after} alt="After renovation" className="w-full h-full object-cover" />

            {/* BEFORE image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
                <img src={before} alt="Before renovation" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-sepia/10" />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                style={{ left: `${pos}%` }}
            />

            {/* Handle */}
            <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-white/60 z-10"
                style={{ left: `${pos}%` }}
            >
                <Sliders className="w-4 h-4 text-charcoal rotate-90" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4">
                <span className="pill-tag bg-black/60 backdrop-blur-sm text-white">BEFORE</span>
            </div>
            <div className="absolute top-4 right-4">
                <span className="pill-tag bg-terra text-white">AFTER</span>
            </div>

            {/* Caption */}
            {label && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white/70 text-xs font-body bg-charcoal/50 backdrop-blur-sm px-3 py-1 rounded-full">
                        {label}
                    </span>
                </div>
            )}
        </div>
    );
};

/* ── Project gallery data ── */
const projects = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        title: 'Designer False Ceiling',
        location: 'Andheri, Mumbai',
        category: 'ceilings',
        type: 'Residential',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        title: 'Office Acoustic Partitions',
        location: 'Malviya Nagar, Jaipur',
        category: 'partitions',
        type: 'Commercial',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
        title: 'Textured Wall Plaster',
        location: 'Banjara Hills, Hyderabad',
        category: 'plastering',
        type: 'Residential',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        title: 'Multi-Level Ceiling',
        location: 'CIDCO, Aurangabad',
        category: 'ceilings',
        type: 'Residential',
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
        title: 'Premium Wall Finish',
        location: 'Dwarka, Delhi',
        category: 'plastering',
        type: 'Commercial',
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        title: 'Residential Drywall',
        location: 'Civil Lines, Akola',
        category: 'partitions',
        type: 'Residential',
    },
];

const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'ceilings', label: 'Ceilings' },
    { key: 'partitions', label: 'Partitions' },
    { key: 'plastering', label: 'Plastering' },
];

const Portfolio = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = activeFilter === 'all'
        ? projects
        : projects.filter((p) => p.category === activeFilter);

    return (
        <section id="portfolio" className="section-py relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-white" />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(224,122,95,0.07) 0%, transparent 70%)' }}
            />
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(45,45,45,0.8) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream-dark to-transparent" />

            <div className="container mx-auto px-4 relative">

                {/* ── Section Header ── */}
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10 md:mb-12">
                    <div className="flex-1">
                        <span className="section-badge mb-3 block">Our Work</span>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal font-bold leading-tight">
                            Recent Transformations
                        </h2>
                    </div>
                    <p className="text-brown/60 text-sm md:text-base font-body leading-relaxed md:max-w-xs">
                        Real projects. Real homes. Drag the slider below to see the before &amp; after difference.
                    </p>
                </div>

                {/* ── BEFORE / AFTER INTERACTIVE SLIDER ── */}
                <div className="mb-12 md:mb-16">
                    <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 lg:h-[480px] shadow-2xl">
                        <BeforeAfterSlider
                            before="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
                            after="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
                            label="Living Room — P.O.P. False Ceiling Transformation · Aurangabad"
                        />
                    </div>
                    <p className="text-center text-brown-muted text-xs font-body mt-3 flex items-center justify-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-terra" />
                        Drag the slider to see the Before &amp; After
                    </p>
                </div>

                {/* ── Filter Pills ── */}
                <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveFilter(cat.key)}
                            className={`px-5 py-2 rounded-full font-body font-semibold text-xs md:text-sm transition-all duration-200 cursor-pointer border ${activeFilter === cat.key
                                    ? 'bg-terra text-white border-terra shadow-lg'
                                    : 'bg-white text-brown/70 border-cream-dark hover:text-terra hover:border-terra/40'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* ── Gallery Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10 md:mb-12">
                    {filtered.map((project) => (
                        <div
                            key={project.id}
                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
                            style={{ boxShadow: '0 4px 20px -4px rgba(45,45,45,0.12)' }}
                        >
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                            {/* Expand icon */}
                            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/30">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </div>

                            {/* Type pill */}
                            <div className="absolute top-4 left-4">
                                <span className={`pill-tag shadow-sm ${project.type === 'Commercial'
                                        ? 'bg-charcoal/70 backdrop-blur-sm text-white'
                                        : 'bg-white/90 text-charcoal'
                                    }`}>
                                    {project.type}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="font-heading text-base md:text-lg font-bold text-white mb-1 leading-tight">
                                    {project.title}
                                </h3>
                                <p className="text-white/60 text-xs font-body flex items-center gap-1">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    {project.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── CTA ── */}
                <div className="text-center">
                    <button
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal hover:bg-charcoal/90 text-white font-bold rounded-2xl transition-all text-sm md:text-base cursor-pointer group"
                        style={{ boxShadow: '0 4px 20px -4px rgba(45,45,45,0.35)' }}
                    >
                        Discuss Your Project
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
