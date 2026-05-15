import React, { useState } from 'react';
import { Edit2, Plus, Trash2, X, Search, Check, AlertCircle, Ruler, History, MoreVertical, Save } from 'lucide-react';
import api from '../api/axiosConfig';
import { useToast } from './ui/Toast';
import { SkeletonTable } from './ui/Skeleton';
import DailyMeasurementsForm from './DailyMeasurementsForm';
import BOQHistoryModal from './BOQHistoryModal';

/**
 * 📱 Mobile-First BOQ Card
 * Includes Fix: Support for Inline Editing Mode on Mobile
 */
const BOQMobileCard = ({ 
    item, 
    isAdmin, 
    isEditing, 
    editForm, 
    onMeasure, 
    onHistory, 
    onEditClick, 
    onCancelEdit, 
    onEditChange, 
    onEditSubmit, 
    onDelete,
    loading 
}) => {
    const progress = Math.min((item.completedScope / item.totalScope) * 100, 100);
    const isCompleted = item.completedScope >= item.totalScope;

    if (isEditing) {
        return (
            <div className="admin-card border-l-8 border-l-admin-accent p-8 mb-6 animate-slide-up">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Work Description</label>
                        <input 
                            className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border rounded-2xl text-admin-text font-black uppercase tracking-tight focus:border-admin-accent outline-none shadow-inner" 
                            value={editForm.itemName} 
                            onChange={e => onEditChange({ ...editForm, itemName: e.target.value })} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Unit</label>
                            <select 
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border rounded-2xl text-admin-text font-black outline-none appearance-none shadow-inner" 
                                value={editForm.unit} 
                                onChange={e => onEditChange({ ...editForm, unit: e.target.value })}
                            >
                                {['SFT', 'RFT', 'LUMP', 'CUM', 'NOS'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Rate (₹)</label>
                            <input 
                                type="number" 
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border rounded-2xl text-admin-text font-mono font-black focus:border-admin-accent outline-none shadow-inner" 
                                value={editForm.rate} 
                                onChange={e => onEditChange({ ...editForm, rate: e.target.value })} 
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => onEditSubmit(item.id)} 
                            disabled={loading}
                            className="btn-premium flex-1 py-4 justify-center"
                        >
                            <Check className="w-4 h-4 mr-2" /> Commit
                        </button>
                        <button 
                            onClick={onCancelEdit}
                            className="p-4 bg-admin-bg-tertiary text-admin-text-muted rounded-2xl border-2 border-admin-border"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card p-8 mb-6 group hover:scale-[1.01] transition-all border-b-8 border-b-admin-text/5">
            <div className="flex justify-between items-start gap-4 mb-8">
                <div className="flex-1">
                    <h4 className="text-2xl font-black text-admin-text uppercase tracking-tight leading-tight mb-2">{item.itemName}</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-admin-accent uppercase tracking-widest">{item.unit}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-border" />
                        <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest font-mono">₹{item.rate}/UNIT</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-admin-text tracking-tighter">₹{(item.rate * item.totalScope).toLocaleString()}</p>
                    <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mt-1">Total Scope: {item.totalScope}</p>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-admin-text-muted">{item.completedScope} DELIVERED</span>
                    <span className={isCompleted ? 'text-admin-success' : 'text-admin-accent'}>{Math.round(progress)}% COMPLETE</span>
                </div>
                <div className="w-full bg-admin-bg-tertiary rounded-full h-3 border-2 border-admin-border overflow-hidden shadow-inner">
                    <div
                        className={`h-full transition-all duration-700 shadow-premium ${isCompleted ? 'bg-admin-success' : 'bg-admin-accent'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-admin-border">
                <div className="flex gap-3">
                    <button
                        onClick={() => onMeasure(item)}
                        className="btn-premium px-6 py-3 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Ruler className="w-4 h-4 mr-2" /> Log Measurement
                    </button>
                    <button
                        onClick={() => onHistory(item)}
                        className="p-3 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent rounded-xl border-2 border-admin-border shadow-inner transition-all"
                    >
                        <History className="w-4 h-4" />
                    </button>
                </div>
                
                {isAdmin && (
                    <div className="flex gap-2">
                        <button onClick={() => onEditClick(item)} className="p-3 text-admin-text-muted hover:text-admin-accent transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(item.id)} className="p-3 text-admin-text-muted hover:text-admin-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

const BOQTable = ({ boqItems, projectId, onRefresh, isClientView, loading: initialLoading }) => {
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({ itemName: '', unit: 'SFT', totalScope: '', rate: '' });
    const [measuringItem, setMeasuringItem] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const { showToast } = useToast();

    const role = localStorage.getItem('role');
    const isAdmin = (role === 'ROLE_ADMIN' || role === 'ADMIN') && !isClientView;

    const handleAddSubmit = async () => {
        if (!addForm.itemName || !addForm.totalScope || !addForm.rate) {
            showToast('error', "Incomplete Entry", { description: "Work specification required." });
            return;
        }
        setLoading(true);
        try {
            await api.post('/measurements/boq', { projectId, ...addForm });
            setIsAdding(false);
            onRefresh();
            showToast('success', "Audit Item Created");
        } catch (err) {
            showToast('error', "Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (id) => {
        setLoading(true);
        try {
            await api.put(`/measurements/boq/${id}`, editForm);
            setIsEditing(null);
            onRefresh();
            showToast('success', "Manifest Updated");
        } catch (err) {
            showToast('error', "Update Error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this entry from ledger?")) return;
        setLoading(true);
        try {
            await api.delete(`/measurements/boq/${id}`);
            onRefresh();
            showToast('success', "Entry Deleted");
        } catch (err) {
            showToast('error', "Deletion Failed");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = boqItems.filter(item =>
        item.itemName.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (initialLoading) return (
        <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-admin-bg-tertiary rounded-[2rem] border-4 border-admin-border" />)}
        </div>
    );

    return (
        <div className="space-y-12 font-admin">
            {/* Search & Onboarding Matrix */}
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-text-muted opacity-40" />
                    <input
                        type="text"
                        placeholder="FILTER LEDGER BY ITEM..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-sm font-black uppercase tracking-widest focus:border-admin-accent outline-none shadow-inner"
                    />
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="btn-premium px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] justify-center"
                    >
                        {isAdding ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {isAdding ? 'Close Entry' : 'Append BOQ'}
                    </button>
                )}
            </div>

            {/* Inline Onboarding Form */}
            {isAdding && (
                <div className="admin-card border-l-8 border-l-admin-accent p-12 bg-admin-accent/5 animate-slide-up space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Work Description</label>
                        <input
                            autoFocus
                            className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-admin-text font-black uppercase tracking-tight focus:border-admin-accent outline-none shadow-inner"
                            placeholder="e.g. RCC M25 CASTING FOR PILLAR G1..."
                            value={addForm.itemName}
                            onChange={e => setAddForm({ ...addForm, itemName: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Manifest Unit</label>
                            <select
                                className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-admin-text font-black outline-none appearance-none shadow-inner"
                                value={addForm.unit}
                                onChange={e => setAddForm({ ...addForm, unit: e.target.value })}
                            >
                                {['SFT', 'RFT', 'LUMP', 'CUM', 'NOS'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Base Rate (₹)</label>
                            <input type="number" className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-admin-text font-mono font-black focus:border-admin-accent outline-none shadow-inner" placeholder="0.00" value={addForm.rate} onChange={e => setAddForm({ ...addForm, rate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Target Quantity</label>
                            <input type="number" className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-admin-text font-mono font-black focus:border-admin-accent outline-none shadow-inner" placeholder="0" value={addForm.totalScope} onChange={e => setAddForm({ ...addForm, totalScope: e.target.value })} />
                        </div>
                    </div>
                    <button onClick={handleAddSubmit} disabled={loading} className="btn-premium w-full py-6 text-sm font-black uppercase tracking-[0.4em] justify-center">
                        Confirm Manifest Entry
                    </button>
                </div>
            )}

            {/* Responsive Content Feed */}
            <div className="space-y-6">
                {/* Mobile View remains primary for supervisors */}
                <div className="md:hidden">
                    {filteredItems.map(item => (
                        <BOQMobileCard 
                            key={item.id}
                            item={item}
                            isAdmin={isAdmin}
                            isEditing={isEditing === item.id}
                            editForm={editForm}
                            onMeasure={setMeasuringItem}
                            onHistory={setHistoryItem}
                            onEditClick={(i) => { setIsEditing(i.id); setEditForm({ itemName: i.itemName, unit: i.unit, totalScope: i.totalScope, rate: i.rate }); }}
                            onCancelEdit={() => setIsEditing(null)}
                            onEditChange={setEditForm}
                            onEditSubmit={handleEditSubmit}
                            onDelete={handleDelete}
                            loading={loading}
                        />
                    ))}
                </div>

                {/* Desktop View - Dense Table */}
                <div className="hidden md:block admin-card overflow-hidden p-0 animate-fade-in shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-4 border-admin-border bg-admin-bg-tertiary">
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted">Work Description</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted">Unit & Rate</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted">Target Scope</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted">Progress</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted text-right">Total (₹)</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-admin-text-muted text-center w-48">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-admin-border">
                                {filteredItems.map(item => {
                                    const progress = Math.min((item.completedScope / item.totalScope) * 100, 100);
                                    const isCompleted = item.completedScope >= item.totalScope;
                                    const isItemEditing = isEditing === item.id;
                                    
                                    if (isItemEditing) {
                                        return (
                                            <tr key={item.id} className="bg-admin-bg-tertiary/50 border-l-4 border-l-admin-accent">
                                                <td className="p-6">
                                                    <input 
                                                        className="w-full px-4 py-3 bg-admin-bg-tertiary border-2 border-admin-border rounded-xl text-admin-text font-black uppercase tracking-tight focus:border-admin-accent outline-none shadow-inner transition-all duration-300" 
                                                        value={editForm.itemName} 
                                                        onChange={e => setEditForm({ ...editForm, itemName: e.target.value })} 
                                                    />
                                                </td>
                                                <td className="p-6 flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                                    <select 
                                                        className="w-24 px-4 py-3 bg-admin-bg-tertiary border-2 border-admin-border rounded-xl text-admin-text font-black outline-none appearance-none shadow-inner cursor-pointer" 
                                                        value={editForm.unit} 
                                                        onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                                    >
                                                        {['SFT', 'RFT', 'LUMP', 'CUM', 'NOS'].map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                    <input 
                                                        type="number" 
                                                        className="w-24 px-4 py-3 bg-admin-bg-tertiary border-2 border-admin-border rounded-xl text-admin-text font-mono font-black focus:border-admin-accent outline-none shadow-inner transition-all duration-300" 
                                                        value={editForm.rate} 
                                                        onChange={e => setEditForm({ ...editForm, rate: e.target.value })} 
                                                    />
                                                </td>
                                                <td className="p-6 text-admin-text font-mono">{item.totalScope}</td>
                                                <td className="p-6 text-admin-text-muted font-mono">{item.completedScope}</td>
                                                <td className="p-6"></td>
                                                <td className="p-6">
                                                    <div className="flex gap-2 justify-center">
                                                        <button 
                                                            onClick={() => handleEditSubmit(item.id)} 
                                                            disabled={loading}
                                                            className="p-3 bg-admin-success text-white rounded-xl hover:bg-green-600 transition-colors duration-300 shadow-premium cursor-pointer"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsEditing(null)}
                                                            className="p-3 bg-admin-bg-tertiary text-admin-text-muted hover:text-white hover:bg-admin-border rounded-xl transition-colors duration-300 border-2 border-admin-border cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item.id} className="group hover:bg-admin-bg-tertiary/30 transition-colors duration-300">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-admin-text uppercase tracking-tight group-hover:text-admin-accent transition-colors duration-300 cursor-pointer">{item.itemName}</span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-admin-accent/10 text-admin-accent border border-admin-accent/20">
                                                            BOQ ITEM
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-black text-admin-accent uppercase tracking-widest">{item.unit}</span>
                                                    <span className="text-xs font-black text-admin-text-muted uppercase tracking-widest font-mono">₹{item.rate}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xl font-black text-admin-text tracking-tighter">{item.totalScope}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-2 w-full min-w-[150px]">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-admin-text-muted">{item.completedScope} DONE</span>
                                                        <span className={isCompleted ? 'text-admin-success' : 'text-admin-accent'}>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-admin-bg-tertiary rounded-full h-2 overflow-hidden border border-admin-border shadow-inner">
                                                        <div
                                                            className={`h-full transition-all duration-700 ${isCompleted ? 'bg-admin-success' : 'bg-admin-accent'} shadow-premium`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className="text-xl font-black text-admin-text tracking-tighter">₹{(item.rate * item.totalScope).toLocaleString()}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <button onClick={() => setMeasuringItem(item)} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent hover:border-admin-accent rounded-xl border border-admin-border transition-all duration-300 shadow-inner cursor-pointer" title="Log Measurement">
                                                        <Ruler className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setHistoryItem(item)} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent hover:border-admin-accent rounded-xl border border-admin-border transition-all duration-300 shadow-inner cursor-pointer" title="History">
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button onClick={() => { setIsEditing(item.id); setEditForm({ itemName: item.itemName, unit: item.unit, totalScope: item.totalScope, rate: item.rate }); }} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent hover:border-admin-accent rounded-xl border border-admin-border transition-all duration-300 shadow-inner cursor-pointer" title="Edit Item">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-danger hover:border-admin-danger rounded-xl border border-admin-border transition-all duration-300 shadow-inner cursor-pointer" title="Delete Item">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && !isAdding && (
                <div className="p-20 text-center admin-card border-dashed opacity-20 flex flex-col items-center justify-center gap-6">
                    <Search className="w-16 h-16" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Ledger Clear. No matches found.</p>
                </div>
            )}

            {/* Modals */}
            {historyItem && (
                <BOQHistoryModal
                    item={historyItem}
                    onClose={() => setHistoryItem(null)}
                />
            )}

            {historyItem === null && measuringItem && (
                <DailyMeasurementsForm
                    selectedBoqItem={measuringItem}
                    onClose={() => setMeasuringItem(null)}
                    onSuccess={() => {
                        setMeasuringItem(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default BOQTable;
