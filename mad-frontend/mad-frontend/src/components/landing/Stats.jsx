import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, ThumbsUp, Calendar } from 'lucide-react';

const useCounterAnimation = (target, duration = 1800) => {
    const ref = useRef(null);
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !started) {
                        setStarted(true);
                        let startTime;
                        const animate = (currentTime) => {
                            if (!startTime) startTime = currentTime;
                            const progress = Math.min((currentTime - startTime) / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            setCount(Math.floor(eased * target));
                            if (progress < 1) requestAnimationFrame(animate);
                        };
                        requestAnimationFrame(animate);
                    }
                });
            },
            { threshold: 0.4 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration, started]);

    return { ref, count };
};

const stats = [
    {
        value: 500,
        suffix: '+',
        label: 'Projects Completed',
        description: 'From concept to completion, across India',
        icon: <Briefcase className="w-5 h-5" />,
    },
    {
        value: 10,
        suffix: '+',
        label: 'Years in Business',
        description: 'Trusted craftsmanship since 2014',
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        value: 15,
        suffix: '+',
        label: 'Expert Craftsmen',
        description: 'Skilled artisans, modern techniques',
        icon: <Users className="w-5 h-5" />,
    },
    {
        value: 100,
        suffix: '%',
        label: 'Client Satisfaction',
        description: 'Quality that speaks for itself',
        icon: <ThumbsUp className="w-5 h-5" />,
    },
];

const StatCard = ({ stat }) => {
    const { ref, count } = useCounterAnimation(stat.value);
    return (
        <div ref={ref} className="flex flex-col items-center text-center px-4 py-8 group cursor-default">
            {/* Icon */}
            <div className="w-12 h-12 bg-white/15 text-white rounded-2xl flex items-center justify-center mb-4 border border-white/20 group-hover:bg-terra transition-colors duration-300">
                {stat.icon}
            </div>
            {/* Number */}
            <div className="text-5xl md:text-6xl font-display font-black text-white mb-1 leading-none">
                {count}<span className="text-terra-light">{stat.suffix}</span>
            </div>
            {/* Divider */}
            <div className="w-10 h-0.5 bg-terra/50 rounded-full my-3" />
            {/* Label */}
            <p className="font-body font-bold text-white text-sm md:text-base mb-1">{stat.label}</p>
            {/* Description */}
            <p className="text-white/55 text-xs md:text-sm font-body leading-relaxed">{stat.description}</p>
        </div>
    );
};

const Stats = () => {
    return (
        <section id="stats" className="relative overflow-hidden">
            {/* Rich terracotta-to-dark background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1810] via-[#3D2215] to-[#1A0F0A]" />

            {/* Background texture — subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />
            {/* Warm glows */}
            <div className="absolute top-0 left-1/4 w-96 h-px bg-gradient-to-r from-transparent via-terra/50 to-transparent" />
            <div className="absolute bottom-0 right-1/4 w-96 h-px bg-gradient-to-r from-transparent via-terra/30 to-transparent" />
            <div className="absolute -top-20 left-0 w-72 h-72 rounded-full bg-terra/20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 right-0 w-64 h-64 rounded-full bg-terra-dark/20 blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 py-16 md:py-20 relative">
                {/* Section Label */}
                <div className="text-center mb-2">
                    <span className="text-terra font-body font-semibold uppercase tracking-[0.25em] text-xs md:text-sm">
                        By The Numbers
                    </span>
                </div>
                <p className="text-center text-white/30 text-xs font-body mb-10">A decade of trust, measured in results</p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
                    {stats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
