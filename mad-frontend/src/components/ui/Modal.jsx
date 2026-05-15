import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal — Reusable popup-applet shell
 * 
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} title - Modal header title
 * @param {React.ReactNode} icon - Optional icon element for header
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Footer content (action buttons)
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' (max-width)
 */
const Modal = ({ isOpen, onClose, title, icon, children, footer, size = 'lg' }) => {
    const modalRef = useRef(null);
    const previouslyFocused = useRef(null);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
    };

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const hasFocusedRef = useRef(false);

    // Trap focus and handle Esc
    useEffect(() => {
        if (!isOpen) { 
            hasFocusedRef.current = false;
            return;
        }

        previouslyFocused.current = document.activeElement;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCloseRef.current();
            }

            // Focus trap
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            // Only restore focus if the modal is actually being closed
            if (previouslyFocused.current) {
                previouslyFocused.current.focus();
            }
        };
    }, [isOpen]);

    // Auto-focus first input ON OPEN ONLY
    useEffect(() => {
        if (isOpen && !hasFocusedRef.current) {
            const timer = setTimeout(() => {
                const firstInput = modalRef.current?.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                    hasFocusedRef.current = true;
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={modalRef}
                className={`
                    relative bg-admin-card rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-black/50
                    w-full ${sizes[size]} max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col
                    border border-admin-border font-admin
                    animate-modal-enter
                `}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-admin-border bg-admin-card-hover/50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-admin-text flex items-center gap-2.5">
                        {icon && (
                            <div className="p-1.5 bg-admin-accent/10 rounded-lg flex-shrink-0">
                                {icon}
                            </div>
                        )}
                        <span className="truncate">{title}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-admin-text-muted hover:text-admin-text hover:bg-admin-hover p-2 rounded-xl transition-all cursor-pointer flex-shrink-0"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (scrollable) */}
                <div className="overflow-y-auto p-5 flex-1 custom-scrollbar text-[13px]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-admin-border bg-admin-card-hover/50 flex justify-end gap-3 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// Pre-built footer buttons for common patterns
// ═══════════════════════════════════════════════════
export const ModalCancelButton = ({ onClick, children = 'Cancel' }) => (
    <button
        type="button"
        onClick={onClick}
        className="px-6 py-2.5 text-sm font-bold text-admin-text-secondary hover:text-admin-text hover:bg-admin-hover rounded-lg transition-colors cursor-pointer"
    >
        {children}
    </button>
);

export const ModalPrimaryButton = ({ onClick, loading, disabled, children = 'Save', form }) => (
    <button
        type={form ? 'submit' : 'button'}
        form={form}
        onClick={!form ? onClick : undefined}
        disabled={loading || disabled}
        className="px-8 py-2.5 text-sm font-bold text-white bg-admin-accent hover:bg-admin-accent-hover rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
    >
        {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
    </button>
);

export default Modal;
