import React, { useState, useCallback } from 'react';
import { Package, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { projectService } from '../../services/projectService';
import { vendorService } from '../../services/vendorService';
import { requisitionService } from '../../services/requisitionService';
import financialService from '../../services/financialService';
import { useToast } from '../ui/Toast';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useTour } from '../../contexts/TourContext';
import { Sparkles } from 'lucide-react';

// Sub-components
import InventoryStats from './InventoryStats';
import MaterialStockTable from './MaterialStockTable';
import RequisitionList from './RequisitionList';
import { AddMaterialModal, AssignVendorModal, EditMaterialModal } from './InventoryModals';

const InventoryDashboard = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    // ── UI State ──
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [activeTab, setActiveTab] = useState('INVENTORY');
    const [showAddModal, setShowAddModal] = useState(false);
    const [reqStatusFilter, setReqStatusFilter] = useState('PENDING');
    const [selectedReqForVendor, setSelectedReqForVendor] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const { startTour } = useTour();

    const userRole = localStorage.getItem('role') || 'ROLE_SUPERVISOR';
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    // ── Data Queries ──
    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryService.getAll
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: projectService.getAll
    });

    const { data: vendors = [] } = useQuery({
        queryKey: ['vendors'],
        queryFn: vendorService.getAll
    });

    const { data: requisitions = [], refetch: refetchReqs } = useQuery({
        queryKey: ['requisitions'],
        queryFn: requisitionService.getAll
    });

    // ── SSE Hook ──
    const handleRequisitionEvent = useCallback((newReq) => {
        showToast('info', 'New Requisition!', {
            description: `${newReq.customItemName || 'New Item'} requested for ${newReq.project?.name}`
        });
        refetchReqs();
    }, [refetchReqs, showToast]);

    useNotifications(null, handleRequisitionEvent);

    // ── Derived Data ──
    const categories = ['ALL', ...new Set(inventory.map(item => item.category).filter(Boolean))];

    const filteredItems = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const pendingCount = requisitions.filter(r => r.status === 'PENDING').length;

    // ── Action Handlers ──
    const handleApprove = async (req) => {
        try {
            await requisitionService.updateStatus(req.id, 'APPROVED');
            showToast('success', 'Order Verified');
            refetchReqs();
            setReqStatusFilter('APPROVED');
        } catch (err) {
            showToast('error', 'Sync Failure');
        }
    };

    const handleReject = async (req) => {
        try {
            await requisitionService.updateStatus(req.id, 'REJECTED');
            showToast('info', 'Order Declined');
            refetchReqs();
            setReqStatusFilter('REJECTED');
        } catch (err) {
            showToast('error', 'Action Failed');
        }
    };

    const handleDeleteMaterial = async (item) => {
        if (!window.confirm(`Permanently remove "${item.name}"?`)) return;
        try {
            await inventoryService.delete(item.id);
            queryClient.invalidateQueries(['inventory']);
            showToast('success', "Manifest Updated");
        } catch (err) {
            showToast('error', 'Delete Failed');
        }
    };

    const handleMarkAsPaid = async (req) => {
        try {
            await financialService.markAsPaid(req.id);
            showToast('success', 'Payment Settled');
            refetchReqs();
        } catch (err) {
            showToast('error', 'Payment Failed');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-12 animate-pulse font-admin">
                <div className="h-48 bg-admin-bg-tertiary rounded-[2.5rem] border-4 border-admin-border" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-admin-bg-tertiary rounded-[2rem] border-2 border-admin-border" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="font-admin text-admin-text space-y-12 max-w-7xl mx-auto px-4 md:px-0 mb-24 animate-fade-in">
            {/* Editorial Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
                <div className="space-y-4">
                    <h1 className="text-editorial-title">Logistics Hub</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-admin-accent animate-pulse" />
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">Global Manifest Synchronization</p>
                    </div>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => startTour('inventory')}
                            className="p-4 bg-admin-bg-tertiary hover:bg-admin-hover text-admin-text-muted hover:text-admin-accent rounded-[2rem] border-2 border-admin-border transition-all cursor-pointer"
                            title="Start Tour"
                        >
                            <Sparkles className="w-6 h-6" />
                        </button>
                        <button
                            data-tour="register-stock"
                            onClick={() => setShowAddModal(true)}
                            className="btn-premium px-12 py-6 text-sm font-black uppercase tracking-[0.4em] justify-center shadow-premium"
                        >
                            <Plus className="w-6 h-6 mr-3" /> Register Stock
                        </button>
                    </div>
                )}
            </div>

            {/* Tactical Metrics */}
            <InventoryStats
                inventory={inventory}
                requisitions={requisitions}
                onNavigateToRequisitions={() => setActiveTab('REQUISITIONS')}
            />

            {/* Editorial Segment Switcher */}
            <div className="flex p-1.5 bg-admin-bg-tertiary rounded-[2.5rem] border-4 border-admin-border shadow-inner max-w-2xl mx-auto overflow-visible" data-tour="inventory-tabs">
                <button
                    onClick={() => setActiveTab('INVENTORY')}
                    className={`flex-1 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-[2rem] transition-all ${activeTab === 'INVENTORY' ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    Manifest Stock
                </button>
                <button
                    onClick={() => setActiveTab('REQUISITIONS')}
                    className={`flex-1 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-[2rem] transition-all relative ${activeTab === 'REQUISITIONS' ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    Active Orders
                    {pendingCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-admin-danger text-white text-[9px] md:text-[10px] flex items-center justify-center rounded-full font-black shadow-premium animate-bounce-subtle border-2 border-admin-bg-tertiary">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="animate-slide-up">
                {activeTab === 'INVENTORY' ? (
                    <MaterialStockTable
                        items={filteredItems}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        categories={categories}
                        filterCategory={filterCategory}
                        onFilterChange={setFilterCategory}
                        isAdmin={isAdmin}
                        onEdit={(item) => setEditingItem(item)}
                        onDelete={handleDeleteMaterial}
                    />
                ) : (
                    <RequisitionList
                        requisitions={requisitions}
                        reqStatusFilter={reqStatusFilter}
                        onStatusFilterChange={setReqStatusFilter}
                        isAdmin={isAdmin}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onAssignVendor={(req) => setSelectedReqForVendor(req)}
                        onMarkAsPaid={handleMarkAsPaid}
                    />
                )}
            </div>

            {/* Overlay Systems */}
            {showAddModal && (
                <AddMaterialModal
                    onClose={() => setShowAddModal(false)}
                    projects={projects}
                    vendors={vendors}
                    onSuccess={() => {
                        queryClient.invalidateQueries(['inventory']);
                        showToast('success', "Stock Synchronized");
                        setShowAddModal(false);
                    }}
                />
            )}

            {selectedReqForVendor && (
                <AssignVendorModal
                    requisition={selectedReqForVendor}
                    vendors={vendors}
                    onClose={() => setSelectedReqForVendor(null)}
                    onSuccess={(shouldClose = true) => {
                        refetchReqs();
                        showToast('success', "Logistics Assigned");
                        setReqStatusFilter('ASSIGNED');
                        if (shouldClose) setSelectedReqForVendor(null);
                    }}
                />
            )}

            {editingItem && (
                <EditMaterialModal
                    material={editingItem}
                    onClose={() => setEditingItem(null)}
                    projects={projects}
                    vendors={vendors}
                    onSuccess={() => {
                        queryClient.invalidateQueries(['inventory']);
                        showToast('success', "Manifest Synchronized");
                        setEditingItem(null);
                    }}
                />
            )}
        </div>
    );
};

export default InventoryDashboard;
