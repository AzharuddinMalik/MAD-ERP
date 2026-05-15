import React, { useState, useEffect } from 'react';
import { 
    Users, 
    ArrowLeft, 
    Search, 
    Filter, 
    DollarSign, 
    CheckCircle2, 
    AlertCircle, 
    Clock,
    FileText,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import financialService from '../../services/financialService';

const VendorLedger = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const data = await financialService.getVendorFinancials();
            setVendors(data);
        } catch (error) {
            console.error("Error fetching vendor financials:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(v => 
        v.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalOutstanding = vendors.reduce((acc, curr) => acc + curr.pendingBalance, 0);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-admin-bg-primary">
            <div className="animate-pulse text-admin-accent font-black tracking-widest uppercase">Analyzing Ledger...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-admin-bg-primary p-4 md:p-8 space-y-8 animate-fade-in font-admin">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/financials')}
                        className="flex items-center text-admin-text-muted hover:text-admin-accent transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Financial Intelligence</span>
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-admin-text tracking-tighter mb-2">Vendor Ledger</h1>
                    <p className="text-admin-text-muted max-w-2xl font-medium">Tracking liability and payment settlements across all material suppliers.</p>
                </div>
                <div className="bg-admin-bg-secondary p-6 rounded-2xl border border-admin-border flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Total Liability</p>
                        <p className="text-3xl font-black text-editorial-accent tracking-tighter">₹{(totalOutstanding / 100000).toFixed(2)}L</p>
                    </div>
                    <div className="w-px h-12 bg-admin-border" />
                    <div>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Settled Ratio</p>
                        <p className="text-3xl font-black text-green-500 tracking-tighter">
                            {Math.round((vendors.reduce((acc, curr) => acc + curr.totalPaid, 0) / (vendors.reduce((acc, curr) => acc + curr.totalOrderValue, 0) || 1)) * 100)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted group-focus-within:text-admin-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search vendor name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-admin-bg-secondary border border-admin-border rounded-xl py-3 pl-12 pr-4 text-admin-text focus:outline-none focus:border-admin-accent transition-all font-bold text-sm"
                    />
                </div>
                <button className="px-6 py-3 bg-admin-bg-secondary border border-admin-border rounded-xl text-admin-text font-black text-[10px] uppercase tracking-widest hover:border-admin-accent transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Vendor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                    <div 
                        key={vendor.vendorId}
                        className="admin-card bg-admin-bg-secondary border-admin-border hover:border-admin-accent/50 transition-all group overflow-hidden"
                    >
                        <div className="p-6 border-b border-admin-border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-admin-bg-tertiary rounded-xl border border-admin-border group-hover:border-admin-accent transition-colors">
                                    <Users className="w-6 h-6 text-admin-accent" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${vendor.pendingBalance > 0 ? 'bg-editorial-accent/10 text-editorial-accent border border-editorial-accent/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                    {vendor.pendingBalance > 0 ? 'Payment Due' : 'Settled'}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-admin-text tracking-tight group-hover:text-admin-accent transition-colors">{vendor.vendorName}</h3>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mt-1">
                                {vendor.orderCount} Requisitions
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Total Billing</span>
                                <span className="text-sm font-black text-admin-text">₹{vendor.totalOrderValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Total Paid</span>
                                <span className="text-sm font-black text-green-500">₹{vendor.totalPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-admin-border/50">
                                <span className="text-[10px] font-black text-editorial-accent uppercase tracking-widest">Current Balance</span>
                                <span className="text-lg font-black text-editorial-accent">₹{vendor.pendingBalance.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            className="w-full p-4 bg-admin-bg-tertiary border-t border-admin-border text-admin-text font-black text-[10px] uppercase tracking-widest hover:bg-admin-accent hover:text-white transition-all flex items-center justify-center gap-2"
                            onClick={() => {/* Navigate to vendor details */}}
                        >
                            View Statement <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorLedger;
