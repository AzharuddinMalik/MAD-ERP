import React from 'react';
import { Package, AlertTriangle, ClipboardList, TrendingUp } from 'lucide-react';
import StatCard from '../ui/StatCard';

const InventoryStats = ({ inventory, requisitions, onNavigateToRequisitions }) => {
    const totalItems = inventory.length;
    const lowStockCount = inventory.filter(i => i.currentQuantity <= i.minimumStockLevel).length;
    const pendingCount = requisitions.filter(r => r.status === 'PENDING').length;
    const totalValue = inventory.reduce((sum, i) => sum + (i.currentQuantity || 0), 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Total Materials"
                value={totalItems}
                sub="Registered in system"
                icon={Package}
                accentColor="#6366F1"
            />
            <StatCard
                label="Low Stock"
                value={lowStockCount}
                sub={lowStockCount > 0 ? 'Immediate attention needed' : 'All levels healthy'}
                icon={AlertTriangle}
                accentColor="#EF4444"
                alertPulse={lowStockCount > 0}
            />
            <StatCard
                label="Pending Orders"
                value={pendingCount}
                sub="Awaiting approval"
                icon={ClipboardList}
                accentColor="#F59E0B"
                alertPulse={pendingCount > 3}
                onClick={onNavigateToRequisitions}
            />
            <StatCard
                label="Stock Volume"
                value={totalValue.toLocaleString()}
                sub="Total units across items"
                icon={TrendingUp}
                accentColor="#22C55E"
            />
        </div>
    );
};

export default InventoryStats;
