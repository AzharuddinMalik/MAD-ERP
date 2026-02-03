import React, { useState } from 'react';
import { Edit2, Plus, Trash2, X, Search, MoreVertical, ArrowUpDown, Check, AlertCircle, Ruler, FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import DailyMeasurementsForm from './DailyMeasurementsForm';

const BOQTable = ({ boqItems, projectId, onRefresh, isClientView, loading: initialLoading }) => {
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Add Form State
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({
        itemName: '',
        unit: 'SFT',
        totalScope: '',
        rate: ''
    });

    // Measurement Modal State
    const [measuringItem, setMeasuringItem] = useState(null);

    const [loading, setLoading] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');

    // Check Permissions (Admin Only for Edits)
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ROLE_ADMIN' && !isClientView;

    // --- ADD HANDLERS ---
    const handleAddClick = () => {
        setIsAdding(true);
        setAddForm({ itemName: '', unit: 'SFT', totalScope: '', rate: '' });
    };

    const handleAddSubmit = async () => {
        if (!addForm.itemName || !addForm.totalScope || !addForm.rate) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            await api.post('/measurements/boq', {
                projectId: projectId,
                ...addForm
            });
            setIsAdding(false);
            onRefresh();
            toast.success("Item added successfully");
        } catch (err) {
            console.error("Add failed", err);
            toast.error("Failed to add item");
        } finally {
            setLoading(false);
        }
    };

    // --- EDIT HANDLERS ---
    const handleEditClick = (item) => {
        setIsEditing(item.id);
        setEditForm({
            itemName: item.itemName,
            unit: item.unit,
            totalScope: item.totalScope,
            rate: item.rate
        });
    };

    const handleEditSubmit = async (id) => {
        setLoading(true);
        try {
            await api.put(`/measurements/boq/${id}`, editForm);
            setIsEditing(null);
            onRefresh();
            toast.success("Item updated");
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Item?")) return;
        setLoading(true);
        try {
            await api.delete(`/measurements/boq/${id}`);
            onRefresh();
            toast.success("Item deleted");
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = boqItems.filter(item =>
        item.itemName.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full relative">
            {/* Table Header / Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleAddClick}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Item
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-4 py-4 w-24">Unit</th>
                            <th className="px-4 py-4 w-32">Rate (₹)</th>
                            <th className="px-4 py-4 w-32">Quantity</th>
                            <th className="px-6 py-4 w-64">Progress</th>
                            <th className="px-4 py-4 w-40 text-right">Total (₹)</th>
                            {isAdmin && <th className="px-4 py-4 w-32 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Add Row Form */}
                        {isAdding && (
                            <tr className="bg-brand-50/30 animate-in fade-in slide-in-from-top-2">
                                <td className="px-6 py-3">
                                    <input
                                        autoFocus
                                        className="w-full px-3 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        placeholder="Enter work description..."
                                        value={addForm.itemName}
                                        onChange={e => setAddForm({ ...addForm, itemName: e.target.value })}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="w-full px-2 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                                        value={addForm.unit}
                                        onChange={e => setAddForm({ ...addForm, unit: e.target.value })}
                                    >
                                        {['SFT', 'RFT', 'LUMP', 'CUM', 'NOS'].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input type="number" className="w-full px-2 py-2 border border-slate-200 rounded-lg outline-none text-sm" placeholder="0.00" value={addForm.rate} onChange={e => setAddForm({ ...addForm, rate: e.target.value })} />
                                </td>
                                <td className="px-4 py-3">
                                    <input type="number" className="w-full px-2 py-2 border border-slate-200 rounded-lg outline-none text-sm" placeholder="0" value={addForm.totalScope} onChange={e => setAddForm({ ...addForm, totalScope: e.target.value })} />
                                </td>
                                <td className="px-6 py-3" colSpan="2">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Item will be added to project BOQ.</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={handleAddSubmit} disabled={loading} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-md transition-colors"><Check className="w-4 h-4" /></button>
                                        <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data Rows */}
                        {filteredItems.map(item => (
                            <React.Fragment key={item.id}>
                                {isEditing === item.id ? (
                                    <tr className="bg-amber-50/50 border-l-4 border-amber-400">
                                        <td className="px-6 py-3">
                                            <input className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white" value={editForm.itemName} onChange={e => setEditForm({ ...editForm, itemName: e.target.value })} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select className="w-full px-2 py-2 border border-amber-300 rounded-lg outline-none text-sm bg-white" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })}>
                                                {['SFT', 'RFT', 'LUMP', 'CUM', 'NOS'].map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3"><input type="number" className="w-full px-2 py-2 border border-amber-300 rounded-lg outline-none text-sm bg-white" value={editForm.rate} onChange={e => setEditForm({ ...editForm, rate: e.target.value })} /></td>
                                        <td className="px-4 py-3"><input type="number" className="w-full px-2 py-2 border border-amber-300 rounded-lg outline-none text-sm bg-white" value={editForm.totalScope} onChange={e => setEditForm({ ...editForm, totalScope: e.target.value })} /></td>
                                        <td className="px-6 py-3 text-slate-400 italic text-xs">Editing...</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-800 font-bold">₹{(editForm.rate * editForm.totalScope).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEditSubmit(item.id)} disabled={loading} className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-sm"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setIsEditing(null)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"><X className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800 text-sm">{item.itemName}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200">{item.unit}</span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 font-medium">₹{item.rate}</td>
                                        <td className="px-4 py-4 text-slate-600 font-medium">{item.totalScope}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-100">
                                                    <div
                                                        className={`h-full rounded-full ${item.completedScope >= item.totalScope ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                                        style={{ width: `${Math.min((item.completedScope / item.totalScope) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                                                    <span>{item.completedScope} done</span>
                                                    <span>{Math.round((item.completedScope / item.totalScope) * 100)}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-mono text-slate-700 font-bold">
                                            ₹{(item.rate * item.totalScope).toLocaleString()}
                                        </td>
                                        {/* Actions Column */}
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex justify-center gap-1">
                                                {/* Measurement Button - Always Visible or Admin Only? Usually Site Engineer/Admin */}
                                                <button
                                                    onClick={() => setMeasuringItem(item)}
                                                    className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors shadow-sm"
                                                    title="Log Measurement"
                                                >
                                                    <Ruler className="w-4 h-4" />
                                                </button>

                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => handleEditClick(item)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors ml-1"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}

                        {boqItems.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200 border-dashed">
                                            <Search className="w-6 h-6 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">No items found</p>
                                        <p className="text-xs mt-1">Add items to start tracking quantities.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Measurement Modal */}
            {measuringItem && (
                <DailyMeasurementsForm
                    selectedBoqItem={measuringItem}
                    onClose={() => setMeasuringItem(null)}
                    onSuccess={() => {
                        setMeasuringItem(null);
                        onRefresh(); // Refresh totals
                    }}
                />
            )}
        </div>
    );
};

export default BOQTable;
