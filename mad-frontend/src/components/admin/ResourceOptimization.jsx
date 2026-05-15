import React, { useState, useEffect } from 'react';
import { 
    Zap, 
    ArrowLeft, 
    TrendingUp, 
    Users, 
    Clock, 
    AlertTriangle,
    Target,
    BarChart3,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import financialService from '../../services/financialService';

const ResourceOptimization = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await financialService.getProductivitySummary();
                setStats(data);
            } catch (error) {
                console.error("Error fetching productivity summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredStats = stats.filter(s => 
        s.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedByEfficiency = [...stats].sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-admin-bg-primary">
            <div className="animate-spin w-8 h-8 border-4 border-admin-accent border-t-transparent rounded-full" />
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted group-hover:text-admin-text">Financial Hub</span>
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-admin-text tracking-tighter mb-2">Resource Optimization</h1>
                    <p className="text-admin-text-muted max-w-2xl font-medium tracking-tight">Maximizing labour output and minimizing material variance via real-time velocity tracking.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-3 bg-admin-accent/10 border border-admin-accent/20 rounded-2xl flex items-center gap-3">
                        <Zap className="w-5 h-5 text-admin-accent animate-pulse" />
                        <div>
                            <p className="text-[8px] font-black text-admin-accent uppercase tracking-widest">Global Efficiency</p>
                            <p className="text-xl font-black text-admin-text">{Math.round(stats.reduce((acc, curr) => acc + curr.efficiencyScore, 0) / (stats.length || 1))}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Efficiency Leaderboard */}
                <div className="lg:col-span-2 admin-card p-8 bg-admin-bg-secondary border-admin-border overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-admin-text tracking-tight">Supervisor Efficiency</h3>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Value Generated per Man-Day</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-admin-text-muted" />
                            <input 
                                type="text"
                                placeholder="Search site..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-admin-bg-primary border border-admin-border rounded-full py-2 pl-9 pr-4 text-[10px] font-black text-admin-text focus:border-admin-accent outline-none w-48 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredStats.map((stat, idx) => (
                            <div key={idx} className="group p-4 bg-admin-bg-primary border border-admin-border/50 rounded-2xl hover:border-admin-accent transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-admin-bg-tertiary flex items-center justify-center font-black text-admin-text group-hover:bg-admin-accent group-hover:text-white transition-colors">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-admin-text tracking-tight group-hover:text-admin-accent transition-colors">{stat.projectName}</h4>
                                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">{stat.supervisorName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Waste Factor</p>
                                        <p className={`font-black ${stat.materialWastageRatio > 1.05 ? 'text-editorial-accent' : 'text-green-500'}`}>
                                            {(stat.materialWastageRatio * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Production Rate</p>
                                        <p className="font-black text-admin-text">₹{stat.valueProducedPerManDay.toLocaleString()}<span className="text-[10px] text-admin-text-muted">/day</span></p>
                                    </div>
                                    <div className="w-32">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[8px] font-black text-admin-text-muted uppercase">Efficiency</span>
                                            <span className="text-[8px] font-black text-admin-accent">{Math.round(stat.efficiencyScore)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-admin-bg-tertiary rounded-full overflow-hidden border border-admin-border/30">
                                            <div 
                                                className="h-full bg-admin-accent transition-all duration-700 ease-out shadow-[0_0_8px_rgba(224,122,95,0.4)]" 
                                                style={{ width: `${stat.efficiencyScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Predictor Card */}
                <div className="admin-card p-8 bg-admin-bg-secondary border-admin-border">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-admin-text tracking-tight">Timeline Predictor</h3>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">AI Burn-Rate Analysis</p>
                    </div>
                    <div className="space-y-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="p-5 bg-admin-bg-primary border border-admin-border rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xs font-black text-admin-text uppercase tracking-widest">{stat.projectName}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 text-admin-text-muted">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{stat.daysRemaining} days remaining</span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-admin-bg-tertiary rounded-lg">
                                        <Calendar className="w-4 h-4 text-admin-accent" />
                                    </div>
                                </div>
                                <div className="p-3 bg-admin-bg-tertiary/50 rounded-xl border border-admin-border/50 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-admin-text-muted uppercase">ETC</span>
                                    <span className="text-[10px] font-black text-admin-text">{new Date(stat.predictedCompletionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="admin-card p-8 bg-admin-bg-secondary border-admin-border">
                <div className="mb-8">
                    <h3 className="text-xl font-black text-admin-text tracking-tight">Cross-Site Benchmarking</h3>
                    <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Efficiency Normalized by Benchmark (₹5,000/Man-Day)</p>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} opacity={0.1} />
                            <XAxis dataKey="projectName" stroke="var(--admin-text-muted)" fontSize={10} fontWeight={900} />
                            <YAxis stroke="var(--admin-text-muted)" fontSize={10} fontWeight={900} />
                            <Tooltip 
                                cursor={{fill: 'var(--admin-bg-tertiary)', opacity: 0.2}}
                                contentStyle={{backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)', borderRadius: '12px'}}
                            />
                            <Bar dataKey="efficiencyScore" name="Efficiency Score" radius={[4, 4, 0, 0]}>
                                {stats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.efficiencyScore > 80 ? 'var(--admin-accent)' : entry.efficiencyScore > 50 ? '#8b5cf6' : '#E07A5F'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ResourceOptimization;
