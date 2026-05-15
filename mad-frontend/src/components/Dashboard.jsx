import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useNotifications } from '../hooks/useNotifications';
import { getApiUrl } from '../services/api';
import { leadService } from '../services/leadService';
import { useNavigate } from 'react-router-dom';
import {
    Building2, HardHat, AlertTriangle, MapPin, ArrowRight, Search, Plus, Users, ChevronDown,
    TrendingUp, Activity, ShieldCheck, History, ChevronRight, Database, DollarSign
} from 'lucide-react';
import SearchBar from './ui/SearchBar';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    FunnelChart, Funnel, LabelList
} from 'recharts';
import { Skeleton } from './ui/Skeleton';
import MADTooltip from './ui/Tooltip';
import { useTour } from '../contexts/TourContext';
import { Sparkles } from 'lucide-react';

const KPICard = ({ title, value, icon, trend, isAlert, colorConfig }) => {
    const c = colorConfig || {
        bg: 'bg-admin-accent/10', text: 'text-admin-accent',
        cardHover: 'hover:border-admin-accent hover:shadow-[0_10px_30px_-10px_rgba(224,122,95,0.3)]',
        bar: 'bg-admin-accent'
    };

    return (
        <div className={`admin-card group transition-all duration-300 ${isAlert ? 'border-red-500/40 shadow-[0_5px_20px_-5px_rgba(239,68,68,0.15)] bg-red-500/5' : c.cardHover}`}>
            <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${isAlert ? 'bg-red-500/10 text-red-500' : `${c.bg} ${c.text}`} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{title}</p>
                    <p className="text-4xl font-display font-black leading-none">{value}</p>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
                <span className={`text-[9px] font-black tracking-widest ${isAlert ? 'text-red-500' : c.text} opacity-80`}>
                    {trend}
                </span>
                <div className="h-1 w-16 bg-admin-bg-tertiary rounded-full overflow-hidden">
                    <div className={`h-full ${isAlert ? 'bg-red-500' : c.bar} w-1/2`} />
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [leadStats, setLeadStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertsExpanded, setAlertsExpanded] = useState(false);
    const navigate = useNavigate();
    const { startTour, hasSeenTour } = useTour();

    useEffect(() => {
        if (!hasSeenTour && !loading) {
            startTour('dashboard');
        }
    }, [hasSeenTour, loading]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [dashData, lStats] = await Promise.all([
                    dashboardService.getDashboardData(),
                    leadService.getLeadsStats()
                ]);
                setStats(dashData);
                setLeadStats(lStats);
            } catch (err) {
                if (err.name === 'CanceledError') return;
                console.error("Failed to fetch dashboard data:", err);
                setError(err.response?.status === 403 ? "Access Denied" : "System Error");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // 📡 Real-time site updates (SSE)
    useNotifications((newUpdate) => {
        setStats(prev => {
            if (!prev) return prev;
            const updatedList = [newUpdate, ...(prev.siteUpdates || [])].slice(0, 10);
            return { ...prev, siteUpdates: updatedList };
        });
    });

    if (loading) return (
        <div className="space-y-12 animate-fade-in font-admin">
            <div className="space-y-4">
                <Skeleton className="h-20 w-3/4 rounded-3xl" />
                <Skeleton className="h-6 w-1/2 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[32px]" />)}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center min-h-[500px] text-center space-y-6 font-admin">
            <div className="text-editorial-hero opacity-10 uppercase">Error</div>
            <p className="text-xl font-admin text-admin-text-secondary max-w-md">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-premium px-10 py-4">
                Retry Connection
            </button>
        </div>
    );

    const { globalStats = {}, cityStats = [], alerts: projectAlerts = [], siteUpdates = [] } = stats || {};
    const summary = globalStats || {};

    // NEW: Funnel Data for intelligence chart
    const leadFunnelData = summary.leadFunnel ? [
        { name: 'Total Leads', value: summary.leadFunnel.total, fill: '#E07A5F' },
        { name: 'Contacted', value: summary.leadFunnel.contacted, fill: '#8b5cf6' },
        { name: 'Closed', value: summary.leadFunnel.closed, fill: '#ec4899' },
    ] : [];

    // Combine project alerts with critical lead alerts
    const alerts = [...projectAlerts];
    if (leadStats?.criticalCount > 0) {
        alerts.unshift({
            type: 'LEAD_ALERT',
            projectName: 'Uncontacted Leads',
            message: `${leadStats.criticalCount} lead(s) have been waiting for more than 24 hours.`,
            priority: 'HIGH',
            targetUrl: '/leads'
        });
    }

    const filteredUpdates = siteUpdates.filter(u =>
        (u.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.projectName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Chart Data
    const projectStatusData = Object.entries(summary.projectStatusDistribution || {}).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
        color: status === 'RUNNING' ? '#E07A5F' : '#334155'
    }));

    if (projectStatusData.length === 0) {
        projectStatusData.push({ name: 'No Data', value: 1, color: '#334155' });
    }

    return (
        <div className="space-y-12 pb-24 animate-fade-in font-admin">
            {/* Page Title — Oversized Editorial Header */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-editorial-hero text-admin-text">
                            Overview
                        </h1>
                        <p className="text-lg text-admin-text-secondary tracking-tight">
                            Real-time intelligence from <span className="text-admin-accent font-semibold">Artisanal Decor</span> sites.
                        </p>
                    </div>

                    {/* Search — Minimalist Line Style */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Find projects or updates..."
                            minimalist={true}
                            className="w-full lg:w-96"
                        />
                        <button
                            onClick={() => startTour('dashboard')}
                            className="p-3 bg-admin-bg-tertiary hover:bg-admin-hover text-admin-text-muted hover:text-admin-accent rounded-2xl transition-all cursor-pointer"
                            title="Start Tour"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards — Premium Silhouette */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-tour="kpi-cards">
                <KPICard
                    title="Active Sites" value={summary.totalProjects || 0}
                    icon={<Building2 className="w-5 h-5 md:w-6 md:h-6" />}
                    trend="+12% GROWTH"
                    colorConfig={{
                        bg: 'bg-blue-500/10', text: 'text-blue-500',
                        cardHover: 'hover:border-blue-500 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.2)]',
                        bar: 'bg-blue-500'
                    }}
                />
                <KPICard
                    title="Personnel" value={summary.totalLabour || 0}
                    icon={<HardHat className="w-5 h-5 md:w-6 md:h-6" />}
                    trend="PEAK CAPACITY"
                    colorConfig={{
                        bg: 'bg-emerald-500/10', text: 'text-emerald-500',
                        cardHover: 'hover:border-emerald-500 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]',
                        bar: 'bg-emerald-500'
                    }}
                />
                <KPICard
                    title="Criticals" value={alerts.length}
                    icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
                    trend="REQUIRES ACTION"
                    isAlert={alerts.length > 0}
                />

                {/* Leads Card — Premium Gradient Sheet */}
                <div
                    onClick={() => navigate('/leads')}
                    className="admin-card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden group flex flex-col justify-between cursor-pointer"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">New Leads</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-display font-black leading-none">{leadStats?.todayCount ?? '0'}</p>
                    </div>
                    <div className="flex gap-2 relative z-10 mt-4">
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">{leadStats?.totalAll ?? 0} TOTAL</div>
                        <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform" />
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-admin-accent/20 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Critical Alerts Panel - Restored Actionability & Details */}
            {alerts && alerts.length > 0 && (
                <div className="space-y-4 animate-fade-up" data-tour="alerts-panel">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-admin-danger/10 rounded-xl text-admin-danger">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-admin-text">
                            Action Required
                        </h3>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-admin-danger text-white">
                            {alerts.length} Pending
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {alerts.slice(0, alertsExpanded ? alerts.length : 3).map((alert, idx) => (
                            <div
                                key={idx}
                                className="relative bg-gradient-to-br from-admin-bg to-admin-bg-secondary border border-admin-danger/30 rounded-2xl p-5 sm:p-6 group hover:border-admin-danger hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] transition-all duration-500 overflow-hidden cursor-pointer"
                                onClick={() => navigate(alert.targetUrl || `/active-projects`, { state: { projectId: alert.projectId } })}
                            >
                                {/* Glowing ambient background */}
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-admin-danger/10 rounded-full blur-3xl group-hover:bg-admin-danger/20 transition-colors duration-500"></div>

                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-4">
                                            <MADTooltip content="Priority level of the alert. Critical issues appear at the top." position="right">
                                                <div className="px-3 py-1 rounded bg-admin-danger/10 border border-admin-danger/30">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-admin-danger">
                                                        {alert.type || 'CRITICAL'}
                                                    </span>
                                                </div>
                                            </MADTooltip>
                                            <h4 className="text-lg sm:text-xl font-black text-admin-text uppercase tracking-tighter truncate group-hover:text-admin-danger transition-colors">
                                                {alert.projectName || 'System Alert'}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-admin-bg-tertiary/50 border border-admin-border/50 backdrop-blur-sm">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-admin-danger" />
                                                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Issue Details</p>
                                                </div>
                                                <p className="text-sm text-admin-text-secondary font-medium leading-relaxed">{alert.message || alert.content || 'Immediate attention required'}</p>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {alert.supervisorName && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Supervisor</p>
                                                        <p className="text-sm text-admin-text font-bold">{alert.supervisorName}</p>
                                                    </div>
                                                )}
                                                <div className="flex gap-6">
                                                    {alert.location && (
                                                        <div>
                                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Location</p>
                                                            <p className="text-sm text-admin-text-secondary font-medium flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5 text-admin-accent" /> {alert.location}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {alert.labourCount !== undefined && (
                                                        <div>
                                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Workforce</p>
                                                            <p className="text-sm text-admin-text-secondary font-medium flex items-center gap-1.5">
                                                                <Users className="w-3.5 h-3.5 text-admin-accent" /> {alert.labourCount}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 mt-2 sm:mt-0 items-center justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(alert.targetUrl || `/active-projects`, { state: { projectId: alert.projectId } }); }}
                                            className="px-6 py-3 bg-admin-danger hover:bg-red-600 text-white rounded-xl shadow-[0_5px_15px_-3px_rgba(239,68,68,0.4)] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center whitespace-nowrap"
                                        >
                                            Resolve <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {alerts.length > 3 && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => setAlertsExpanded(!alertsExpanded)}
                                className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-admin-text-muted hover:text-admin-accent transition-colors uppercase tracking-widest"
                            >
                                {alertsExpanded ? 'Show Less' : `View All ${alerts.length} Alerts`}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${alertsExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Intelligence Section */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="admin-card min-h-[280px] md:min-h-[350px] flex flex-col p-6">
                            <h3 className="text-sm md:text-xl mb-4 md:mb-6 uppercase font-black tracking-widest text-admin-accent">Labour Distribution</h3>
                            <div className="flex-1 min-h-[200px] md:min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={summary.weeklyLabourTrend || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorWorkers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--admin-accent)" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="var(--admin-accent)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.3} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--admin-text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--admin-bg-secondary)', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)' }}
                                            itemStyle={{ color: 'var(--admin-accent)', fontWeight: 'bold' }}
                                            labelStyle={{ color: 'var(--admin-text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}
                                            cursor={{ stroke: 'var(--admin-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="workers"
                                            stroke="var(--admin-accent)"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorWorkers)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="admin-card min-h-[280px] md:min-h-[350px] flex flex-col p-6">
                            <h3 className="text-sm md:text-xl mb-4 md:mb-6 uppercase font-black tracking-widest text-admin-accent">Site Status</h3>
                            <div className="flex-1 min-h-[200px] md:min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={projectStatusData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--admin-border)" opacity={0.2} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--admin-text-muted)', fontSize: 11, fontWeight: 700 }} width={80} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--admin-bg-tertiary)' }}
                                            contentStyle={{ backgroundColor: 'var(--admin-bg-secondary)', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)' }}
                                            itemStyle={{ color: 'var(--admin-text)', fontWeight: 'bold' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32} animationDuration={1500}>
                                            {projectStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || 'var(--admin-accent)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Regional Territories */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-editorial-title">Territories</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cityStats.map((city, idx) => {
                                const percentage = city.totalProjects > 0 ? (city.runningCount / city.totalProjects) * 100 : 0;
                                return (
                                    <div
                                        key={idx}
                                        className="relative group cursor-pointer admin-card bg-admin-bg-tertiary/20 border border-admin-border/50 hover:border-admin-accent hover:bg-admin-bg-secondary transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-admin-accent/5"
                                        onClick={() => navigate('/active-projects', { state: { selectedCity: city.city } })}
                                    >
                                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500">
                                            <MapPin className="w-32 h-32 text-admin-accent" />
                                        </div>
                                        <div className="relative z-10 p-2">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h4 className="text-2xl font-black text-admin-text group-hover:text-admin-accent transition-colors tracking-tight">{city.city}</h4>
                                                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Operational Zone</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-admin-bg-tertiary flex items-center justify-center border border-admin-border group-hover:border-admin-accent transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-admin-text-muted group-hover:text-admin-accent -rotate-45 group-hover:rotate-0 transition-all duration-300" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <span className="text-3xl font-display font-black leading-none text-admin-text">{city.runningCount}</span>
                                                        <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-2">/ {city.totalProjects} Sites Active</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-admin-accent">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-admin-bg-tertiary rounded-full overflow-hidden border border-admin-border/50">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-admin-accent to-admin-accent/70 transition-all duration-1000 shadow-[0_0_15px_rgba(224,122,95,0.4)]"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 🧠 Enterprise Intelligence Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-editorial-title">Intelligence</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => navigate('/financials')}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-admin-bg-tertiary border border-admin-border hover:border-admin-accent rounded-full text-[10px] font-black text-admin-text-muted hover:text-admin-accent tracking-widest uppercase transition-all"
                                >
                                    <DollarSign className="w-3 h-3" /> Financial ROI
                                </button>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-admin-accent/10 border border-admin-accent/20 rounded-full text-[10px] font-black text-admin-accent tracking-widest uppercase">
                                    <TrendingUp className="w-3 h-3" /> Growth Logic
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 🎯 Lead Intelligence Funnel */}
                            <div className="admin-card p-6 border-admin-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.07]">
                                    <Activity className="w-48 h-48 text-admin-accent" />
                                </div>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-admin-text">Lead Conversion</h3>
                                        <p className="text-xs text-admin-text-muted mt-1">Acquisition funnel analytics</p>
                                    </div>
                                    <div className="p-2.5 bg-admin-accent/10 rounded-xl border border-admin-accent/20">
                                        <Database className="w-4 h-4 text-admin-accent" />
                                    </div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {leadFunnelData.some(d => d.value > 0) ? (
                                            <FunnelChart>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--admin-bg-secondary)',
                                                        borderColor: 'var(--admin-border)',
                                                        borderRadius: '16px',
                                                        fontSize: '12px',
                                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)'
                                                    }}
                                                />
                                                <Funnel
                                                    dataKey="value"
                                                    data={leadFunnelData}
                                                    isAnimationActive
                                                >
                                                    <LabelList position="right" fill="var(--admin-text-muted)" stroke="none" dataKey="name" fontSize={10} fontWeight={700} />
                                                </Funnel>
                                            </FunnelChart>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-center px-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">Awaiting Conversion Signals</p>
                                            </div>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-admin-border">
                                    {leadFunnelData.map((item, idx) => (
                                        <div key={idx} className="text-center group/item">
                                            <p className="text-lg font-black text-admin-text group-hover/item:text-admin-accent transition-colors">{item.value}</p>
                                            <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-[0.1em]">{item.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 🛡️ Site Health Intelligence */}
                            <div className="admin-card p-6 border-admin-border group relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-admin-text">Site Health</h3>
                                        <p className="text-xs text-admin-text-muted mt-1">Resource stability indices</p>
                                    </div>
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {(summary.stockHealth || []).map((site, idx) => (
                                        <div key={idx} className="p-4 bg-admin-bg-tertiary/40 border border-admin-border rounded-2xl hover:border-admin-accent/40 transition-all group/site">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${site.status === 'HEALTHY'
                                                            ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                                            : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                                                        }`} />
                                                    <div>
                                                        <p className="text-xs font-black text-admin-text uppercase tracking-tight group-hover/site:text-admin-accent transition-colors">{site.projectName}</p>
                                                        <p className="text-[10px] font-medium text-admin-text-muted mt-0.5">Operational Stability</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${site.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {site.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!summary.stockHealth || summary.stockHealth.length === 0) && (
                                        <div className="text-center py-12 opacity-30 italic text-sm">No critical data streams available.</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate('/audit-trail')}
                                    className="w-full mt-8 py-3 bg-admin-bg-tertiary border border-admin-border rounded-xl text-[10px] font-black uppercase tracking-widest text-admin-text-muted hover:text-admin-text hover:border-admin-accent transition-all flex items-center justify-center gap-2"
                                >
                                    <History className="w-3 h-3" /> System Audit Trail <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Stream — Editorial Feed */}
                <div className="space-y-6" data-tour="live-updates">
                    <div className="flex items-center justify-between">
                        <h2 className="text-editorial-title">Live Updates</h2>
                        <MADTooltip content="Real-time site signals. Green means active synchronization." position="left">
                            <div className="flex h-2.5 w-2.5 rounded-full bg-admin-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        </MADTooltip>
                    </div>
                    <div className="space-y-4 max-h-[900px] overflow-y-auto no-scrollbar pr-2">
                        {filteredUpdates.length > 0 ? (
                            filteredUpdates.map((update, idx) => (
                                <div key={idx} className="admin-card p-8 space-y-6 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-admin-accent uppercase tracking-tighter text-lg leading-none">
                                                {update.projectName}
                                            </h4>
                                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">
                                                {update.supervisorName || 'System Observer'}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">
                                            {new Date(update.updateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-admin-text-secondary line-clamp-3 font-medium">
                                        {update.content}
                                    </p>
                                    {update.photoUrl1 && (
                                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-admin-bg-tertiary border-4 border-admin-border shadow-inner">
                                            <img
                                                src={getApiUrl(update.photoUrl1)}
                                                alt="Site Observation"
                                                className="w-full h-full object-cover transition-transform hover:scale-110 duration-1000"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center opacity-20">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No active signal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;