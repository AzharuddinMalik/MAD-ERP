import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Modal, { ModalCancelButton } from './ui/Modal';
import { History, Calendar, User, Ruler, FileText, Loader2 } from 'lucide-react';

const BOQHistoryModal = ({ item, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/measurements/boq/${item.id}/history`);
                setHistory(res.data);
            } catch (err) {
                if (err.name === 'CanceledError') return;
                console.error("Error fetching BOQ history:", err);
            } finally {
                setLoading(false);
            }
        };
        if (item) fetchHistory();
    }, [item]);

    return (
        <Modal
            isOpen={!!item}
            onClose={onClose}
            title="Measurement Ledger"
            icon={<History className="w-6 h-6 text-admin-accent" />}
            footer={<button onClick={onClose} className="w-full py-4 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] hover:text-admin-text transition-colors">Close Manifest</button>}
        >
            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar py-4">
                {/* Header Context */}
                <div className="space-y-1 mb-10">
                    <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">Audit Trail</p>
                    <h3 className="text-2xl font-black text-admin-text uppercase tracking-tighter leading-tight">{item.itemName}</h3>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-admin-accent animate-spin mb-4" />
                        <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Retrieving Records...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 admin-card border-dashed opacity-30 flex flex-col items-center gap-6">
                        <History className="w-16 h-16" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ledger Empty</p>
                    </div>
                ) : (
                    <div className="relative space-y-6">
                        {/* Timeline Connector */}
                        <div className="absolute left-6 top-4 bottom-4 w-1 bg-admin-border" />

                        {history.map((log) => (
                            <div key={log.id} className="relative pl-14 group">
                                {/* Timeline Dot */}
                                <div className="absolute left-[1.125rem] top-2 w-[0.75rem] h-[0.75rem] rounded-full bg-admin-accent border-4 border-admin-bg-primary z-10" />

                                <div className="admin-card p-6 border-b-4 border-b-admin-text/5 group-hover:scale-[1.02] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-sm font-black text-admin-text uppercase tracking-tight flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-admin-accent" /> {log.supervisorName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="px-4 py-2 bg-admin-success text-white rounded-[1rem] shadow-premium">
                                                <p className="text-lg font-black tracking-tighter">+{log.quantity} <span className="text-[10px] tracking-normal font-sans uppercase">{item.unit}</span></p>
                                            </div>
                                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mt-2 font-mono">{log.length} FT × {log.height} FT</p>
                                        </div>
                                    </div>

                                    {log.remarks && (
                                        <div className="bg-admin-bg-tertiary px-5 py-4 rounded-[1.5rem] border-2 border-admin-border shadow-inner">
                                            <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1.5 opacity-40 flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Field Annotation
                                            </p>
                                            <p className="text-xs font-black text-admin-text uppercase tracking-tight leading-relaxed">
                                                {log.remarks}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BOQHistoryModal;
