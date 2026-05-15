import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    icon: Icon,
    iconPosition = 'left',
    className = '', 
    ...props 
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        tertiary: 'btn-tertiary',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        ghost: 'btn-ghost',
        premium: 'btn-premium',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3.5 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold font-admin rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
                </>
            )}
        </button>
    );
};

export default Button;
