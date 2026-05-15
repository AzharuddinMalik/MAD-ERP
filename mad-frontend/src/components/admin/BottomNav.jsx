import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Truck, Menu, Activity } from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const BottomNav = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userRole = localStorage.getItem('role') || 'ROLE_ADMIN';
    const isSupervisor = userRole === 'ROLE_SUPERVISOR';
    
    // Quick links for mobile - Order: Dashboard, Portal/Vendors, Projects
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { 
            icon: isSupervisor ? Activity : Truck, 
            label: isSupervisor ? 'Portal' : 'Vendors', 
            path: isSupervisor ? '/supervisor' : '/vendors' 
        },
        { icon: Building2, label: 'Projects', path: '/active-projects' },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-admin-bg-secondary via-admin-bg-primary/95 to-admin-bg-primary/80 backdrop-blur-xl border-t border-admin-border/50 z-50 flex items-center justify-around px-2 shadow-[0_-10px_40px_rgba(224,122,95,0.08)]"
             style={{ 
                 paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
                 minHeight: '72px'
             }}>
            {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                    <button
                        key={item.label}
                        onClick={() => {
                            if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
                            navigate(item.path);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-2 space-y-1 transition-all duration-300 cursor-pointer ${
                            active ? 'text-admin-accent scale-105' : 'text-admin-text-muted hover:text-admin-text-secondary'
                        }`}
                    >
                        <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-admin-accent/15 shadow-[0_0_15px_rgba(224,122,95,0.3)]' : ''}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-admin font-black tracking-widest uppercase ${active ? 'text-admin-accent' : ''}`}>{item.label}</span>
                    </button>
                );
            })}
            
            <button
                onClick={(e) => {
                    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
                    onMenuClick(e);
                }}
                className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-2 space-y-1 text-admin-text-muted hover:text-admin-text transition-all duration-300 cursor-pointer group"
            >
                <div className="p-2 rounded-2xl transition-all duration-300 group-hover:bg-admin-bg-tertiary">
                    <Menu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-admin font-black tracking-widest uppercase">Menu</span>
            </button>
        </div>
    );
};

export default BottomNav;
