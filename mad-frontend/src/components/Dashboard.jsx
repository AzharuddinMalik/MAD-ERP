import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { getApiUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    HardHat,
    Building2,
    Users,
    AlertTriangle,
    Plus,
    MapPin,
    ArrowRight,
    Clock,
    Search,
    Bell,
    Menu,
    LogOut,
    CheckCircle2,
    TrendingUp,
    FileText,
    X,
    Filter,
    MoreVertical
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Fetch Data
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Use centralized service
                const data = await dashboardService.getDashboardData();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                if (err.response && err.response.status === 403) {
                    setError("Access Denied: You do not have Admin permissions.");
                } else {
                    setError("System Error: Could not connect to the server.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 text-brand-600 font-medium animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                <p>Loading Dashboard...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50 text-red-600">
            <AlertTriangle className="w-16 h-16 mb-6 opacity-80" />
            <p className="text-xl font-bold mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white border border-red-200 rounded-xl shadow-sm hover:bg-red-50 font-semibold transition-colors">
                Retry Connection
            </button>
        </div>
    );

    const { globalStats: summary = {}, cityStats = [], alerts = [], siteUpdates = [] } = stats || {};

    // Filter Logic
    const filteredUpdates = siteUpdates.filter(u =>
        u.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.project?.city?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCityStats = cityStats.filter(c =>
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Chart Data Transformation
    const statusColors = {
        'RUNNING': '#4f46e5',   // Brand-600
        'COMPLETED': '#10b981', // Emerald-500
        'ON_HOLD': '#f59e0b',   // Amber-500
        'DELAYED': '#ef4444',   // Red-500
        'PLANNED': '#64748b'    // Slate-500
    };

    const projectStatusData = Object.entries(summary.projectStatusDistribution || {}).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
        color: statusColors[status] || '#cbd5e1'
    }));

    // Fallback if no data (to avoid empty chart)
    if (projectStatusData.length === 0) {
        projectStatusData.push({ name: 'No Data', value: 1, color: '#f1f5f9' });
    }

    const labourTrendData = summary.weeklyLabourTrend || [];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 z-40 w-72 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-brand-200">
                            MAD
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block leading-tight">Malik Art Decor</span>
                            <span className="text-xs text-slate-500 font-medium">Enterprise ERP</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Overview</p>
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" active onClick={() => setSidebarOpen(false)} />
                    <NavItem icon={<Building2 />} label="Active Projects" onClick={() => navigate('/active-projects')} />
                    <NavItem icon={<TrendingUp />} label="Analytics" onClick={() => { }} />

                    <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Management</p>
                    <NavItem icon={<Plus />} label="New Project" onClick={() => navigate('/create-project')} />
                    <NavItem icon={<Users />} label="Users" onClick={() => navigate('/users')} />
                    <NavItem icon={<FileText />} label="Reports" onClick={() => { }} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-4 rounded-xl border border-brand-100 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">AD</div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">System Admin</p>
                                <p className="text-xs text-slate-500">Administrator</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm min-h-[80px]">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects, supervisors, updates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition text-sm bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-3 rounded-xl hover:bg-slate-50 transition text-slate-600 hidden sm:block">
                            <Bell className="w-6 h-6" />
                            {alerts.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>}
                        </button>
                        <button onClick={() => navigate('/create-project')} className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-4 md:px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 transition-all active:scale-95 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">New Project</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar scroll-smooth">

                    {/* Welcome & Mobile Search */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Dashboard Overview</h1>
                                <p className="text-slate-500">Real-time insights into your construction projects.</p>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2 self-start md:self-auto">
                                <Clock className="w-4 h-4 text-brand-500" />
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        {/* Mobile Search Bar */}
                        <div className="relative w-full md:hidden">
                            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <KPICard
                            title="Total Projects" value={summary.totalProjects || 0} subtitle="Active Sites"
                            icon={<Building2 className="w-6 h-6 text-brand-600" />} bg="bg-brand-50" trend="+12%"
                        />
                        <KPICard
                            title="Total Labour" value={summary.totalLabour || 0} subtitle="On-Site Today"
                            icon={<HardHat className="w-6 h-6 text-emerald-600" />} bg="bg-emerald-50" trend="+5%"
                        />
                        <KPICard
                            title="Critical Alerts" value={alerts.length} subtitle="Action Required"
                            icon={<AlertTriangle className="w-6 h-6 text-amber-600" />} bg="bg-amber-50"
                            trend="High Priority" textColor="text-amber-600"
                        />
                        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-brand-200 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">System Status</p>
                                    <p className="text-3xl font-bold">Operational</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-100 relative z-10 font-medium">
                                <span>All systems normal</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Weekly Labour Trend</h3>
                                <button className="p-1 hover:bg-slate-50 rounded"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={labourTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="workers" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Project Status</h3>
                                <button className="p-1 hover:bg-slate-50 rounded"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                            </div>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={projectStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {projectStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid: Regional & Alerts (Left) vs Updates (Right) */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Middle Column: Regional + Alerts */}
                        <div className="xl:col-span-2 space-y-8">

                            {/* Regional Distribution */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-brand-500" />
                                        Regional Distribution
                                    </h2>
                                    <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">View Map</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredCityStats.length === 0 && <p className="text-slate-500 col-span-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center">No regions match your search.</p>}
                                    {filteredCityStats.map((city, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => navigate('/active-projects', { state: { selectedCity: city.city } })}
                                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                                                    {city.city}
                                                </h3>
                                                <span className="bg-white/80 backdrop-blur text-slate-700 text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                    {city.totalProjects} Sites
                                                </span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-slate-500 font-medium">Active Projects</span>
                                                    <span className="font-bold text-brand-600">{city.runningCount}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-brand-500 h-full rounded-full group-hover:bg-brand-600 transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                                        style={{ width: city.totalProjects > 0 ? `${(city.runningCount / city.totalProjects) * 100}%` : '0%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attention Needed Section (Restored) */}
                            {alerts.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        Attention Needed
                                    </h2>
                                    <div className="grid gap-3">
                                        {alerts.map((alert, idx) => (
                                            <div key={idx} className="bg-white border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        {alert.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                                                </div>
                                                <button className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-lg whitespace-nowrap self-end sm:self-auto hover:bg-brand-100 transition-colors">
                                                    Resolve
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Live Updates Feed : increase the size of the section and it images  */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px] md:h-[600px] flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-brand-500" />
                                    Live Site Updates
                                </h2>
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Filter className="w-4 h-4" /></button>
                                    <button className="text-xs font-bold text-brand-600 hover:text-brand-700">View All</button>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
                                {filteredUpdates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                            <Search className="w-6 h-6 opacity-50" />
                                        </div>
                                        <p className="text-sm">No updates found.</p>
                                    </div>
                                ) : (
                                    filteredUpdates.map((update, idx) => (
                                        <div key={idx} className="relative pl-6 pb-2 group">
                                            {/* Timeline Line */}
                                            <div className="absolute left-2.5 top-2 bottom-0 w-0.5 bg-slate-100 group-last:bg-transparent"></div>
                                            {/* Timeline Dot */}
                                            <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white bg-brand-500 shadow-sm"></div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4
                                                            onClick={() => update.project && navigate(`/smart-book/${update.project.id}`, { state: { projectName: update.project.name } })}
                                                            className="font-bold text-slate-900 text-sm hover:text-brand-600 cursor-pointer"
                                                        >
                                                            {update.project?.name || 'Unknown Project'}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {update.project?.city?.name}
                                                            {update.project?.supervisor && (
                                                                <>
                                                                    <span className="mx-1">•</span>
                                                                    <span className="text-brand-600 font-medium">{update.project.supervisor.fullName || update.project.supervisor.username}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium bg-white px-2 py-1 rounded border border-slate-100">
                                                        {new Date(update.updateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="bg-gradient-to-br from-brand-50 to-indigo-50 p-4 rounded-xl border border-brand-100 mb-3">
                                                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                                        {update.content}
                                                    </p>
                                                </div>

                                                {(update.photoUrl1 || update.photoUrl2) && (
                                                    <div className="flex gap-2">
                                                        {[update.photoUrl1, update.photoUrl2].filter(Boolean).map((url, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-40 h-40 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-brand-300 transition-colors shadow-sm relative group/img"
                                                                onClick={() => window.open(getApiUrl(`/uploads/${url}`), '_blank')}
                                                                title="Click to view full size"
                                                            >
                                                                <img src={getApiUrl(`/uploads/${url}`)} alt="Site" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                                                                    <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transform -rotate-45" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components
const NavItem = ({ icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${active ? 'bg-brand-50 text-brand-600 border-r-4 border-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-500'}`}
    >
        <span className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-400'}`}>{icon}</span>
        <span className="font-medium whitespace-nowrap text-sm">{label}</span>
    </button>
);

const KPICard = ({ title, value, subtitle, icon, bg, trend, textColor = 'text-slate-900' }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm`}>
                {icon}
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-xs">
                {trend.includes('+') ? <TrendingUp className="w-3 h-3" /> : ''} {trend}
            </span>
            <span className="text-slate-400 font-medium text-xs">{subtitle}</span>
        </div>
    </div>
);

export default Dashboard;