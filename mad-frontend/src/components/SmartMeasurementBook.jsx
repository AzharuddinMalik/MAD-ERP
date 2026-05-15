import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw, Eye, Calculator, MapPin, Building2, Calendar, FileText, BookOpen } from 'lucide-react';
import api from '../api/axiosConfig';
import BOQTable from './BOQTable';
import { useToast } from './ui/Toast';
import PageHeader from './ui/PageHeader';
import { SkeletonTable } from './ui/Skeleton';

const SmartMeasurementBook = () => {
    const { projectId } = useParams();
    const id = projectId;
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State
    const [project, setProject] = useState(location.state || null);
    const [boqItems, setBoqItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clientView, setClientView] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchBOQ = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.get(`/measurements/project/${id}`);
            setBoqItems(response.data);

            if (!project && response.data && response.data.length > 0 && response.data[0].project) {
                const p = response.data[0].project;
                setProject({
                    projectName: p.name,
                    location: p.location || p.city?.name || 'Unknown Location',
                    clientName: p.clientName || 'Client'
                });
            }
            setError(null);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Error fetching BOQ:", err);
            setError("Failed to load work items.");
            showToast('error', "Could not load BOQ data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBOQ();
    }, [id, refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        showToast('info', "Refreshing site measurements...");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('success', "Audit Link Copied", { description: "Link copied to clipboard for site sharing." });
    };

    // Calculate Totals
    const totalItems = boqItems.length;
    const totalAmount = boqItems.reduce((sum, item) => sum + (item.rate * item.totalScope), 0);
    const completedAmount = boqItems.reduce((sum, item) => sum + (item.rate * item.completedScope), 0);
    const progressPercentage = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

    return (
        <div className="font-admin text-admin-text space-y-12 max-w-4xl mx-auto px-4 md:px-0 mb-24 relative animate-fade-in">
            {/* Editorial Header */}
            <div className="flex justify-between items-end mb-16 pt-8">
                <div className="space-y-3">
                    <h1 className="text-editorial-title">Site Ledger</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-admin-accent animate-pulse" />
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">{project?.projectName || 'Syncing Metadata...'}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleRefresh} className="p-4 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent rounded-full transition-all hover:scale-110 active:scale-95 shadow-premium">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-admin-accent' : ''}`} />
                    </button>
                    <button onClick={() => navigate(-1)} className="p-4 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent rounded-full transition-all hover:scale-110 active:scale-95 shadow-premium">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tactical Switcher */}
            <div className="flex p-2 bg-admin-bg-tertiary rounded-[2rem] border-2 border-admin-border shadow-inner">
                <button
                    onClick={() => setClientView(false)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${!clientView ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    Supervisor Audit
                </button>
                <button
                    onClick={() => setClientView(true)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${clientView ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    Client Report
                </button>
            </div>

            {/* Premium Overview Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-card border-l-8 border-l-admin-accent p-8 bg-admin-accent/5 group">
                    <div className="flex justify-between items-start mb-12">
                        <div className="p-4 bg-admin-accent text-white rounded-2xl shadow-premium group-hover:scale-110 transition-transform">
                            <Calculator className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-admin-accent uppercase tracking-widest mb-1">Contract Value</p>
                            <h2 className="text-4xl font-black text-admin-text tracking-tighter">₹{totalAmount.toLocaleString()}</h2>
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Executed Scope</p>
                            <p className="text-lg font-black text-admin-success">₹{completedAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-admin-accent">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-admin-bg-tertiary rounded-full h-3 mt-6 border-2 border-admin-border overflow-hidden shadow-inner">
                        <div className="bg-admin-accent h-full transition-all duration-1000 shadow-premium" style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>

                <div className="admin-card p-8 flex flex-col justify-between border-b-8 border-b-admin-text/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-admin-bg-tertiary rounded-2xl flex items-center justify-center text-admin-text-muted border-2 border-admin-border shadow-inner">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Site Coordinates</p>
                            <h4 className="text-lg font-black text-admin-text uppercase tracking-tight">{project?.location || 'FIELD SITE'}</h4>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-admin-bg-tertiary rounded-2xl border-2 border-admin-border shadow-inner">
                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Items</p>
                            <p className="text-xl font-black text-admin-text">{totalItems}</p>
                        </div>
                        <div className="p-4 bg-admin-bg-tertiary rounded-2xl border-2 border-admin-border shadow-inner">
                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-black text-admin-success">LIVE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Content */}
            <div className="space-y-8">
                {error ? (
                    <div className="admin-card border-admin-danger/20 p-12 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-admin-danger mx-auto opacity-40" />
                        <p className="text-xs font-black uppercase tracking-widest text-admin-danger">{error}</p>
                    </div>
                ) : (
                    <BOQTable
                        boqItems={boqItems}
                        projectId={id}
                        onRefresh={handleRefresh}
                        isClientView={clientView}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default SmartMeasurementBook;
