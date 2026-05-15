import React, { useState } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-admin-accent border-l-transparent border-r-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-admin-accent border-l-transparent border-r-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-admin-accent border-t-transparent border-b-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-admin-accent border-t-transparent border-b-transparent border-l-transparent'
    };

    return (
        <div 
            className="relative inline-block group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            
            {isVisible && (
                <div className={`absolute z-50 px-4 py-3 min-w-[200px] bg-admin-bg-secondary/95 backdrop-blur-xl border border-admin-accent/30 rounded-2xl shadow-premium-lg animate-fade-in-up ${positionClasses[position]}`}>
                    <p className="text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.15em] leading-relaxed">
                        {content}
                    </p>
                    <div className={`absolute border-8 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
