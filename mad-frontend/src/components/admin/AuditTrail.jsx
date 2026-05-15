import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    History, Search, Filter, Calendar, User, 
    Globe, Clock, AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import { SkeletonTable } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

const AuditTrail = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, SUCCESS, ERROR

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/admin/audit-logs');
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch audit logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.uri.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.method.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'SUCCESS') return matchesSearch && log.status < 400;
        if (filter === 'ERROR') return matchesSearch && log.status >= 400;
        return matchesSearch;
    });

    const getStatusColor = (status) => {
        if (status < 300) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (status < 400) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="space-y-8 animate-fade-in font-admin pb-20">
            <PageHeader 
                title="Audit Trail" 
                subtitle="Chronological record of system operations and user activities."
                icon={<History className="w-8 h-8 text-admin-accent" />}
            />

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-admin-bg-secondary p-4 rounded-2xl border border-admin-border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                    <input 
                        type="text"
                        placeholder="Search by user, path or method..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-admin-bg-tertiary border border-admin-border rounded-xl focus:border-admin-accent outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {['ALL', 'SUCCESS', 'ERROR'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-admin-accent text-white shadow-lg shadow-admin-accent/20' 
                                : 'bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-text border border-admin-border'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={10} />
            ) : filteredLogs.length > 0 ? (
                <div className="admin-card overflow-hidden p-0 border-admin-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-admin-border bg-admin-bg-tertiary/30">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted">Timestamp</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted">Identity</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted">Operation</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted">Status</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text-muted text-right">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-admin-bg-tertiary/20 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-admin-bg-tertiary rounded-lg group-hover:bg-admin-accent/10 transition-colors">
                                                    <Clock className="w-4 h-4 text-admin-text-muted group-hover:text-admin-accent" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-admin-text">
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-admin-text-muted">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-admin-accent/10 flex items-center justify-center text-admin-accent font-black text-xs">
                                                    {log.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-admin-text uppercase tracking-tight">{log.username}</p>
                                                    <p className="text-[10px] font-medium text-admin-text-muted flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> {log.ipAddress || 'Internal'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest ${
                                                    log.method === 'GET' ? 'bg-blue-500/10 text-blue-500' :
                                                    log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    log.method === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {log.method}
                                                </span>
                                                <p className="text-sm font-medium text-admin-text-secondary truncate max-w-[300px]">
                                                    {log.uri}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                log.status >= 200 && log.status < 300 
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                    : log.status >= 400 
                                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                        : 'bg-admin-bg-tertiary text-admin-text-muted border border-admin-border'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className={`text-xs font-mono font-bold ${
                                                log.duration > 500 ? 'text-amber-500' : 'text-admin-text-muted'
                                            }`}>
                                                {log.duration}ms
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState 
                    title="No records found" 
                    description="Try adjusting your filters or search terms."
                    icon={History}
                />
            )}
        </div>
    );
};

export default AuditTrail;
