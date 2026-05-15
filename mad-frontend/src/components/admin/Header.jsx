import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { Menu, Bell, Plus, Sun, Moon, Clock } from 'lucide-react';

const AdminHeader = ({ onMenuClick, alertCount = 0 }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useAdminTheme();

    return (
        <header className="h-14 bg-admin-card border-b border-admin-border px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-20">
            {/* Left Side */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-1 rounded-lg text-admin-text-secondary hover:text-admin-text hover:bg-admin-hover transition-colors cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-sm font-admin">
                    <Clock className="w-4 h-4 text-admin-accent" />
                    <span className="text-admin-text-secondary font-medium">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 sm:p-2.5 rounded-lg text-admin-text-secondary hover:text-admin-accent hover:bg-admin-hover transition-all cursor-pointer"
                    title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                    {isDark
                        ? <Sun className="w-[18px] h-[18px]" />
                        : <Moon className="w-[18px] h-[18px]" />
                    }
                </button>

                {/* Notifications */}
                <button className="relative p-2 sm:p-2.5 rounded-lg text-admin-text-secondary hover:text-admin-text hover:bg-admin-hover transition-colors cursor-pointer">
                    <Bell className="w-[18px] h-[18px]" />
                    {alertCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-admin-danger rounded-full animate-pulse ring-2 ring-admin-card" />
                    )}
                </button>

                {/* New Project CTA */}
                <button
                    onClick={() => navigate('/create-project')}
                    className="ml-0.5 sm:ml-1.5 bg-admin-accent hover:bg-admin-accent-hover text-white px-2.5 sm:px-4 py-2 rounded-lg font-admin font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-admin-accent/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">New Project</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
