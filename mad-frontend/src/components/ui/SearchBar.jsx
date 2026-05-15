import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar — A standardized search input component for the "Industrial Elegance" design system.
 * 
 * @param {string} value - The current search query (from parent)
 * @param {function} onChange - Callback function for debounced change events
 * @param {string} placeholder - Input placeholder text
 * @param {string} className - Optional additional wrapper classes
 * @param {boolean} minimalist - If true, uses a bottom-border line style instead of a rounded box
 * @param {number} delay - Debounce delay in ms (defaults to 0 for immediate response)
 */
const SearchBar = ({ 
    value: externalValue, 
    onChange, 
    placeholder = "Search...", 
    className = "", 
    minimalist = false,
    delay = 0
}) => {
    const [localValue, setLocalValue] = useState(externalValue);

    // Sync local value with external value (e.g. when cleared from parent)
    useEffect(() => {
        setLocalValue(externalValue);
    }, [externalValue]);

    // Handle debouncing
    useEffect(() => {
        if (delay === 0) return;
        
        const handler = setTimeout(() => {
            if (localValue !== externalValue) {
                onChange(localValue);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [localValue, delay, onChange, externalValue]);

    const handleInputChange = (val) => {
        setLocalValue(val);
        if (delay === 0) {
            onChange(val);
        }
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className={`relative group ${className}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${localValue ? 'text-admin-accent' : 'text-admin-text-muted group-focus-within:text-admin-accent'}`} />
            
            <input
                type="text"
                value={localValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                className={`
                    w-full pl-10 pr-10 py-2.5 
                    font-admin text-sm
                    placeholder:text-admin-text-muted/60
                    transition-all duration-300 outline-none
                    ${minimalist 
                        ? 'bg-transparent border-b-2 border-admin-border focus:border-admin-accent' 
                        : 'bg-admin-bg-secondary border border-admin-border rounded-xl focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/5'
                    }
                `}
            />

            {localValue && (
                <button 
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-admin-hover text-admin-text-muted transition-colors"
                    title="Clear search"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;

