import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SearchBar from './SearchBar';

/**
 * PageHeader — Reusable page header with navigation
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} icon - Optional icon element
 * @param {string|number} backTo - Path to navigate back to, or -1 for history.back()
 * @param {string} backLabel - Label for back button (default: "Back")
 * @param {React.ReactNode} actions - Optional right-side action buttons
 * @param {boolean} showForward - Show forward button (default: false)
 */
const PageHeader = ({
    title,
    subtitle,
    icon,
    backTo,
    backLabel = 'Back',
    actions,
    showForward = false,
    onSearch,
    searchPlaceholder,
    searchTerm,
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (backTo === -1 || backTo === undefined) {
            navigate(-1);
        } else {
            navigate(backTo);
        }
    };

    const handleForward = () => {
        navigate(1);
    };

    // Keyboard shortcuts: Alt+← and Alt+→
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                handleBack();
            }
            if (e.altKey && e.key === 'ArrowRight' && showForward) {
                e.preventDefault();
                handleForward();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [backTo, showForward]);

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-start gap-2 w-full md:flex-1 min-w-0">
                {/* Navigation Buttons */}
                <div className="hidden md:flex items-center gap-1 pt-1 flex-shrink-0">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-admin-hover transition-all cursor-pointer"
                        aria-label={backLabel}
                        title={`${backLabel} (Alt+←)`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    {showForward && (
                        <button
                            onClick={handleForward}
                            className="p-2 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-admin-hover transition-all cursor-pointer"
                            aria-label="Forward"
                            title="Forward (Alt+→)"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Icon */}
                {icon && (
                    <div className="p-2 bg-admin-accent/10 rounded-lg flex-shrink-0 mt-0.5">
                        {icon}
                    </div>
                )}

                {/* Title */}
                <div className="min-w-0">
                    <h1 className="text-xl md:text-3xl font-admin font-bold text-admin-text leading-tight truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-admin-text-secondary text-xs sm:text-sm font-admin mt-0.5 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {onSearch && (
                    <div className="w-full sm:w-64 md:w-80">
                        <SearchBar 
                            value={searchTerm}
                            onChange={onSearch}
                            placeholder={searchPlaceholder || `Search ${title}...`}
                            delay={300}
                        />
                    </div>
                )}
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
