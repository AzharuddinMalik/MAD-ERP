/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // ═══ NEW DESIGN SYSTEM PALETTE ═══
                bg: 'var(--color-bg)',
                surface: 'var(--color-surface)',
                'surface-elevated': 'var(--color-surface-elevated)',
                border: 'var(--color-border)',
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-muted': 'var(--color-text-muted)',
                primary: {
                    DEFAULT: '#6366F1', // Indigo 500
                    hover: '#4F46E5',   // Indigo 600
                    active: '#4338CA',  // Indigo 700
                    muted: '#E0E7FF',   // Indigo 100
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                    muted: 'var(--color-secondary-muted)',
                    foreground: '#FFFFFF',
                },
                tertiary: {
                    DEFAULT: 'var(--color-tertiary)',
                    hover: 'var(--color-tertiary-hover)',
                    muted: 'var(--color-tertiary-muted)',
                    foreground: '#FFFFFF',
                },
                neutral: {
                    50: 'var(--color-neutral-50)',
                    100: 'var(--color-neutral-100)',
                    200: 'var(--color-neutral-200)',
                    300: 'var(--color-neutral-300)',
                    400: 'var(--color-neutral-400)',
                    500: 'var(--color-neutral-500)',
                    600: 'var(--color-neutral-600)',
                    700: 'var(--color-neutral-700)',
                    800: 'var(--color-neutral-800)',
                    900: 'var(--color-neutral-900)',
                },
                success: {
                    DEFAULT: 'var(--color-success)',
                    hover: 'var(--color-success-hover)',
                    muted: 'var(--color-success-muted)',
                },
                warning: {
                    DEFAULT: 'var(--color-warning)',
                    hover: 'var(--color-warning-hover)',
                    muted: 'var(--color-warning-muted)',
                },
                error: {
                    DEFAULT: 'var(--color-error)',
                    hover: 'var(--color-error-hover)',
                    muted: 'var(--color-error-muted)',
                },
                info: {
                    DEFAULT: 'var(--color-info)',
                    muted: 'var(--color-info-muted)',
                },

                // ═══ LANDING PAGE PALETTE (unchanged) ═══
                charcoal: '#2D2D2D',
                terra: {
                    DEFAULT: '#E07A5F',
                    light: '#F4A68E',
                    dark: '#C4603F',
                    50: '#FDF2EE',
                    100: '#FADED4',
                    200: '#F4BCA9',
                    300: '#EE9A7E',
                    400: '#E07A5F',
                    500: '#C4603F',
                    600: '#A84D33',
                    700: '#8C3A27',
                },
                cream: {
                    DEFAULT: '#F5F1ED',
                    light: '#FAF8F6',
                    dark: '#E8E0D8',
                },
                brown: {
                    DEFAULT: '#3D3D3D',
                    light: '#5A5A5A',
                    muted: '#8A8178',
                },

                // ═══ ADMIN DASHBOARD PALETTE (CSS variable-driven) ═══
                // Nested objects with DEFAULT keys for both old & new class names
                admin: {
                    bg: {
                        DEFAULT: 'var(--admin-bg-primary)',
                        primary: 'var(--admin-bg-primary)',
                        secondary: 'var(--admin-bg-secondary)',
                        tertiary: 'var(--admin-bg-tertiary)',
                    },
                    // Backward compat aliases
                    card: 'var(--admin-bg-secondary)',
                    'card-hover': 'var(--admin-bg-tertiary)',
                    border: {
                        DEFAULT: 'var(--admin-border)',
                        subtle: 'var(--admin-border-subtle)',
                    },
                    text: {
                        DEFAULT: 'var(--admin-text-primary)',
                        primary: 'var(--admin-text-primary)',
                        secondary: 'var(--admin-text-secondary)',
                        muted: 'var(--admin-text-muted)',
                    },
                    accent: {
                        DEFAULT: 'var(--admin-accent)',
                        hover: 'var(--admin-accent-hover)',
                        soft: 'var(--admin-accent-soft)',
                    },
                    success: 'var(--admin-success)',
                    danger: 'var(--admin-danger)',
                    info: 'var(--admin-info)',
                    sidebar: {
                        DEFAULT: 'var(--admin-sidebar-bg)',
                        active: 'var(--admin-sidebar-active)',
                    },
                    hover: 'var(--admin-hover)',
                },

                // ═══ BRAND COLOR (Amber — used in admin components) ═══
                brand: {
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                },
            },
            fontFamily: {
                // Landing page fonts
                display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
                heading: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'Inter', 'sans-serif'],
                accent: ['DM Sans', 'sans-serif'],
                sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
                // Admin fonts
                admin: ['Jost', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'ui-monospace', 'monospace'],
                // New Design System Fonts
                headline: ['Playfair Display', 'Georgia', 'serif'],
            },
            borderRadius: {
                none: '0px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
                full: '9999px',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)',
                inner: 'var(--shadow-inner)',
                primary: 'var(--shadow-primary)',
                'dark-sm': 'var(--shadow-dark-sm)',
                'dark-md': 'var(--shadow-dark-md)',
                'dark-lg': 'var(--shadow-dark-lg)',
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '1.5rem',
                    md: '2rem',
                    lg: '3rem',
                    xl: '4rem',
                },
                screens: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-in-out',
                'fade-up': 'fadeInUp 0.65s ease-out both',
                'slide-up': 'slideUp 0.6s ease-out',
                'slide-in-right': 'slideInRight 0.8s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(40px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                shimmer: {
                    'from': { backgroundPosition: '-400px 0' },
                    'to': { backgroundPosition: '400px 0' },
                },
            },
        },
    },
    plugins: [],
}
