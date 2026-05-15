import React, { useState } from 'react';
import {
    Truck, Search, Plus, Phone, Mail, MapPin,
    CreditCard, Building, ShieldCheck, Loader2,
    MoreVertical, ExternalLink, Star, Package,
    History, Receipt, MessageCircle, AlertCircle,
    X, ChevronRight, Users
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../../services/vendorService';
import { requisitionService } from '../../services/requisitionService';
import { useToast } from '../ui/Toast';
import VendorAuditModal from './VendorAuditModal';
import PageHeader from '../ui/PageHeader';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const VendorManagement = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [auditVendor, setAuditVendor] = useState(null);
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    const { data: vendors = [], isLoading } = useQuery({
        queryKey: ['vendors'],
        queryFn: vendorService.getAll
    });

    const { data: requisitions = [] } = useQuery({
        queryKey: ['requisitions'],
        queryFn: requisitionService.getAll
    });

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const gstCount = vendors.filter(v => v.gstNumber).length;
    const activeCount = vendors.filter(v => v.isActive).length;

    if (isLoading) {
        return (
            <div className="space-y-12 animate-pulse font-admin">
                <div className="h-48 bg-admin-bg-tertiary rounded-[2.5rem] border-4 border-admin-border" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-admin-bg-tertiary rounded-[2rem] border-2 border-admin-border" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="font-admin text-admin-text space-y-12 max-w-7xl mx-auto px-4 md:px-0 mb-24 animate-fade-in">
            <PageHeader 
                title="Partner Manifest"
                subtitle="Strategic Procurement Registry"
                icon={<Truck className="w-6 h-6 text-admin-accent" />}
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                searchPlaceholder="SEARCH PARTNERS..."
                actions={isAdmin && (
                    <Button 
                        variant="premium"
                        onClick={() => setShowAddModal(true)}
                        icon={Plus}
                    >
                        Register Partner
                    </Button>
                )}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="p-6 bg-admin-bg-secondary border border-admin-border rounded-2xl flex flex-col justify-center">
                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Total Vendors</p>
                    <p className="text-3xl font-black text-admin-text">{vendors.length}</p>
                </div>
                <div className="p-6 bg-admin-bg-secondary border border-admin-border rounded-2xl flex flex-col justify-center">
                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">GST Verified</p>
                    <p className="text-3xl font-black text-admin-text">{gstCount}</p>
                </div>
                <div className="p-6 bg-admin-bg-secondary border border-admin-border rounded-2xl flex flex-col justify-center">
                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Operational</p>
                    <p className="text-3xl font-black text-admin-success">{activeCount}</p>
                </div>
            </div>

            {/* Partner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredVendors.map((vendor) => (
                    <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                        assignedOrders={requisitions.filter(r => r.vendor?.id === vendor.id)}
                        onAudit={() => setAuditVendor(vendor)}
                    />
                ))}

                {filteredVendors.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-admin-bg-tertiary border-4 border-dashed border-admin-border rounded-[3rem] opacity-30 flex flex-col items-center gap-6">
                        <AlertCircle className="w-16 h-16 text-admin-text-muted" />
                        <h2 className="text-xl font-black uppercase tracking-[0.4em]">Registry Empty</h2>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <RegisterVendorModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries(['vendors']);
                        showToast('success', "Registry Updated");
                        setShowAddModal(false);
                    }}
                />
            )}

            {auditVendor && (
                <VendorAuditModal
                    vendor={auditVendor}
                    onClose={() => setAuditVendor(null)}
                />
            )}
        </div>
    );
};

const RegisterVendorModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        gstNumber: '',
        address: '',
        notes: ''
    });

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name' && !value) error = 'REQUIRED';
        if (name === 'phone' && !value) error = 'REQUIRED';
        if (name === 'email' && value && !/\S+@\S+\.\S+/.test(value)) error = 'INVALID FORMAT';

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isNameValid = validateField('name', formData.name);
        const isPhoneValid = validateField('phone', formData.phone);
        if (!isNameValid || !isPhoneValid) return;

        setLoading(true);
        try {
            await vendorService.create(formData);
            onSuccess();
        } catch (error) {
            showToast('error', "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-bg-primary/95 backdrop-blur-2xl animate-fade-in">
            <div className="bg-admin-bg-secondary w-full max-w-2xl rounded-[3rem] border-8 border-admin-border p-10 shadow-2xl animate-modal-enter max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">Partnership Initiation</p>
                        <h3 className="text-4xl font-black text-admin-text uppercase tracking-tighter leading-none">New Supplier</h3>
                    </div>
                    <button onClick={onClose} className="p-4 rounded-full bg-admin-bg-tertiary border-2 border-admin-border hover:bg-admin-accent transition-all group">
                        <X className="w-6 h-6 text-admin-text-muted group-hover:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Entity Name</label>
                            <input
                                required
                                className="w-full px-8 py-5 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-xl font-black text-admin-text focus:border-admin-accent outline-none shadow-inner"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                placeholder="E.G. STEEL TECH INDUSTRIES"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Direct Line</label>
                            <input
                                required
                                className="w-full px-8 py-5 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-xl font-black font-mono text-admin-text focus:border-admin-accent outline-none shadow-inner"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Tax ID (GSTIN)</label>
                            <input
                                className="w-full px-8 py-5 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-xl font-black font-mono text-admin-text focus:border-admin-accent outline-none shadow-inner"
                                value={formData.gstNumber}
                                onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                                placeholder="00XXXXX0000X0Z0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10">
                        <button type="button" onClick={onClose} className="flex-1 py-6 text-xs font-black uppercase tracking-[0.4em] text-admin-text-muted hover:text-admin-text transition-colors">Abort</button>
                        <button type="submit" disabled={loading} className="btn-premium flex-[2] py-6 justify-center text-sm font-black uppercase tracking-[0.4em] shadow-premium">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Commit Registry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VendorCard = ({ vendor, assignedOrders = [], onAudit }) => {
    const handleWhatsApp = () => {
        const phone = vendor.phone?.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone || ''}`, '_blank');
    };

    const activeOrders = assignedOrders.filter(o => o.status !== 'INVOICED');

    return (
        <div className="admin-card p-0 overflow-hidden flex flex-col group hover:scale-[1.02] transition-all duration-500">
            {/* Card Header Section */}
            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-admin-bg-tertiary border-2 md:border-4 border-admin-border flex items-center justify-center text-admin-text-muted group-hover:bg-admin-accent group-hover:text-white group-hover:border-admin-accent transition-all duration-500 shadow-inner">
                        <Building className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
                        className="p-3 md:p-4 rounded-full bg-admin-bg-tertiary border-2 border-admin-border text-admin-success/40 hover:text-admin-success hover:border-admin-success transition-all shadow-inner"
                    >
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-black text-admin-text uppercase tracking-tighter leading-none line-clamp-1 group-hover:text-admin-accent transition-colors cursor-pointer">
                        {vendor.name}
                    </h3>
                    <div className="flex gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-admin font-bold uppercase tracking-wider border ${vendor.isActive ? 'border-admin-success/20 text-admin-success bg-admin-success/10' : 'border-admin-danger/20 text-admin-danger bg-admin-danger/10'}`}>
                            {vendor.isActive ? 'Operational' : 'Restricted'}
                        </span>
                        {vendor.gstNumber && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-admin font-bold uppercase tracking-wider border border-admin-accent/20 text-admin-accent bg-admin-accent/10">
                                GST Verified
                            </span>
                        )}
                    </div>
                </div>

                {/* Contact Row - Restoring High Context */}
                <div className="space-y-3 pt-4 border-t border-admin-border/50">
                    {vendor.phone && (
                        <div className="flex items-center gap-3 text-admin-text-secondary text-sm font-mono group/contact cursor-pointer hover:text-admin-accent transition-colors duration-200">
                            <Phone className="w-4 h-4 text-admin-text-muted group-hover/contact:text-admin-accent transition-colors duration-200" />
                            {vendor.phone}
                        </div>
                    )}
                    {vendor.email && (
                        <div className="flex items-center gap-3 text-admin-text-secondary text-sm group/contact cursor-pointer hover:text-admin-accent transition-colors duration-200">
                            <Mail className="w-4 h-4 text-admin-text-muted group-hover/contact:text-admin-accent transition-colors duration-200" />
                            <span className="truncate">{vendor.email}</span>
                        </div>
                    )}
                    {vendor.address && (
                        <div className="flex items-start gap-3 text-admin-text-secondary text-sm group/contact cursor-pointer hover:text-admin-accent transition-colors duration-200">
                            <MapPin className="w-4 h-4 text-admin-text-muted shrink-0 mt-0.5 group-hover/contact:text-admin-accent transition-colors duration-200" />
                            <span className="line-clamp-2">{vendor.address}</span>
                        </div>
                    )}
                </div>

                {/* Tactical Metrics Area */}
                <div className="space-y-4 pt-4 border-t-2 border-admin-border">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-4 h-4" /> Active Allocation
                        </p>
                        <span className="text-xl font-black text-admin-text tracking-tighter">{activeOrders.length}</span>
                    </div>

                    {activeOrders.length > 0 && (
                        <div className="space-y-2 bg-admin-bg-tertiary p-4 rounded-[1.5rem] border-2 border-admin-border shadow-inner">
                            {activeOrders.slice(0, 1).map(order => (
                                <div key={order.id} className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                    <span className="text-admin-text truncate mr-4">{order.customItemName}</span>
                                    <span className="text-admin-accent whitespace-nowrap">{order.quantity} {order.unitOfMeasure}</span>
                                </div>
                            ))}
                            {activeOrders.length > 1 && <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest pt-1">+{activeOrders.length - 1} MORE ORDERS</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Matrix */}
            <div className="grid grid-cols-2 border-t-4 border-admin-border bg-admin-bg-tertiary">
                <button
                    onClick={(e) => { e.stopPropagation(); onAudit(); }}
                    className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-admin-text-muted hover:text-admin-text hover:bg-admin-bg transition-all border-r-4 border-admin-border flex items-center justify-center gap-3"
                >
                    <History className="w-4 h-4" /> Manifest
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onAudit(); }}
                    className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-admin-text hover:bg-admin-accent hover:text-white transition-all flex items-center justify-center gap-3"
                >
                    <Receipt className="w-4 h-4" /> Audit Log
                </button>
            </div>
        </div>
    );
};

export default VendorManagement;


