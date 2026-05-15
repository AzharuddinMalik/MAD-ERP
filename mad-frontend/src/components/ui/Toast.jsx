import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// ═══════════════════════════════════════════════════
// Toast Context
// ═══════════════════════════════════════════════════
const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

// ═══════════════════════════════════════════════════
// Individual Toast Component
// ═══════════════════════════════════════════════════
const VARIANTS = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-500/20', // Increased opacity
        border: 'border-emerald-500/40',
        iconColor: 'text-emerald-500',
        bar: 'bg-emerald-500',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        iconColor: 'text-red-400',
        bar: 'bg-red-500',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
        bar: 'bg-amber-500',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/20', // Increased opacity
        border: 'border-blue-500/40',
        iconColor: 'text-blue-500',
        bar: 'bg-blue-500',
    },
};

const DURATION = 4000; // ms

const Toast = ({ id, variant = 'info', message, onDismiss }) => {
    const [exiting, setExiting] = useState(false);
    const timerRef = useRef(null);
    const v = VARIANTS[variant] || VARIANTS.info;
    const Icon = v.icon;

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => onDismiss(id), 250); // match exit animation
    }, [id, onDismiss]);

    useEffect(() => {
        timerRef.current = setTimeout(dismiss, DURATION);
        return () => clearTimeout(timerRef.current);
    }, [dismiss]);

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`
                flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/20
                backdrop-blur-md min-w-[320px] max-w-[420px]
                ${v.bg} ${v.border}
                transition-all duration-250 ease-out
                ${exiting
                    ? 'opacity-0 translate-x-8 scale-95'
                    : 'opacity-100 translate-x-0 scale-100 animate-slide-in-right'
                }
            `}
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={() => { timerRef.current = setTimeout(dismiss, 2000); }}
        >
            <Icon className={`w-5 h-5 ${v.iconColor} flex-shrink-0 mt-0.5`} />
            <p className="text-sm font-bold text-admin-text flex-1 leading-relaxed">{message}</p>
            <button
                onClick={dismiss}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex-shrink-0 p-0.5"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// ═══════════════════════════════════════════════════
// Toast Container (fixed position)
// ═══════════════════════════════════════════════════
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse justify-end gap-3 pointer-events-none">
        {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
                <Toast {...t} onDismiss={removeToast} />
            </div>
        ))}
    </div>
);

// ═══════════════════════════════════════════════════
// Toast Provider (wrap App)
// ═══════════════════════════════════════════════════
let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((variant, message) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, variant, message }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export default Toast;
