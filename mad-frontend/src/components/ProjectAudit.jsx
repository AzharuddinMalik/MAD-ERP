import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
    AlertTriangle, CheckCircle, Users, FileText,
    ArrowLeft, Phone, MapPin, Hammer, ArrowRight,
    ShieldCheck, Activity, Search, RefreshCw, ClipboardCheck,
    Printer, Download, Mail, Building, Clock
} from 'lucide-react';
import PageHeader from './ui/PageHeader';
import { useToast } from './ui/Toast';
import { SkeletonTable } from './ui/Skeleton';
import { useLabourDrawer } from '../hooks/useLabourDrawer';
import LabourDrawer from './LabourDrawer';

const ProjectAudit = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const { showToast } = useToast();
    const role = localStorage.getItem('role') || 'ROLE_SUPERVISOR';
    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
    const drawer = useLabourDrawer(projectId);

    useEffect(() => {
        const fetchAuditData = async () => {
            try {
                const [projRes, boqRes] = await Promise.all([
                    api.get(`/admin/projects/${projectId}`),
                    api.get(`/measurements/project/${projectId}`)
                ]);

                setProject(projRes.data);

                const newAlerts = [];

                const boqItems = boqRes.data;
                const overrunItems = boqItems.filter(item => item.completedScope > item.totalScope);
                if (overrunItems.length > 0) {
                    newAlerts.push({
                        type: 'critical',
                        title: 'Scope Overrun Detected',
                        message: `${overrunItems.length} items have measurements exceeding the budget. Please verify before billing.`
                    });
                }
                
                setAlerts(newAlerts);

            } catch (err) {
                if (err.name === 'CanceledError') return;
                console.error("Audit load failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditData();
    }, [projectId]);

    if (loading && !project?.name) return (
        <div className="min-h-screen bg-mad-bg-light dark:bg-mad-bg-dark flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-mad-sage/20 border-t-mad-sage rounded-full animate-spin"></div>
                <p className="text-mad-sage font-mad font-bold tracking-widest animate-pulse uppercase">VALIDATING STRUCTURAL INTEGRITY...</p>
            </div>
        </div>
    );

    if (!project) return (
        <div className="flex flex-col items-center justify-center p-20 text-admin-danger/80">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-admin-text">Project Disconnected</h2>
            <p className="text-admin-text-secondary text-sm mt-2">The requested project ID does not exist or access was denied.</p>
            <button onClick={() => navigate('/projects')} className="mt-6 px-6 py-2.5 bg-admin-card border border-admin-border text-admin-text font-bold rounded-xl hover:text-admin-accent transition-colors">Return to Safety</button>
        </div>
    );

    const handleFinalize = async () => {
        if (!window.confirm("Are you sure you want to finalize this project? This will generate a permanent invoice and mark the project as INVOICED.")) return;

        setLoading(true);
        showToast('info', "Ledger Uplink Initiated", { description: "Securing project data for structural billing finalization." });

        try {
            const res = await api.post(`/admin/projects/${projectId}/finalize`);
            showToast('success', "Project Finalized", { description: `Invoice ${res.data.invoiceNumber || 'Created'} has been successfully registered.` });

            // Refresh data to show Invoice view
            const [projRes] = await Promise.all([
                api.get(`/admin/projects/${projectId}`)
            ]);
            setProject(projRes.data);
        } catch (err) {
            console.error("Finalization failed", err);
            // 409 Recovery: If already invoiced, just refresh and show the invoice
            if (err.response?.status === 409 || err.response?.data?.message?.includes("already invoiced")) {
                showToast('info', "Already Invoiced", { description: "Project was already finalized. Redrawng ledger..." });
                const projRes = await api.get(`/admin/projects/${projectId}`);
                setProject(projRes.data);
            } else {
                showToast('error', "Finalization Inhibited", { description: err.response?.data || "A technical anomaly occurred during ledger entry." });
            }
            setLoading(false);
        }
    };

    if (project.status === 'INVOICED') {
        return <InvoiceView project={project} onBack={() => navigate('/active-projects')} />;
    }

    return (
        <div className="font-mad text-admin-text space-y-8 max-w-6xl mx-auto px-4 md:px-0 mb-24 relative animate-fade-in print:hidden">
            {/* Header / Navigation */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
                <div>
                    <button
                        onClick={() => navigate('/active-projects')}
                        className="flex items-center gap-2 text-xs font-bold text-mad-sage hover:text-mad-sage-dark transition-colors uppercase tracking-widest mb-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-admin-text tracking-tight flex items-center gap-3">
                        Integrity Audit
                        <ShieldCheck className="w-8 h-8 text-mad-sage" />
                    </h1>
                    <p className="text-admin-text-secondary text-sm mt-1">
                        {project.name} • <span className="text-mad-sage/80 font-bold">{project.location}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={drawer.openDrawer}
                        className="px-5 py-2.5 bg-admin-card border border-admin-accent/50 text-admin-accent font-bold rounded-xl hover:bg-admin-accent/10 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-95"
                    >
                        <Users className="w-4 h-4" /> 
                        <span className="hidden sm:inline">Workforce Command</span>
                        <span className="sm:hidden">Crew</span>
                    </button>
                    {project.status === 'INVOICED' ? (
                        <div className="px-5 py-2.5 bg-mad-sage/10 text-mad-sage rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-mad-sage/30 shadow-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Finalized & Ledgered
                        </div>
                    ) : (
                        <div className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2 ${alerts.length === 0 ? 'bg-mad-sage/5 text-mad-sage border-mad-sage/20' : 'bg-admin-danger/5 text-admin-danger border-admin-danger/20'}`}>
                            {alerts.length === 0 ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {alerts.length === 0 ? 'Structural Integrity Verified' : 'Intervention Required'}
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 bg-admin-card border border-admin-border text-admin-text-secondary hover:text-mad-sage rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>
            
            {/* Soft Attendance Banner */}
            {!drawer.hasAttendanceLoggedToday && project.status !== 'INVOICED' && drawer.workers.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center gap-3 text-amber-500">
                        <div className="bg-amber-500/20 p-2 rounded-full hidden sm:block">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-wide">Daily Attendance Pending</p>
                            <p className="text-xs opacity-80 mt-0.5">Please update the workforce roster for today's logs.</p>
                        </div>
                    </div>
                    <button 
                        onClick={drawer.openDrawer}
                        className="px-4 py-2 bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap w-full sm:w-auto text-center shadow-md active:scale-95"
                    >
                        Update Now
                    </button>
                </div>
            )}

            {/* Hero Summary Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 h-40 md:h-52 flex items-center border border-white/5 group shadow-2xl">
                <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
                    <img
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
                        alt="Interior Concept"
                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>

                <div className="relative z-10 px-8 flex flex-col md:flex-row md:items-center justify-between w-full gap-6">
                    <div>
                        <span className="text-mad-sage text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Structural Summary</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Financial Finalization</h2>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Work Progress</p>
                            <p className="text-white text-xl font-black leading-none">{project.progressPercentage}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Resource Count</p>
                            <p className="text-white text-xl font-black leading-none">{drawer.activeCrewCount} <span className="text-[10px] text-white/60 font-medium">/ {drawer.activeCrewTotalCount} Active</span></p>
                        </div>
                        <div className="space-y-1 lg:pl-6 lg:border-l lg:border-white/10">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Audit Status</p>
                            <p className={`text-xl font-black leading-none ${alerts.length === 0 ? 'text-mad-sage' : 'text-admin-danger'}`}>
                                {alerts.length === 0 ? 'OPTIMAL' : 'REJECTED'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Section - Alerts and Insights */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-xs font-black text-admin-text-secondary uppercase tracking-[0.2em] px-1">Audit Layers</h3>

                    {/* Compliance Indicator */}
                    <div className={`p-6 rounded-[1.5rem] border animate-in slide-in-from-left duration-500 ${alerts.length === 0 ? 'bg-mad-sage/5 border-mad-sage/20' : 'bg-admin-danger/5 border-admin-danger/20'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-2xl ${alerts.length === 0 ? 'bg-mad-sage/10 text-mad-sage' : 'bg-admin-danger/10 text-admin-danger'}`}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-admin-text">Validation Result</h4>
                                <p className="text-xs text-admin-text-secondary">Comprehensive structural check</p>
                            </div>
                        </div>
                        {alerts.length === 0 ? (
                            <p className="text-sm text-mad-sage font-medium leading-relaxed">
                                Project metrics are within baseline tolerances. Structural integrity verified for invoice generation.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {alerts.slice(0, 3).map((alert, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm text-admin-danger border-t border-admin-danger/10 pt-3 first:border-0 first:pt-0">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{alert.title}: {alert.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Operational Hygiene */}
                    <div className="bg-admin-card border border-admin-border p-6 rounded-[1.5rem] space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-admin-text">Operational Hygiene</h4>
                            <div className="p-2 bg-admin-accent/10 rounded-lg">
                                <Activity className="w-4 h-4 text-admin-accent" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-admin-text-secondary">Recent Logs</span>
                                <span className="text-admin-success font-bold">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-admin-text-secondary">Roster Status</span>
                                <span className={`${drawer.hasAttendanceLoggedToday ? 'text-admin-success' : 'text-amber-500'} font-bold`}>
                                    {drawer.hasAttendanceLoggedToday ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-admin-border/50 pt-3 mt-3">
                                <span className="text-admin-text-secondary">Est. Labour Cost</span>
                                <span className="text-admin-text font-bold">₹{drawer.activeLabourCost}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Table and Actions */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-admin-text-secondary uppercase tracking-[0.2em]">Verified Scope Matrix</h3>
                        <span className="text-[10px] text-admin-text-muted font-bold">RECORDS: {project.boqItems?.length || 0} ITEMS</span>
                    </div>

                    <div className="bg-admin-card border border-admin-border rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-admin-bg/50 border-b border-admin-border text-admin-text-secondary">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Structural Item</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Efficiency</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Value (Work Done)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {(project.boqItems || []).map((item) => {
                                        const percentage = item.totalScope > 0 ? (item.completedScope / item.totalScope) * 100 : 0;
                                        return (
                                            <tr key={item.id} className="group hover:bg-admin-bg transition-colors duration-200">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-admin-text group-hover:text-mad-sage transition-colors">{item.itemName}</div>
                                                    <div className="text-[10px] text-admin-text-muted font-bold mt-1 uppercase tracking-wider">{item.unit} • RATE: ₹{item.rate}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-full max-w-[80px] h-1.5 bg-admin-bg-tertiary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-mad-sage' : 'bg-admin-accent'}`}
                                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-[10px] font-black ${percentage >= 100 ? 'text-mad-sage' : 'text-admin-text-secondary'}`}>
                                                            {percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-black text-admin-text tracking-tight">
                                                    ₹{(item.completedScope * item.rate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {!project.boqItems?.length && (
                            <div className="p-12 text-center text-admin-text-muted italic border-t border-admin-border">
                                No structural records found for this registry.
                            </div>
                        )}
                    </div>

                    {/* Finalization Action */}
                    <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom duration-700">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="p-4 bg-mad-sage/10 text-mad-sage rounded-[1.5rem] hidden md:block">
                                <ClipboardCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-admin-text tracking-tight">Generate Financial Baseline</h4>
                                <p className="text-sm text-admin-text-secondary max-w-md">Finalize structural audit and generate a permanent ledger entry for project billing.</p>
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={handleFinalize}
                                disabled={loading || project.status === 'INVOICED' || alerts.length > 0}
                                className={`
                                    relative px-12 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group overflow-hidden
                                    ${project.status === 'INVOICED'
                                        ? 'bg-admin-bg border border-admin-border text-admin-text-muted cursor-not-allowed'
                                        : alerts.length > 0
                                            ? 'bg-admin-bg border border-admin-border text-admin-text-muted cursor-not-allowed grayscale'
                                            : 'bg-mad-sage text-slate-900 hover:bg-mad-sage-dark shadow-[0_20px_40px_rgba(134,167,137,0.3)]'}
                                `}
                            >
                                <span className="relative z-10 uppercase tracking-widest text-[11px]">
                                    {project.status === 'INVOICED' ? 'Invoice Locked' : 'Finalize & Ledger'}
                                </span>
                                <ClipboardCheck className="w-5 h-5 group-hover:rotate-12 transition-transform relative z-10" />

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <LabourDrawer drawer={drawer} isFinalized={project.status === 'INVOICED'} />
        </div>
    );
};

const InvoiceView = ({ project, onBack }) => {
    const totalAmount = (project.boqItems || []).reduce((acc, item) => acc + (item.completedScope * item.rate), 0);
    const invoiceNumber = project.invoiceNumber || `INV-${project.id}-${Date.now().toString().slice(-4)}`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 font-mad animate-fade-in relative">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .invoice-card { border: none !important; shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .print-m-0 { margin: 0 !important; }
                }
            `}} />

            {/* Back & Actions - Hidden during print */}
            <div className="no-print flex justify-between items-center mb-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-bold text-mad-sage hover:text-mad-sage-dark transition-colors uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-mad-sage text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-mad-sage-dark transition-all shadow-lg shadow-mad-sage/20"
                    >
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                </div>
            </div>

            {/* The Invoice Document */}
            <div className="invoice-card bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                {/* Invoice Header */}
                <div className="bg-slate-50 dark:bg-white/5 px-10 py-12 border-b border-slate-200 dark:border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-mad-sage/10 rounded-2xl">
                                    <Building className="w-8 h-8 text-mad-sage" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Malik Art Decor</h2>
                                    <p className="text-[10px] text-mad-sage font-black uppercase tracking-[0.3em] mt-1">Interiors & Architecture</p>
                                </div>
                            </div>
                            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                                <p>Sector 18, Noida</p>
                                <p>Uttar Pradesh, India</p>
                                <p>Support: +91 98765 43210</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Invoice</h1>
                            <p className="text-mad-sage font-bold tracking-widest text-xs uppercase">Record Copy</p>
                            <div className="mt-8 space-y-1 text-sm">
                                <p className="text-slate-500 dark:text-slate-400">Number: <span className="font-bold text-slate-900 dark:text-white">{invoiceNumber}</span></p>
                                <p className="text-slate-500 dark:text-slate-400">Date: <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-12 space-y-10">
                    {/* Bill To & Project Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Client Registry</h3>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{project.clientName}</h4>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <MapPin className="w-4 h-4 text-mad-sage" />
                                    <span>{project.location}, {project?.city?.name || 'Local'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Project Overview</h3>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{project.name}</h4>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                    <Activity className="w-4 h-4 text-mad-sage" />
                                    <span>Work Done: <span className="font-bold text-slate-900 dark:text-white">{project.progressPercentage}%</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Labour Impact Summary */}
                    <div className="bg-mad-sage/5 rounded-3xl p-6 border border-mad-sage/10 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-mad-sage/10 text-mad-sage rounded-2xl">
                                <Hammer className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Structural Labour Resource</h5>
                                <p className="text-xs text-slate-500">Total manpower deployed for this scope</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{project.labourCount || project.workers?.length || 0}</p>
                            <p className="text-[10px] font-bold text-mad-sage uppercase tracking-widest">Active Personnel</p>
                        </div>
                    </div>

                    {/* BOQ Table */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Service & Scope Specification</h3>
                        <div className="overflow-hidden border border-slate-100 dark:border-white/5 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                                        <th className="px-6 py-4">Structural Item Description</th>
                                        <th className="px-6 py-4 text-center">Unit</th>
                                        <th className="px-6 py-4 text-center">Quantity</th>
                                        <th className="px-6 py-4 text-right">Rate</th>
                                        <th className="px-6 py-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {(project.boqItems || []).map((item, idx) => (
                                        <tr key={idx} className="text-sm">
                                            <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">{item.itemName}</td>
                                            <td className="px-6 py-5 text-slate-500 text-center uppercase text-xs font-bold">{item.unit}</td>
                                            <td className="px-6 py-5 text-slate-900 dark:text-white text-center font-medium">{item.completedScope}</td>
                                            <td className="px-6 py-5 text-slate-900 dark:text-white text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-5 text-right font-bold text-slate-900 dark:text-white">₹{(item.completedScope * item.rate).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="flex flex-col items-end gap-2 pt-6 border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-12 text-slate-500">
                            <span className="text-sm font-bold uppercase tracking-widest">Subtotal (Net Value)</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-12 mt-4 px-8 py-4 bg-slate-900 dark:bg-mad-sage rounded-2xl text-white dark:text-slate-900">
                            <span className="text-sm font-black uppercase tracking-[0.2em]">Total Ledger Balance</span>
                            <span className="text-3xl font-black tracking-tighter">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Footer / Auth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Notes</h5>
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                This is a computer-generated structural invoice for personal data records and project finalization audit purposes.
                                Structural integrity and scope measurements have been verified by the structural supervisor on site.
                            </p>
                        </div>
                        <div className="flex flex-col items-end justify-end gap-2">
                             <div className="w-48 h-px bg-slate-200 dark:bg-white/10"></div>
                             <p className="text-[10px] font-black text-mad-sage uppercase tracking-[0.3em]">Registry Authorized</p>
                             <p className="text-xs font-bold text-slate-400 uppercase">Structural Auditor</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] py-12 no-print">
                Malik Art Decor • Integrity Audit Portal
            </p>
        </div>
    );
};

export default ProjectAudit;