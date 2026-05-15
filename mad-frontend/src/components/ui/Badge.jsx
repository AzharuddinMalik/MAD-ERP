import React from 'react';

const variants = {
    success: 'bg-admin-success/10 text-admin-success border-admin-success/20',
    error: 'bg-admin-danger/10 text-admin-danger border-admin-danger/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    info: 'bg-admin-info/10 text-admin-info border-admin-info/20',
    primary: 'bg-admin-accent/10 text-admin-accent border-admin-accent/20',
    default: 'bg-admin-hover text-admin-text-secondary border-admin-border'
};

/**
 * Badge - Reusable label/status indicator component
 * 
 * @param {string} variant - 'success' | 'error' | 'warning' | 'info' | 'primary' | 'default'
 * @param {React.ReactNode} children - The text or elements inside the badge
 * @param {string} className - Optional extra Tailwind classes
 */
const Badge = ({ variant = 'default', children, className = "" }) => {
    const activeVariant = variants[variant] || variants.default;

    return (
        <span className={`inline-flex items-center text-[10px] font-admin font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${activeVariant} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
