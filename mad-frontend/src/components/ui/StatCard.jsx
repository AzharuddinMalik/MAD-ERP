import React from 'react';

/**
 * StatCard - A reusable statistics card component
 * 
 * Supports both legacy API (title, icon as element) and new API (label, sub, icon as component, alertPulse, etc.)
 */
const StatCard = ({ 
    label, 
    title, 
    value, 
    sub, 
    icon: IconProp, 
    accentColor = "#6366f1", 
    alertPulse, 
    onClick, 
    valueColor 
}) => {
    // Handle both component type (Icon) and element (<Icon />)
    const renderIcon = (className) => {
        if (!IconProp) return null;
        if (React.isValidElement(IconProp)) {
            return React.cloneElement(IconProp, { className: `${className} ${IconProp.props.className || ''}` });
        }
        const IconComponent = IconProp;
        return <IconComponent className={className} />;
    };

    const displayLabel = label || title;

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`relative overflow-hidden bg-admin-bg-secondary rounded-2xl p-5 border transition-all duration-200 group text-left w-full
                ${onClick ? 'cursor-pointer' : 'cursor-default'}
                ${alertPulse
                    ? 'border-red-500/40 hover:border-red-500/60'
                    : 'border-admin-border hover:border-admin-accent/40'
                }`}
            style={{ boxShadow: alertPulse ? '0 0 20px rgba(239,68,68,0.06)' : '0 1px 3px rgba(0,0,0,0.08)' }}
        >
            {/* Background glow icon */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300 pointer-events-none">
                {renderIcon("w-24 h-24")}
            </div>

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-2 font-admin">{displayLabel}</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold tracking-tight font-mono ${alertPulse ? 'text-red-400' : (valueColor || 'text-admin-text')}`}>
                            {value}
                        </span>
                    </div>
                    {sub && <p className="text-[11px] text-admin-text-muted mt-1.5 font-medium font-admin">{sub}</p>}
                </div>
                {IconProp && (
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-200 ${onClick ? 'group-hover:scale-105' : ''}`}
                        style={{ backgroundColor: accentColor + '18', color: accentColor }}
                    >
                        {renderIcon("w-5 h-5")}
                    </div>
                )}
            </div>

            {/* Bottom accent line */}
            <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: accentColor }}
            />
        </button>
    );
};

export default StatCard;
