import React, { useState } from 'react';
import {
    LayoutDashboard, Users, FileText, Settings, Bell, Search,
    ChevronRight, ArrowUpRight, ArrowDownRight,
    Calendar, MapPin, Phone, Mail, Clock, CheckCircle2,
    AlertCircle, FileBarChart2, Download, Plus,
    Building2, Receipt, Wallet, BadgeIndianRupee, Briefcase
} from 'lucide-react';

// --- REAL DATA (Unchanged) ---
const MAD_PROJECT = {
    id: "MAD-2025-001",
    name: "EON ONE - Gypsum Protection Work",
    client: "Firstlight Properties Pvt. Ltd.",
    status: "IN PROGRESS",
    progress: 85,
    startDate: "Dec 1, 2025",
    deadline: "Jan 31, 2026",
    location: "S. K. Bole Road, Agar Bazar, Dadar (W), Mumbai 400 028",
    budget: "₹8,60,259",
    invoiceNumber: "01",
    invoiceDate: "18/12/2025",
    manager: { name: "Malik Art Decor", role: "Project Lead" },
    supervisor: { name: "Site Supervisor", phone: "+91 97696 26310" },
    gst: "27APLPA4957L1ZG",
    pan: "APLPA4957L",
    stats: {
        totalLabour: 12,
        labourTrend: "+3%",
        materialsCost: "₹7,29,033",
        daysRemaining: 15
    },
    cityProjects: [
        { city: "Jaipur", total: 10, running: 9, done: 0 },
        { city: "Mumbai", total: 3, running: 3, done: 0 },
        { city: "Aurangabad", total: 2, running: 2, done: 0 },
        { city: "Akola", total: 1, running: 1, done: 0 }
    ],
    recentTransactions: [
        { date: "28-Dec-2025", name: "Gulam", amount: "₹36,000", type: "labour", method: "PhonePe" },
        { date: "28-Dec-2025", name: "Mohammad Mustkim", amount: "₹12,500", type: "labour", method: "PhonePe" },
        { date: "27-Dec-2025", name: "Abdul Kuddas", amount: "₹20,000", type: "labour", method: "PhonePe" },
    ],
};

const GRAVITA_MATERIALS = [
    { item: "Interior paint on walls and ceilings", rate: "₹28/SFT", quantity: "1,500 SFT", amount: "₹42,000", status: "completed" },
    { item: "18 mm Cement Fiber Board", rate: "₹125/SFT", quantity: "380 SFT", amount: "₹47,500", status: "completed" },
    { item: "Apex Exterior Paint on Pillars", rate: "₹25/RFT", quantity: "250 RFT", amount: "₹6,250", status: "in-progress" },
    { item: "Oil-based epoxy paint on external walls", rate: "₹35/SFT", quantity: "1,500 SFT", amount: "₹52,500", status: "pending" },
    { item: "MS fabrication work (2\"×2\" pipes)", rate: "Lump sum", quantity: "Container offices", amount: "₹65,000", status: "completed" },
];

const EnterpriseProjectDetail = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // --- MODERNIZED COMPONENTS ---
    const StatCard = ({ label, value, subtext, icon: Icon, trend }) => (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
            </div>
        </div>
    );

    const SidebarItem = ({ icon: Icon, active }) => (
        <div className={`p-3 rounded-xl cursor-pointer transition-all mb-2 flex justify-center ${active ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Icon className="w-5 h-5" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900">

            {/* 1. DARK SIDEBAR (Modern Enterprise Look) */}
            <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 fixed h-full z-30">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-amber-900/50">
                    M
                </div>
                <nav className="flex-1 w-full px-4 flex flex-col items-center gap-2">
                    <SidebarItem icon={LayoutDashboard} />
                    <SidebarItem icon={FileBarChart2} active />
                    <SidebarItem icon={Users} />
                    <SidebarItem icon={Wallet} />
                </nav>
                <div className="mb-4">
                    <SidebarItem icon={Settings} />
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <div className="flex-1 ml-20">

                {/* 2.1 TOP NAVIGATION */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex items-center text-sm">
                        <span className="text-slate-400 hover:text-slate-700 cursor-pointer">Projects</span>
                        <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                        <span className="font-semibold text-slate-900">EON ONE</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{MAD_PROJECT.id}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-full text-sm transition-all w-48 focus:w-64 outline-none"
                            />
                        </div>
                        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 cursor-pointer">
                            MA
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto">

                    {/* 2.2 HERO SECTION: Project & Finance Combined */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Left: Project Context */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Building2 className="w-32 h-32 text-slate-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                        {MAD_PROJECT.status}
                                    </span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Due {MAD_PROJECT.deadline}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{MAD_PROJECT.name}</h1>
                                <p className="text-slate-500 flex items-center gap-2 mb-6">
                                    <MapPin className="w-4 h-4" /> {MAD_PROJECT.location}
                                </p>

                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Daily Entry
                                    </button>
                                    <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                                        <Download className="w-4 h-4" /> Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Financial Snapshot (The "Money" Card) */}
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Contract Value</p>
                                    <h2 className="text-3xl font-bold mt-1 text-white">{MAD_PROJECT.budget}</h2>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Wallet className="w-6 h-6 text-amber-400" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Invoice #{MAD_PROJECT.invoiceNumber}</span>
                                    <span className="font-mono">{MAD_PROJECT.invoiceDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Billed to</span>
                                    <span className="font-medium text-amber-100 truncate max-w-[150px]">{MAD_PROJECT.client.split(' ')[0]}...</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex gap-2">
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">GST: {MAD_PROJECT.gst}</span>
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">PAN: {MAD_PROJECT.pan}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2.3 KEY METRICS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Workforce"
                            value={MAD_PROJECT.stats.totalLabour}
                            subtext="12 Active on site today"
                            icon={Users}
                            trend="+3%"
                        />
                        <StatCard
                            label="Completion"
                            value={`${MAD_PROJECT.progress}%`}
                            subtext="Gypsum work 90% done"
                            icon={CheckCircle2}
                            trend="Ahead"
                        />
                        <StatCard
                            label="Material Cost"
                            value="₹7.29L"
                            subtext="Within estimated budget"
                            icon={Briefcase}
                        />
                        <StatCard
                            label="Next Milestone"
                            value="15 Days"
                            subtext="Final Handover Phase"
                            icon={Clock}
                        />
                    </div>

                    {/* 2.4 TABS & TABLES */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 pt-4 flex gap-6 overflow-x-auto">
                            {['Overview', 'BOQ & Materials', 'Transactions', 'Team'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                                        activeTab === tab.toLowerCase()
                                            ? 'text-slate-900'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase() && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* Material/BOQ Table */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-900">Material Consumption (Bill of Quantities)</h3>
                                <button className="text-sm text-indigo-600 font-medium hover:underline">Download BOQ</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Item Description</th>
                                        <th className="px-4 py-3">Rate</th>
                                        <th className="px-4 py-3">Scope</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                    {GRAVITA_MATERIALS.map((item, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">{item.item}</td>
                                            <td className="px-4 py-3 text-slate-500">{item.rate}</td>
                                            <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
                                            <td className="px-4 py-3 font-bold text-slate-900">{item.amount}</td>
                                            <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                        item.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            item.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {item.status.replace('-', ' ')}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 2.5 FOOTER */}
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-medium text-slate-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            System Operational • Last synced 2 mins ago
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default EnterpriseProjectDetail;