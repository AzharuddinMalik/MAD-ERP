import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('mad-admin-theme') || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('mad-admin-theme', theme);
        document.documentElement.setAttribute('data-admin-theme', theme);
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <AdminThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </AdminThemeContext.Provider>
    );
};

export const useAdminTheme = () => {
    const ctx = useContext(AdminThemeContext);
    if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
    return ctx;
};
