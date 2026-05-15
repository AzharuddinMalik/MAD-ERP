import React, { useState, useEffect } from 'react';
import { Search, User, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';

const SupervisorSelector = ({ selectedSupervisorId, onSelect }) => {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSupervisors = async () => {
            try {
                const res = await api.get('/admin/supervisors');
                setSupervisors(res.data);
            } catch (err) {
                if (err.name === 'CanceledError') return;
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
        if (count < 3) return 'bg-admin-success bg-opacity-80';
        if (count < 6) return 'bg-admin-accent bg-opacity-80';
        return 'bg-admin-danger bg-opacity-80';
    };

    const getWorkloadText = (count) => {
        if (count < 3) return 'Light Load';
        if (count < 6) return 'Moderate Load';
        return 'Heavy Load';
    };

    return (
        <div className="space-y-4 font-admin">
            <div className="flex justify-between items-center mb-1 border-b border-admin-border pb-3">
                <h3 className="text-lg font-bold text-admin-text flex items-center gap-2">
                    Team Assignment
                </h3>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-admin-text-muted" />
                <input
                    type="text"
                    placeholder="Search supervisor by name or username..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-admin-border bg-admin-bg text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none transition text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                {loading ? (
                    <div className="col-span-full text-center text-admin-text-muted text-sm py-8 animate-pulse">
                        Fetching available supervisors...
                    </div>
                ) : filteredSupervisors.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onSelect(user.id)}
                        className={`cursor-pointer border rounded-xl p-4 flex items-start gap-4 transition-all duration-200 group
                            ${parseInt(selectedSupervisorId) === user.id 
                                ? 'border-admin-accent bg-admin-accent/5 ring-1 ring-admin-accent shadow-md shadow-amber-500/5' 
                                : 'border-admin-border bg-admin-card hover:border-admin-accent/50 hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                            ${parseInt(selectedSupervisorId) === user.id ? 'bg-admin-accent/20 text-admin-accent' : 'bg-admin-hover text-admin-text-muted group-hover:bg-admin-accent/10 group-hover:text-admin-accent'}`}>
                            <User className="w-5 h-5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start mb-0.5">
                                <h4 className={`font-bold text-sm truncate transition-colors
                                    ${parseInt(selectedSupervisorId) === user.id ? 'text-admin-accent' : 'text-admin-text group-hover:text-admin-accent'}`}>
                                    {user.fullName || user.username}
                                </h4>
                                {parseInt(selectedSupervisorId) === user.id && (
                                    <CheckCircle2 className="w-5 h-5 text-admin-accent flex-shrink-0 ml-2" />
                                )}
                            </div>
                            <p className="text-xs text-admin-text-muted truncate mb-2">@{user.username}</p>

                            {/* Workload Indicator */}
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${getWorkloadColor(user.projectCount || 0)}`}></span>
                                <span className="text-[11px] font-bold text-admin-text-secondary uppercase tracking-wider">
                                    {user.projectCount || 0} Projects <span className="text-admin-text-muted lowercase tracking-normal font-medium ml-1">({getWorkloadText(user.projectCount || 0)})</span>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSupervisors.length === 0 && !loading && (
                <div className="text-center text-admin-text-muted text-sm py-8 bg-admin-bg rounded-xl border border-admin-border border-dashed">
                    No supervisors matched your search.
                </div>
            )}
        </div>
    );
};

export default SupervisorSelector;
