/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ═══ AUTHENTIC INTERIOR DESIGN PALETTE ═══
                // Warm Charcoal — headings, dark elements
                charcoal: '#2D2D2D',
                // Terracotta/Coral — THE accent color
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
                // Cream / Off-white — backgrounds
                cream: {
                    DEFAULT: '#F5F1ED',
                    light: '#FAF8F6',
                    dark: '#E8E0D8',
                },
                // Deep Brown — body text
                brown: {
                    DEFAULT: '#3D3D3D',
                    light: '#5A5A5A',
                    muted: '#8A8178',
                },
            },
            fontFamily: {
                display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
                heading: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'Inter', 'sans-serif'],
                accent: ['DM Sans', 'sans-serif'],
                sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
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
