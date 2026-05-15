import React, { useEffect, useState } from 'react';
import { leadService } from '../services/leadService';
import {
    Users, Search, Mail, Phone, MapPin, MessageSquare,
    Clock, CheckCircle2, AlertCircle, Calendar, ExternalLink,
    Filter, RefreshCw, ChevronRight, UserCheck, ShieldCheck,
    MoreHorizontal
} from 'lucide-react';
import PageHeader from './ui/PageHeader';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';
import { useToast } from './ui/Toast';
import { SkeletonTable } from './ui/Skeleton';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import Tooltip from './ui/Tooltip';
import { useTour } from '../contexts/TourContext';
import { Sparkles } from 'lucide-react';

const LeadMobileCard = ({ lead, isAdmin, onStatusChange, onDetail }) => {
    const dateObj = new Date(lead.submittedAt);
    const statusColors = {
        'NEW': 'bg-admin-accent/10 text-admin-accent border-admin-accent/20',
        'CONTACTED': 'bg-admin-info/10 text-admin-info border-admin-info/20',
        'CLOSED': 'bg-admin-success/10 text-admin-success border-admin-success/20'
    };

    return (
        <div className="bg-admin-card border border-admin-border rounded-xl p-3 flex flex-col justify-between h-full group hover:border-admin-accent/30 transition-all duration-300">
            <div>
                <div className="flex justify-between items-start gap-2">
                    <Tooltip content="Current lead status. Click to advance the stage." position="right">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[lead.status || 'NEW']}`}>
                            {lead.status || 'NEW'}
                        </span>
                    </Tooltip>
                    <span className="text-[9px] font-mono text-admin-text-muted">
                        {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                </div>
                
                <h4 className="font-bold text-admin-text text-xs mt-2 line-clamp-1 group-hover:text-admin-accent transition-colors" title={lead.name}>
                    {lead.name}
                </h4>

                <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-admin-text-secondary">
                        <Phone className="w-3 h-3 text-admin-text-muted/60" />
                        <span className="text-[10px] font-mono">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-admin-text-secondary">
                        <MapPin className="w-3 h-3 text-admin-text-muted/60" />
                        <span className="text-[10px] truncate">{lead.city || 'N/A'}</span>
                    </div>
                </div>

                {lead.serviceNeeded && (
                    <div className="mt-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded inline-block">
                        {lead.serviceNeeded}
                    </div>
                )}
            </div>

            <div className="mt-3 pt-2 border-t border-admin-border/50 flex gap-1.5">
                <button 
                    onClick={onDetail}
                    className="flex-1 bg-admin-bg-tertiary hover:bg-admin-hover text-admin-text-muted hover:text-admin-accent py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all"
                >
                    Details
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => onStatusChange(lead.id, lead.status)}
                        className="px-2 bg-admin-bg-tertiary hover:bg-admin-accent/10 text-admin-text-muted hover:text-admin-accent rounded-md transition-all"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

const LeadsManagement = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const { showToast } = useToast();
    const { startTour } = useTour();
    const userRole = localStorage.getItem('role') || 'ROLE_SUPERVISOR';
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    const fetchLeads = async () => {
        try {
            const data = await leadService.getAllLeads();
            setLeads(data);
            setLoading(false);
        } catch (err) {
            // Guard: Ignore CanceledError to prevent UI lock-ups during rapid navigation
            if (err.name === 'CanceledError') return;

            console.error("Failed to fetch leads", err);
            setError("Failed to load leads. You might not have permission.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStatusChange = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'NEW' ? 'CONTACTED'
            : currentStatus === 'CONTACTED' ? 'CLOSED' : 'NEW';

        try {
            await leadService.updateStatus(id, nextStatus);
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: nextStatus } : lead));
            showToast('success', `Lead status updated to ${nextStatus}`);
            if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status: nextStatus });
        } catch (err) {
            showToast('error', "Failed to update lead status.");
        }
    };

    const filteredLeads = leads.filter(lead =>
        (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
            <div className="flex justify-between items-end mb-8">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-admin-border animate-pulse rounded-lg" />
                    <div className="h-4 w-64 bg-admin-border/50 animate-pulse rounded-lg" />
                </div>
            </div>
            <div className="bg-admin-card rounded-2xl p-6 border border-admin-border">
                <SkeletonTable rows={10} cols={6} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-admin px-4 md:px-0 relative mb-20">
            <PageHeader
                title="Leads & Inquiries"
                subtitle="Manage incoming prospects and project inquiries."
                icon={<Users className="w-6 h-6 text-admin-accent" />}
                backTo="/dashboard"
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                searchPlaceholder="Search leads..."
                actions={
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => startTour('leads')}
                            className="p-2 text-admin-text-muted hover:text-admin-accent hover:bg-admin-hover rounded-lg transition-colors cursor-pointer"
                            title="Start Tour"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                        <button onClick={fetchLeads} className="p-2 text-admin-text-muted hover:text-admin-accent hover:bg-admin-hover rounded-lg transition-colors cursor-pointer flex-shrink-0">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                }
            />

            {/* Error Banner */}
            {error && (
                <div className="mb-6 bg-admin-danger/10 text-admin-danger p-4 rounded-lg border border-admin-danger/20 flex items-center gap-2 text-sm font-bold">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}



            {/* Desktop Table View */}
            <div className="hidden md:block bg-admin-card rounded-2xl border border-admin-border shadow-sm overflow-x-auto custom-scrollbar w-full relative" data-tour="leads-table">
                <table className="w-full text-left border-collapse lg:whitespace-nowrap">
                    <thead>
                        <tr className="bg-admin-bg border-b border-admin-border">
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider">Date</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider">Lead Details</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider">Contact</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Location / Service</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Source</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider hidden lg:table-cell max-w-xs">Message</th>
                            <th className="p-4 font-bold text-admin-text-muted text-xs uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border">
                        {filteredLeads.map(lead => {
                            const dateObj = new Date(lead.submittedAt);
                            return (
                                <tr key={lead.id} className="hover:bg-admin-hover transition-colors group">
                                    <td className="p-4 text-xs text-admin-text-muted font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {dateObj.toLocaleDateString()}
                                        </div>
                                        <div className="mt-1 ml-5 font-mono text-[10px]">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                                            className="font-bold text-admin-text text-sm hover:text-admin-accent transition-colors text-left"
                                        >
                                            {lead.name}
                                        </button>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-2 text-admin-text-secondary font-medium">
                                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="font-mono">{lead.phone}</span>
                                            {lead.whatsappConsent && (
                                                <span className="text-[9px] bg-admin-success/20 text-admin-success border border-admin-success/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1">WA</span>
                                            )}
                                        </div>
                                        {lead.email && (
                                            <div className="flex items-center gap-2 text-admin-text-muted mt-1.5 text-xs">
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                {lead.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm hidden lg:table-cell">
                                        <div className="flex items-center gap-2 text-admin-text-secondary font-medium">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                            {lead.city || 'N/A'}
                                        </div>
                                        {lead.serviceNeeded && (
                                            <div className="text-xs text-indigo-400 mt-1.5 font-bold ml-5 uppercase tracking-wider">
                                                {lead.serviceNeeded}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="px-2.5 py-1 text-[10px] font-bold bg-admin-bg text-admin-text-secondary rounded border border-admin-border uppercase tracking-widest">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        {lead.message ? (
                                            <button 
                                                onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                                                className="text-xs text-admin-text-secondary truncate block max-w-[150px] hover:text-admin-info transition-colors text-left font-medium"
                                            >
                                                {lead.message}
                                            </button>
                                        ) : (
                                            <span className="text-admin-text-muted text-xs italic opacity-50">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Tooltip content={isAdmin ? "Click to cycle through NEW → CONTACTED → CLOSED" : "Lead current stage"}>
                                            <button
                                                data-tour="lead-status"
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${isAdmin ? 'cursor-pointer hover:bg-admin-accent/20' : 'cursor-default'} ${lead.status === 'NEW'
                                                        ? 'bg-admin-accent/10 text-admin-accent border-admin-accent/20'
                                                        : lead.status === 'CONTACTED'
                                                            ? 'bg-admin-info/10 text-admin-info border-admin-info/20'
                                                            : 'bg-admin-success/10 text-admin-success border-admin-success/20'
                                                    }`}
                                                disabled={!isAdmin}
                                                onClick={() => isAdmin && handleStatusChange(lead.id, lead.status)}
                                            >
                                                {lead.status === 'NEW' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                                                {lead.status === 'CLOSED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {lead.status || 'NEW'}
                                            </button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View — High Density 2x2 Grid */}
            <div className="md:hidden grid grid-cols-2 gap-3">
                {filteredLeads.map(lead => (
                    <LeadMobileCard 
                        key={lead.id} 
                        lead={lead} 
                        isAdmin={isAdmin} 
                        onStatusChange={handleStatusChange}
                        onDetail={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredLeads.length === 0 && (
                <EmptyState 
                    title="No inquiries found"
                    description="Try adjusting your search terms or wait for new leads to arrive."
                    icon={Users}
                />
            )}

            {/* Lead Details Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedLead(null); }}
                title="Lead Details"
                icon={<Users className="w-6 h-6 text-admin-accent" />}
                maxWidth="max-w-2xl"
            >
                {selectedLead && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-admin-text">{selectedLead.name}</h3>
                                <p className="text-sm text-admin-text-muted mt-1">Submitted on {new Date(selectedLead.submittedAt).toLocaleString()}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-admin-bg border border-admin-border text-admin-text-secondary">
                                {selectedLead.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-admin-bg p-6 rounded-2xl border border-admin-border shadow-inner">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Contact Phone</p>
                                    <p className="font-mono text-admin-text font-medium">{selectedLead.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Contact Email</p>
                                    <p className="text-admin-text font-medium">{selectedLead.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Location</p>
                                    <p className="text-admin-text font-medium">{selectedLead.city || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-1">Service Needed</p>
                                    <p className="text-admin-text font-medium">{selectedLead.serviceNeeded || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {selectedLead.message && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted mb-2">Message Content</p>
                                <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-sm text-admin-text-secondary leading-relaxed">
                                    {selectedLead.message}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-admin-border">
                            <ModalCancelButton onClick={() => { setIsDetailOpen(false); setSelectedLead(null); }}>
                                Close
                            </ModalCancelButton>
                            {isAdmin && selectedLead.status !== 'CLOSED' && (
                                <ModalPrimaryButton onClick={() => {
                                    handleStatusChange(selectedLead.id, selectedLead.status);
                                }}>
                                    Advance Status
                                </ModalPrimaryButton>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeadsManagement;
