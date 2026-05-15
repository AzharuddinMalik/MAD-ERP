import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Package, 
    Users, 
    ArrowLeft,
    BarChart3,
    PieChart as PieChartIcon,
    Download
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
    Cell,
    PieChart,
    Pie
} from 'recharts';
import financialService from '../../services/financialService';

const FinancialDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [financials, setFinancials] = useState([]);
    const [summary, setSummary] = useState({
        totalBudget: 0,
        totalWorkDone: 0,
        totalExpense: 0,
        totalROI: 0,
        avgHealth: 0
    });

    useEffect(() => {
        const fetchFinancials = async () => {
            try {
                const data = await financialService.getFinancialSummary();
                setFinancials(data);
                
                const totals = data.reduce((acc, curr) => ({
                    totalBudget: acc.totalBudget + curr.totalBudget,
                    totalWorkDone: acc.totalWorkDone + curr.workDoneValue,
                    totalExpense: acc.totalExpense + curr.totalExpense,
                    totalROI: acc.totalROI + curr.currentROI
                }), { totalBudget: 0, totalWorkDone: 0, totalExpense: 0, totalROI: 0 });

                setSummary(totals);
            } catch (error) {
                console.error("Error fetching financials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFinancials();
    }, []);

    const expenseDistribution = financials.length > 0 ? [
        { name: 'Material', value: financials.reduce((acc, curr) => acc + curr.materialExpense, 0) },
        { name: 'Labour', value: financials.reduce((acc, curr) => acc + curr.labourExpense, 0) }
    ] : [];

    const COLORS = ['#E07A5F', '#8b5cf6'];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-admin-bg-primary">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-admin-accent rounded-full mb-4 opacity-50" />
                <p className="text-admin-text-muted font-black tracking-widest uppercase">Calculating ROI...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-admin-bg-primary p-4 md:p-8 space-y-8 animate-fade-in font-admin">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-admin-text-muted hover:text-admin-accent transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-admin-text tracking-tighter mb-2">Financial Intelligence</h1>
                    <p className="text-admin-text-muted max-w-2xl font-medium">Real-time P&L analysis across all active operational zones.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/vendor-ledger')}
                        className="admin-button-secondary px-6 py-3 flex items-center gap-2 group"
                    >
                        <Users className="w-4 h-4 text-admin-accent" />
                        <span>Vendor Ledger</span>
                    </button>
                    <button 
                        onClick={() => navigate('/resource-optimization')}
                        className="admin-button-secondary px-6 py-3 flex items-center gap-2 group"
                    >
                        <Zap className="w-4 h-4 text-admin-accent" />
                        <span>Optimization</span>
                    </button>
                    <button className="admin-button-secondary px-6 py-3 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    label="Work Done Value" 
                    value={`₹${(summary.totalWorkDone / 100000).toFixed(2)}L`} 
                    sub="Revenue to Date"
                    icon={TrendingUp}
                    color="text-green-500"
                />
                <SummaryCard 
                    label="Operational Expense" 
                    value={`₹${(summary.totalExpense / 100000).toFixed(2)}L`} 
                    sub="Material + Labour"
                    icon={TrendingDown}
                    color="text-editorial-accent"
                />
                <SummaryCard 
                    label="Current ROI" 
                    value={`₹${(summary.totalROI / 100000).toFixed(2)}L`} 
                    sub="Net Profit Margin"
                    icon={DollarSign}
                    color="text-admin-accent"
                />
                <SummaryCard 
                    label="Budget Health" 
                    value={`${summary.totalBudget > 0 ? Math.round((summary.totalExpense / summary.totalBudget) * 100) : 0}%`} 
                    sub="Funds Utilized"
                    icon={BarChart3}
                    color="text-purple-500"
                >
                    <div className="mt-4 h-1 bg-admin-bg-tertiary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-purple-500 transition-all duration-1000"
                            style={{ width: `${summary.totalBudget > 0 ? (summary.totalExpense / summary.totalBudget) * 100 : 0}%` }}
                        />
                    </div>
                </SummaryCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profitability Chart */}
                <div className="lg:col-span-2 admin-card p-8 bg-admin-bg-secondary border-admin-border relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-admin-text tracking-tight">Site Profitability</h3>
                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Budget vs Actual Expense</p>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financials}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} opacity={0.1} />
                                <XAxis 
                                    dataKey="projectName" 
                                    stroke="var(--admin-text-muted)" 
                                    fontSize={10} 
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="var(--admin-text-muted)" 
                                    fontSize={10} 
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--admin-bg-secondary)', 
                                        borderColor: 'var(--admin-border)',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                                <Bar dataKey="totalBudget" name="Budget" fill="var(--admin-bg-tertiary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="totalExpense" name="Expense" fill="var(--admin-accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Distribution */}
                <div className="admin-card p-8 bg-admin-bg-secondary border-admin-border">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-admin-text tracking-tight">Expense Breakdown</h3>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Operational Split</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseDistribution}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 mt-6">
                        {expenseDistribution.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-admin-bg-primary border border-admin-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                                    <span className="text-xs font-bold text-admin-text uppercase tracking-wider">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-admin-text">₹{(item.value / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Project Financial Table */}
            <div className="admin-card overflow-hidden bg-admin-bg-secondary border-admin-border">
                <div className="p-8 border-b border-admin-border flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-admin-text tracking-tight">Ledger Summary</h3>
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Project-wise Financial Health</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-admin-bg-tertiary/20">
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border">Project Name</th>
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border text-right">Work Value</th>
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border text-right">Material</th>
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border text-right">Labour</th>
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border text-right">Net ROI</th>
                                <th className="p-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest border-b border-admin-border text-center">Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financials.map((row, idx) => (
                                <tr key={idx} className="hover:bg-admin-bg-primary transition-colors border-b border-admin-border/50">
                                    <td className="p-4 font-black text-admin-text">{row.projectName}</td>
                                    <td className="p-4 text-right font-bold text-admin-text">₹{row.workDoneValue.toLocaleString()}</td>
                                    <td className="p-4 text-right font-medium text-admin-text-muted">₹{row.materialExpense.toLocaleString()}</td>
                                    <td className="p-4 text-right font-medium text-admin-text-muted">₹{row.labourExpense.toLocaleString()}</td>
                                    <td className={`p-4 text-right font-black ${row.currentROI >= 0 ? 'text-green-500' : 'text-editorial-accent'}`}>
                                        ₹{row.currentROI.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-full max-w-[80px] h-1.5 bg-admin-bg-tertiary rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-admin-accent transition-all duration-500" 
                                                    style={{ width: `${row.healthScore}%` }}
                                                />
                                            </div>
                                            <span className="text-[8px] font-black text-admin-text-muted">{Math.round(row.healthScore)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, sub, icon: Icon, color, children }) => (
    <div className="admin-card p-6 bg-admin-bg-secondary border-admin-border hover:border-admin-accent/50 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-admin-bg-tertiary border border-admin-border group-hover:border-admin-accent transition-colors`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
        </div>
        <div>
            <h4 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-admin-text tracking-tighter">{value}</span>
            </div>
            <p className="text-[10px] font-medium text-admin-text-muted mt-2 uppercase tracking-wider">{sub}</p>
        </div>
        {children}
    </div>
);

export default FinancialDashboard;
