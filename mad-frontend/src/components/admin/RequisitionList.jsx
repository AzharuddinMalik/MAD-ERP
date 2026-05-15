import React from 'react';
import { AlertCircle, Package, ChevronRight, Clock, MapPin, ClipboardList, DollarSign, CheckCircle2 } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const urgencyConfig = {
    CRITICAL: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
    URGENT: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)', label: 'Urgent' },
    NORMAL: { bg: 'rgba(99,102,241,0.1)', text: '#6366F1', border: 'rgba(99,102,241,0.2)', label: 'Normal' },
};

const statusConfig = {
    PENDING: { bg: 'rgba(99,102,241,0.1)', text: '#6366F1', border: 'rgba(99,102,241,0.25)' },
    APPROVED: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    ASSIGNED: { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6', border: 'rgba(59,130,246,0.25)' },
    REJECTED: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.25)' },
    DISPATCHED: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', border: 'rgba(34,197,94,0.25)' },
};

const RequisitionCard = ({ req, isAdmin, onApprove, onReject, onAssignVendor }) => {
    const urgency = urgencyConfig[req.urgency] || urgencyConfig.NORMAL;
    const status = statusConfig[req.status] || statusConfig.PENDING;

    return (
        <div
            className="bg-admin-bg-secondary rounded-xl border border-admin-border hover:border-admin-accent/30 transition-all duration-200 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
            <div className="p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Left: Item info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: urgency.bg, color: urgency.text, border: `1px solid ${urgency.border}` }}
                        >
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="text-base font-bold text-admin-text font-admin leading-tight truncate">{req.customItemName}</h3>
                                {req.vendor && (
                                    <span
                                        className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md"
                                        style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                                    >
                                        <Package className="w-3 h-3" /> {req.vendor.name}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase bg-admin-bg px-2 py-1 rounded border border-admin-border/50 text-admin-text-muted font-mono">
                                    {req.quantity} {req.unitOfMeasure}
                                </span>
                                {req.project?.name && (
                                    <span className="text-[11px] text-admin-text-secondary font-medium font-admin flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-admin-text-muted" />
                                        {req.project.name}
                                    </span>
                                )}
                                <span
                                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                    style={{ backgroundColor: urgency.bg, color: urgency.text, border: `1px solid ${urgency.border}` }}
                                >
                                    {urgency.label}
                                </span>
                            </div>
                            {req.remarks && (
                                <p className="text-xs text-admin-text-muted mt-2.5 italic font-admin leading-relaxed border-l-2 border-admin-border pl-3">
                                    "{req.remarks}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Status + Actions */}
                    <div className="flex md:flex-col justify-between items-end gap-3 flex-shrink-0">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-admin-text-muted uppercase tracking-[0.12em] mb-1.5 font-admin">Status</p>
                            <span
                                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}
                            >
                                {req.status}
                            </span>
                        </div>

                        {isAdmin && (
                            <div className="flex gap-2">
                                {req.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => onApprove(req)}
                                            className="px-4 py-2 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                            style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onReject(req)}
                                            className="px-4 py-2 min-h-[44px] bg-admin-bg border border-admin-border text-admin-text-muted hover:text-red-400 hover:border-red-400/40 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {req.status === 'APPROVED' && (
                                    <button
                                        onClick={() => onAssignVendor(req)}
                                        className="px-4 py-2 min-h-[44px] bg-admin-accent hover:bg-admin-accent-hover text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                        style={{ boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}
                                    >
                                        <Package className="w-3 h-3" /> Assign Vendor
                                    </button>
                                )}
                                {(req.status === 'DISPATCHED' || req.status === 'RECEIVED') && req.paymentStatus !== 'PAID' && (
                                    <button
                                        onClick={() => onMarkAsPaid(req)}
                                        className="px-4 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-lg"
                                    >
                                        <DollarSign className="w-3 h-3" /> Mark as Paid
                                    </button>
                                )}
                                {req.paymentStatus === 'PAID' && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-black uppercase">
                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RequisitionList = ({ requisitions, reqStatusFilter, onStatusFilterChange, isAdmin, onApprove, onReject, onAssignVendor, onMarkAsPaid }) => {
    const statusTabs = ['PENDING', 'APPROVED', 'ASSIGNED', 'REJECTED', 'DISPATCHED', 'RECEIVED'];
    const filtered = requisitions.filter(r => r.status === reqStatusFilter);

    return (
        <div className="space-y-4">
            {/* Status Sub-tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {statusTabs.map(status => {
                    const count = requisitions.filter(r => r.status === status).length;
                    const isActive = reqStatusFilter === status;
                    const sConfig = statusConfig[status] || statusConfig.PENDING;

                    return (
                        <button
                            key={status}
                            onClick={() => onStatusFilterChange(status)}
                            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 border flex-shrink-0 cursor-pointer ${
                                isActive
                                    ? 'text-white'
                                    : 'bg-admin-bg-secondary text-admin-text-muted border-admin-border hover:text-admin-text hover:border-admin-accent/30'
                            }`}
                            style={isActive ? {
                                backgroundColor: sConfig.text,
                                borderColor: sConfig.text,
                                boxShadow: `0 2px 10px ${sConfig.text}30`,
                            } : {}}
                        >
                            {status}
                            {count > 0 && (
                                <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'opacity-50'}`}>({count})</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <EmptyState 
                        title={`No ${reqStatusFilter.toLowerCase()} requests`}
                        description="Requests will appear here once they are submitted by supervisors or admin."
                        icon={ClipboardList}
                    />
                ) : (
                    filtered.map(req => (
                        <RequisitionCard
                            key={req.id}
                            req={req}
                            isAdmin={isAdmin}
                            onApprove={onApprove}
                            onReject={onReject}
                            onAssignVendor={onAssignVendor}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Simple clipboard icon for empty state
const ClipboardEmpty = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

export default RequisitionList;
