import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw, Eye, Calculator, MapPin, Building2, Calendar, FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import BOQTable from './BOQTable';
import toast from 'react-hot-toast';

const SmartMeasurementBook = () => {
    const { projectId } = useParams();
    const id = projectId;
    const location = useLocation();
    const navigate = useNavigate();

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

            // Best-effort project details extraction if not passed via state
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
            console.error("Error fetching BOQ:", err);
            setError("Failed to load work items.");
            toast.error("Could not load BOQ data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBOQ();
    }, [id, refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        toast.success("Refreshing data...");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    // Calculate Totals
    const totalItems = boqItems.length;
    const totalAmount = boqItems.reduce((sum, item) => sum + (item.rate * item.totalScope), 0);
    const completedAmount = boqItems.reduce((sum, item) => sum + (item.rate * item.completedScope), 0);
    const progressPercentage = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    {project?.projectName || 'Project Measurement Book'}
                                    {clientView && <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full border border-brand-200">Client View</span>}
                                </h1>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {project?.location || 'Loading location...'}
                                    {project?.clientName && (
                                        <>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <Building2 className="w-3 h-3 text-slate-400" />
                                            {project.clientName}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setClientView(!clientView)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${clientView ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">{clientView ? 'Exit Client View' : 'Client View'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 sm:px-4 sm:py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand-600 transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">Total Project Value</p>
                            <h2 className="text-3xl font-bold mb-2">₹{totalAmount.toLocaleString()}</h2>
                            <div className="flex items-center gap-2 text-brand-100 text-sm">
                                <FileText className="w-4 h-4" />
                                <span>{totalItems} Items Listed</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calculator className="w-24 h-24" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Work Completed</p>
                                <h2 className="text-3xl font-bold text-emerald-600">₹{completedAmount.toLocaleString()}</h2>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{Math.round(progressPercentage)}% of total scope executed</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center group hover:border-brand-200 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Last Updated</p>
                        <p className="text-slate-800 font-bold">
                            {boqItems.length > 0 ? new Date().toLocaleDateString() : 'No Data'}
                        </p>
                    </div>
                </div>

                {/* BOQ Table Section */}
                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
                        <p className="font-bold">{error}</p>
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
            </main>
        </div>
    );
};

export default SmartMeasurementBook;