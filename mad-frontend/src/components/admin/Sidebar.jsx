import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Plus, Users,
    UserPlus, BarChart3, LogOut, X, HardHat,
    Settings, Activity, Package, Truck
} from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// Role constants
const ADMIN = 'ROLE_ADMIN';
const SUPERVISOR = 'ROLE_SUPERVISOR';
const ALL_ROLES = [ADMIN, SUPERVISOR];

const navSections = [
    {
        title: 'Overview',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ALL_ROLES },
            { icon: Activity, label: 'Field Portal', path: '/supervisor', roles: [SUPERVISOR] },
            { icon: Building2, label: 'Active Projects', path: '/active-projects', roles: ALL_ROLES },
        ],
    },
    {
        title: 'Operations',
        items: [
            { icon: Package, label: 'Inventory', path: '/inventory', roles: ALL_ROLES },
            { icon: Truck, label: 'Vendors', path: '/vendors', roles: ALL_ROLES },
        ],
    },
    {
        title: 'Management',
        items: [
            { icon: Plus, label: 'New Project', path: '/create-project', highlight: true, roles: [ADMIN] },
            { icon: Users, label: 'Users', path: '/users', roles: [ADMIN] },
            { icon: UserPlus, label: 'Leads Pipeline', path: '/leads', roles: ALL_ROLES },
            { icon: BarChart3, label: 'Reports', path: null, soon: true, roles: ALL_ROLES },
            { icon: Settings, label: 'Settings', path: null, soon: true, roles: [ADMIN] },
        ],
    },
];

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useAdminTheme();

    const handleNav = (path) => {
        if (!path) return;
        navigate(path);
        onClose?.();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    const isActive = (path) => path && location.pathname === path;
    const username = localStorage.getItem('username') || localStorage.getItem('user') || 'Admin';
    const userRole = localStorage.getItem('role') || 'ROLE_ADMIN';
    const role = userRole.replace('ROLE_', '');

    // Filter nav sections based on current user role
    const filteredSections = navSections
        .map(section => ({
            ...section,
            items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
        }))
        .filter(section => section.items.length > 0);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`
                    fixed lg:static top-0 bottom-[64px] lg:bottom-0 left-0 z-50
                    w-60 flex-shrink-0 bg-admin-sidebar border-r border-admin-border
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="h-20 px-4 border-b border-admin-border flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer overflow-hidden py-2 w-full justify-center" onClick={() => handleNav('/dashboard')}>
                        <img 
                            src={isDark ? "/logo-dark.png" : "/logo-light.png"} 
                            alt="Malik Art Decor" 
                            className="h-14 w-auto object-contain max-w-[220px]" 
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-admin-text-muted hover:text-admin-text hover:bg-admin-hover transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {filteredSections.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <p className="px-3 text-[10px] font-admin font-black text-admin-text-muted uppercase tracking-[0.2em] mb-3 opacity-60">
                                {section.title}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => handleNav(item.path)}
                                            disabled={item.soon}
                                            className={`
                                                w-full text-left px-4 py-3.5 min-h-[44px] rounded-2xl flex items-center gap-3 relative
                                                transition-all duration-300 font-admin font-bold
                                                cursor-pointer group
                                                ${active
                                                    ? 'bg-admin-accent/10 text-admin-accent shadow-[0_0_15px_rgba(224,122,95,0.05)]'
                                                    : item.soon
                                                        ? 'text-admin-text-muted cursor-not-allowed opacity-30'
                                                        : 'text-admin-text-secondary hover:text-admin-text hover:bg-admin-hover'
                                                }
                                            `}
                                        >
                                            {active && (
                                                <span className="absolute left-0 w-[4px] h-6 bg-admin-accent rounded-r-full shadow-[0_0_10px_rgba(224,122,95,0.5)]" />
                                            )}
                                            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${active ? 'text-admin-accent scale-110' : 'group-hover:scale-110'}`} />
                                            <span className={`truncate text-[13px] ${active ? 'font-black tracking-wide' : 'font-semibold'}`}>{item.label}</span>
                                            {item.soon && (
                                                <span className="ml-auto text-[8px] bg-admin-card border border-admin-border text-admin-text-muted px-2 py-1 rounded-md font-black uppercase tracking-widest">
                                                    Soon
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-admin-border space-y-1.5 flex-shrink-0">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-admin-hover">
                        <div className="w-7 h-7 rounded-full bg-admin-accent/20 flex items-center justify-center text-admin-accent font-admin font-bold text-[11px] flex-shrink-0">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-admin font-semibold text-admin-text truncate">{username}</p>
                            <p className="text-[11px] font-admin text-admin-text-muted">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-admin-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all font-admin text-[13px] font-medium cursor-pointer"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
