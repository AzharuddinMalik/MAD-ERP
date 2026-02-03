import React, { useState, useEffect } from 'react';
import { Search, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

const SupervisorSelector = ({ selectedSupervisorId, onSelect }) => {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSupervisors = async () => {
            try {
                const res = await api.get('/admin/supervisors'); // Updated endpoint returns projectCount
                setSupervisors(res.data);
            } catch (err) {
                console.error("Failed to fetch supervisors", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSupervisors();
    }, []);

    const filteredSupervisors = supervisors.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getWorkloadColor = (count) => {
        if (count < 3) return 'bg-emerald-500';
        if (count < 6) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getWorkloadText = (count) => {
        if (count < 3) return 'Light Load';
        if (count < 6) return 'Moderate Load';
        return 'Heavy Load';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">Assign Supervisor</label>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search supervisor..."
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                {loading ? (
                    <div className="col-span-2 text-center text-slate-500 text-sm py-4">Loading supervisors...</div>
                ) : filteredSupervisors.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelect(user.id)}
                        className={`cursor-pointer border rounded-xl p-3 flex items-start gap-3 transition-all hover:shadow-md
                            ${parseInt(selectedSupervisorId) === user.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-200'}`}
                    >
                        {/* Avatar / Icon */}
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-slate-500" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-slate-900 text-sm truncate">{user.fullName || user.username}</h4>
                                {parseInt(selectedSupervisorId) === user.id && (
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">@{user.username}</p>

                            {/* Workload Indicator */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`w-2 h-2 rounded-full ${getWorkloadColor(user.projectCount || 0)}`}></span>
                                <span className="text-xs font-medium text-slate-600">
                                    {user.projectCount || 0} Projects <span className="text-slate-400">({getWorkloadText(user.projectCount || 0)})</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSupervisors.length === 0 && !loading && (
                <div className="text-center text-slate-500 text-sm py-2">No supervisors found.</div>
            )}
        </div>
    );
};

export default SupervisorSelector;
