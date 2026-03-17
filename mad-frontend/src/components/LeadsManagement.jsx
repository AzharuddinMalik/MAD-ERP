import React, { useEffect, useState } from 'react';
import { leadService } from '../services/leadService';
import { Users, Search, Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

const LeadsManagement = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const fetchLeads = async () => {
        try {
            const data = await leadService.getAllLeads();
            setLeads(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch leads", err);
            setError("Failed to load leads. You might not have permission.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStatusChange = async (id, currentStatus) => {
        // Simple toggle for now: NEW -> CONTACTED -> CLOSED
        const nextStatus = currentStatus === 'NEW' ? 'CONTACTED'
            : currentStatus === 'CONTACTED' ? 'CLOSED' : 'NEW';

        try {
            await leadService.updateStatus(id, nextStatus);
            // Optimistic UI update
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: nextStatus } : lead));
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    // Filter Logic
    const filteredLeads = leads.filter(lead =>
        (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-indigo-600">Loading Leads...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                            <Users className="w-8 h-8 text-indigo-600" />
                            Leads & Inquiries
                        </h1>
                        <p className="text-slate-500 mt-1">Manage incoming leads from the landing page.</p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden auto-cols-auto overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                                <th className="p-4 font-bold text-slate-600 text-sm">Lead Details</th>
                                <th className="p-4 font-bold text-slate-600 text-sm">Contact</th>
                                <th className="p-4 font-bold text-slate-600 text-sm">Location / Service</th>
                                <th className="p-4 font-bold text-slate-600 text-sm">Source</th>
                                <th className="p-4 font-bold text-slate-600 text-sm max-w-xs">Message</th>
                                <th className="p-4 font-bold text-slate-600 text-sm">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map(lead => {
                                const dateObj = new Date(lead.submittedAt);
                                return (
                                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {dateObj.toLocaleDateString()}
                                            </div>
                                            <div className="mt-0.5 ml-4">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{lead.name}</p>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {lead.phone}
                                                {lead.whatsappConsent && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold ml-1">WA</span>
                                                )}
                                            </div>
                                            {lead.email && (
                                                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {lead.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                {lead.city || 'N/A'}
                                            </div>
                                            {lead.serviceNeeded && (
                                                <div className="text-xs text-indigo-600 mt-1 font-semibold ml-5">
                                                    {lead.serviceNeeded}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded border border-slate-200 uppercase">
                                                {lead.source}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {lead.message ? (
                                                <div className="relative group max-w-[200px]">
                                                    <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 cursor-help">
                                                        <MessageSquare className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                        {lead.message}
                                                    </p>
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute z-10 hidden group-hover:block bg-slate-800 text-white text-xs p-2.5 rounded shadow-xl w-64 -top-8 left-0 break-words whitespace-normal">
                                                        {lead.message}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleStatusChange(lead.id, lead.status)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${lead.status === 'NEW'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                        : lead.status === 'CONTACTED'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                    }`}
                                                title="Click to cycle status"
                                            >
                                                {lead.status === 'NEW' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                                {lead.status === 'CLOSED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {lead.status || 'NEW'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No leads found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadsManagement;
