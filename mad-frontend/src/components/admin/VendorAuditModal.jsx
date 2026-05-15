import React, { useState, useMemo } from 'react';
import { 
    History, X, Calendar, Search, Filter, 
    ArrowRight, CheckCircle2, Receipt, Loader2,
    Package, DollarSign, Clock, Download,
    AlertTriangle, Lock, ChevronDown, Check
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../../services/vendorService';
import { useToast } from '../ui/Toast';

const VendorAuditModal = ({ vendor, onClose }) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedReqs, setSelectedReqs] = useState([]);
    const [globalError, setGlobalError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    });

    const { data: auditData, isLoading } = useQuery({
        queryKey: ['vendorAudit', vendor.id, filters],
        queryFn: () => vendorService.getAudit(vendor.id, filters),
        keepPreviousData: true
    });

    const invoiceMutation = useMutation({
        mutationFn: (reqIds) => vendorService.generateInvoicePdf(vendor.id, reqIds),
        onSuccess: (result) => {
            showToast('success', `Invoice PDF downloaded: ${result.filename}`);
            setSelectedReqs([]);
            setGlobalError(null);
            queryClient.invalidateQueries(['vendorAudit', vendor.id]);
        },
        onError: (error) => {
            const errorData = error?.response?.data;
            let message = 'Failed to generate invoice PDF';

            if (errorData instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result);
                        if (json.errorCode === 'ERR_ALREADY_INVOICED') {
                            message = 'Validation Error: Some items were already included in another invoice. Please refresh.';
                        } else {
                            message = json.message || 'Server error during PDF generation. Please check vendor details for special characters like ampersands (&).';
                        }
                    } catch {
                        message = 'A server error occurred. This is likely due to invalid characters (&) in the invoice data.';
                    }
                    setGlobalError(message);
                    showToast('error', message);
                    setSelectedReqs([]);
                    queryClient.invalidateQueries(['vendorAudit', vendor.id]);
                };
                reader.readAsText(errorData);
            } else {
                message = errorData?.message || error.message || 'Failed to generate invoice PDF';
                setGlobalError(message);
                showToast('error', message);
                setSelectedReqs([]);
                queryClient.invalidateQueries(['vendorAudit', vendor.id]);
            }
        }
    });

    const toggleSelection = (id) => {
        setSelectedReqs(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleGenerateInvoice = () => {
        if (selectedReqs.length === 0) return;
        invoiceMutation.mutate(selectedReqs);
    };

    const { invoiceableItems, invoicedItems } = useMemo(() => {
        const content = auditData?.content || [];
        return {
            invoiceableItems: content.filter(item => item.status !== 'INVOICED'),
            invoicedItems: content.filter(item => item.status === 'INVOICED')
        };
    }, [auditData]);

    const selectedTotal = useMemo(() => {
        const content = auditData?.content || [];
        return content
            .filter(i => selectedReqs.includes(i.requisitionId))
            .reduce((sum, i) => sum + (i.totalCost || 0), 0);
    }, [auditData, selectedReqs]);

    const handleSelectAllInvoiceable = () => {
        if (selectedReqs.length === invoiceableItems.length && invoiceableItems.length > 0) {
            setSelectedReqs([]);
        } else {
            setSelectedReqs(invoiceableItems.map(i => i.requisitionId));
        }
    };

    const filterInputClass = "bg-admin-bg-primary border border-admin-border rounded-xl px-3 py-2.5 text-xs font-medium text-admin-text focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/10 outline-none transition-all appearance-none cursor-pointer w-full";

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
             style={{ backgroundColor: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(16px)' }}>
            <div className="bg-admin-bg-secondary w-full sm:max-w-4xl rounded-t-[2rem] sm:rounded-[2rem] border border-admin-border animate-modal-enter flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden relative"
                 style={{ boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)' }}>
                
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-admin-accent/50 to-transparent" />
                
                {/* Header — compact on mobile */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-admin-border bg-admin-bg-secondary flex justify-between items-center flex-shrink-0 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 sm:p-3 bg-admin-accent/10 rounded-xl sm:rounded-2xl border border-admin-accent/20 flex-shrink-0">
                            <History className="w-5 h-5 sm:w-6 sm:h-6 text-admin-accent" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-xl font-bold text-admin-text font-admin tracking-tight truncate">
                                {vendor.name} Audit Log
                            </h2>
                            <p className="text-[9px] sm:text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 opacity-60">
                                Global Procurement & Financial Fulfillment
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-admin-hover text-admin-text-muted hover:text-admin-text transition-all cursor-pointer group flex-shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Filters Bar — stacked on mobile */}
                <div className="px-4 sm:px-8 py-3 sm:py-4 bg-admin-bg-secondary border-b border-admin-border flex-shrink-0 relative z-10 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                    {/* Date filters row */}
                    <div className="flex items-center gap-2 sm:gap-3">
                            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1.5 block font-admin ml-1">From Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-muted opacity-50" />
                                <input 
                                    type="date"
                                    className={`${filterInputClass} pl-9`}
                                value={filters.startDate}
                                onChange={e => setFilters({...filters, startDate: e.target.value})}
                            />
                        </div>
                        <div className="w-2 h-0.5 bg-admin-border rounded-full flex-shrink-0" />
                        <div className="flex-1 sm:flex-none">
                            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1.5 block font-admin ml-1">To Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-muted opacity-50" />
                                <input 
                                    type="date"
                                    className={`${filterInputClass} pl-9`}
                                value={filters.endDate}
                                onChange={e => setFilters({...filters, endDate: e.target.value})}
                            />
                        </div>
                        </div>
                    </div>

                    {/* Status filter + action buttons row */}
                    <div className="flex items-end gap-2 sm:gap-3 sm:flex-1">
                        <div className="flex-1 sm:flex-none">
                            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1.5 block font-admin ml-1">Status Filter</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-muted opacity-50 pointer-events-none" />
                                {filters.status && <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-admin-accent animate-ping opacity-20 pointer-events-none" />}
                                {filters.status && <span className="absolute left-2.5 top-2.5 w-1.5 h-1.5 rounded-full bg-admin-accent border border-admin-bg-secondary pointer-events-none" />}
                            <select 
                                className={`${filterInputClass} pl-9 pr-8`}
                                value={filters.status}
                                onChange={e => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">All Fulfillment Status</option>
                                <option value="ASSIGNED">Assigned Order</option>
                                <option value="RECEIVED">Material Received</option>
                                <option value="INVOICED">Already Invoiced</option>
                            </select>
                        </div>
                        </div>
                        
                        <div className="flex gap-2 sm:ml-auto flex-shrink-0">
                            {invoiceableItems.length > 0 && (
                                <button
                                    onClick={handleSelectAllInvoiceable}
                                    className="px-3 sm:px-4 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-xl border border-admin-border text-admin-text hover:bg-admin-hover transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <Check className={`w-3 h-3 ${selectedReqs.length === invoiceableItems.length ? 'text-admin-accent' : 'opacity-20'}`} />
                                    <span className="hidden sm:inline">{selectedReqs.length === invoiceableItems.length ? 'Deselect All' : 'Select All'}</span>
                                    <span className="sm:hidden">{selectedReqs.length === invoiceableItems.length ? 'Deselect All' : 'Select All'}</span>
                                </button>
                            )}
                            <button 
                                onClick={handleGenerateInvoice}
                                disabled={selectedReqs.length === 0 || invoiceMutation.isLoading}
                                className="bg-gradient-to-r from-admin-accent to-indigo-600 hover:from-admin-accent-hover hover:to-indigo-700 text-white rounded-xl px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest flex items-center gap-1.5 sm:gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-admin-accent/20 whitespace-nowrap"
                            >
                                {invoiceMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                                <span className="hidden sm:inline">Generate Invoice ({selectedReqs.length})</span>
                                <span className="sm:hidden">Invoice ({selectedReqs.length})</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Global Error Banner */}
                {globalError && (
                    <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-start gap-3 animate-shake relative z-10">
                        <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Protocol Execution Error</p>
                            <p className="text-xs sm:text-sm text-red-100/80 mt-1 leading-relaxed font-medium">{globalError}</p>
                        </div>
                        <button 
                            onClick={() => setGlobalError(null)}
                            className="p-1.5 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </button>
                    </div>
                )}

                {/* Audit List */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 custom-scrollbar relative z-0">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-admin-accent animate-spin" />
                                <p className="text-xs font-bold text-admin-text-muted uppercase tracking-[0.2em] animate-pulse">Syncing Audit Records...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {/* Invoiceable Items */}
                            {invoiceableItems.length > 0 && (
                                <>
                                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                        <div className="h-px flex-1 bg-admin-border/50" />
                                        <p className="text-[9px] sm:text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2 whitespace-nowrap">
                                            <Package className="w-3.5 h-3.5 text-admin-accent/60" /> Available for Invoicing ({invoiceableItems.length})
                                        </p>
                                        <div className="h-px flex-1 bg-admin-border/50" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {invoiceableItems.map((item) => (
                                            <AuditRow 
                                                key={item.requisitionId} 
                                                item={item} 
                                                isSelected={selectedReqs.includes(item.requisitionId)}
                                                onToggle={() => toggleSelection(item.requisitionId)}
                                                selectable={true}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Already Invoiced Items */}
                            {invoicedItems.length > 0 && (
                                <>
                                    <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-admin-border/50" />
                                        <p className="text-[9px] sm:text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2 whitespace-nowrap">
                                            <Lock className="w-3.5 h-3.5 opacity-40" /> Historical Fulfillment ({invoicedItems.length})
                                        </p>
                                        <div className="h-px flex-1 bg-admin-border/50" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {invoicedItems.map((item) => (
                                            <AuditRow 
                                                key={item.requisitionId} 
                                                item={item} 
                                                isSelected={false}
                                                onToggle={() => {}}
                                                selectable={false}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {invoiceableItems.length === 0 && invoicedItems.length === 0 && (
                                <div className="text-center py-16 sm:py-24 bg-admin-bg/30 rounded-2xl sm:rounded-3xl border border-dashed border-admin-border/50 backdrop-blur-sm">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-admin-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                        <History className="w-7 h-7 sm:w-8 sm:h-8 text-admin-text-muted opacity-20" />
                                    </div>
                                    <h3 className="font-bold text-base sm:text-lg text-admin-text font-admin">No Transactional Data</h3>
                                    <p className="text-xs sm:text-sm text-admin-text-muted mt-2 max-w-xs mx-auto opacity-60 px-4">Adjust filters or check back after next fulfillment cycle.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Stats — stacked on mobile */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 bg-admin-bg-secondary border-t border-admin-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 flex-shrink-0 relative z-10">
                    <div className="flex gap-8 sm:gap-12">
                        <div>
                            <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1 opacity-60">Record Volume</p>
                            <p className="text-xl sm:text-2xl font-bold text-admin-text tracking-tight font-mono">{auditData?.totalElements || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest mb-1 opacity-60">Gross Valuation</p>
                            <p className="text-xl sm:text-2xl font-bold text-admin-accent tracking-tight font-mono">
                                ₹{selectedTotal.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 sm:gap-3">
                        <button 
                            disabled={selectedReqs.length === 0}
                            onClick={() => setSelectedReqs([])}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-admin-border rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-admin-text hover:bg-admin-hover transition-all disabled:opacity-20 cursor-pointer text-center"
                        >
                            Reset Focus
                        </button>
                        <button 
                            onClick={() => {
                                if (!auditData?.content?.length) return;
                                const headers = ['Date', 'Item', 'Quantity', 'Unit', 'Unit Price (₹)', 'Total Cost (₹)', 'Status'];
                                const rows = auditData.content.map(item => [
                                    new Date(item.date).toLocaleDateString(),
                                    item.itemName,
                                    item.quantity,
                                    item.unit,
                                    item.unitPrice || 0,
                                    item.totalCost || 0,
                                    item.status
                                ]);
                                const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${vendor.name}-audit-protocol.csv`;
                                link.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-admin-bg-tertiary text-admin-text rounded-xl sm:rounded-2xl border border-admin-border text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:border-admin-accent/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-admin-bg-secondary"
                        >
                            <Download className="w-4 h-4 opacity-50" /> Export Dataset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Individual Audit Row — Responsive ── */
const AuditRow = ({ item, isSelected, onToggle, selectable }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'RECEIVED':
                return { bgStyle: { backgroundColor: 'rgba(16,185,129,0.1)' }, textClass: 'text-green-400', borderClass: 'border-green-500/20', Icon: CheckCircle2 };
            case 'INVOICED':
                return { bgStyle: { backgroundColor: 'rgba(148,163,184,0.05)' }, textClass: 'text-admin-text-muted', borderClass: 'border-admin-border/50', Icon: Lock };
            default: // ASSIGNED
                return { bgStyle: { backgroundColor: 'rgba(79,70,229,0.1)' }, textClass: 'text-admin-accent', borderClass: 'border-admin-accent/20', Icon: Package };
        }
    };

    const config = getStatusConfig(item.status);
    const StatusIcon = config.Icon;

    return (
        <div 
            onClick={selectable ? onToggle : undefined}
            className={`px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden group ${
                !selectable 
                    ? 'bg-admin-bg-tertiary/30 border-admin-border/50 opacity-60 cursor-default grayscale' 
                    : isSelected
                        ? 'border-admin-accent bg-admin-accent/5 shadow-lg shadow-admin-accent/5'
                        : 'bg-admin-bg-secondary border-admin-border hover:border-admin-accent/40 hover:bg-admin-bg-tertiary/50 cursor-pointer shadow-sm'
            }`}
        >
            {isSelected && selectable && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-admin-accent" />
            )}

            {/* Mobile: stacked layout, Desktop: horizontal */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border ${config.borderClass} shadow-sm group-hover:scale-105 transition-transform duration-300`}
                     style={config.bgStyle}>
                    <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.textClass}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-admin-text truncate tracking-tight font-admin group-hover:text-admin-accent transition-colors">
                            {item.itemName}
                        </h4>
                        {/* Checkbox — visible on all sizes */}
                        {selectable && (
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-admin-accent border-admin-accent shadow-md shadow-admin-accent/20' : 'border-admin-border group-hover:border-admin-accent/50'
                            }`}>
                                {isSelected && (
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        <span className="text-[10px] font-bold text-admin-text-muted flex items-center gap-1.5 uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                            <Clock className="w-3 h-3 text-admin-accent" /> {new Date(item.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-admin-text-muted flex items-center gap-1.5 uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                            <Package className="w-3 h-3 text-admin-accent" /> {item.quantity} {item.unit}
                        </span>
                        {item.status === 'INVOICED' && (
                            <span className="text-[10px] font-bold text-admin-success flex items-center gap-1.5 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Invoiced
                            </span>
                        )}
                    </div>

                    {/* Price row — inline on mobile */}
                    <div className="flex items-center gap-4 sm:gap-6 mt-2.5 pt-2.5 border-t border-admin-border/30 sm:border-0 sm:pt-0 sm:mt-1.5">
                        <div>
                            <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest opacity-50 mb-0.5">Unit</p>
                            <p className="text-xs sm:text-sm font-mono font-bold text-admin-text">₹{item.unitPrice?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest opacity-50 mb-0.5">Total</p>
                            <p className="text-sm sm:text-lg font-mono font-bold text-admin-accent">₹{item.totalCost?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAuditModal;
