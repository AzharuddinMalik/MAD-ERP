import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminThemeProvider, useAdminTheme } from '../contexts/AdminThemeContext';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/Header';
import BottomNav from '../components/admin/BottomNav';

const AdminLayoutInner = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme } = useAdminTheme();

    return (
        <div
            data-admin-theme={theme}
            className="flex h-screen bg-admin-bg font-admin text-admin-text overflow-hidden"
        >
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 lg:pb-0 relative">
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 scroll-smooth">
                    <Outlet />
                </main>
            </div>
            
            <BottomNav onMenuClick={() => setSidebarOpen(true)} />
        </div>
    );
};

const AdminLayout = () => (
    <AdminThemeProvider>
        <AdminLayoutInner />
    </AdminThemeProvider>
);

export default AdminLayout;