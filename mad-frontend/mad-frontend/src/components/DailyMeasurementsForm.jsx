import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    Plus, X, Calculator, Save, Loader2, AlertTriangle, FileText, Ruler
} from 'lucide-react';
import toast from 'react-hot-toast';

const DailyMeasurementsForm = ({ selectedBoqItem, onClose, onSuccess }) => {
    // Safety Check
    if (!selectedBoqItem) return null;

    const [formData, setFormData] = useState({
        length: '',
        width: '', // For breadth/height
        todayQty: 0, // Calculated
        remarks: '',
        supervisorName: 'Supervisor' // Default
    });

    const [loading, setLoading] = useState(false);
    const [calculatedValue, setCalculatedValue] = useState(0);

    // Auto-fill Supervisor Name
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setFormData(prev => ({ ...prev, supervisorName: storedUser }));
        }
    }, []);

    // Dynamic Calculation Logic
    useEffect(() => {
        const l = parseFloat(formData.length) || 0;
        const w = parseFloat(formData.width) || 0;
        let qty = 0;

        if (selectedBoqItem.unit === 'SFT') {
            qty = l * w; // Area
        } else if (selectedBoqItem.unit === 'RFT') {
            qty = l; // Length only
        } else if (selectedBoqItem.unit === 'CUM') {
            qty = l * w; // Simplification (usually L*W*H, but form only has 2 inputs. Assuming 2D or pre-calc). 
            // Note: If CUM needs 3 dims, we might need a 3rd field. For now keeping as is to avoid logic break.
        } else {
            qty = l;
        }

        setCalculatedValue(parseFloat(qty.toFixed(2)));
    }, [formData.length, formData.width, selectedBoqItem.unit]);

    const remainingScope = selectedBoqItem.totalScope - selectedBoqItem.completedScope;
    const isOverLimit = calculatedValue > remainingScope;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (calculatedValue <= 0) {
            toast.error('Please enter valid measurements.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/measurements/record', {
                boqId: selectedBoqItem.id,
                length: parseFloat(formData.length) || 0,
                width: parseFloat(formData.width) || 0, // Sending width
                remarks: formData.remarks,
                supervisorName: formData.supervisorName
            });

            toast.success('Measurement logged successfully!');
            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (err) {
            console.error("Submission failed", err);
            toast.error(err.response?.data || "Failed to submit measurement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 flex justify-between items-start text-white">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Ruler className="w-5 h-5" />
                            Log Measurement
                        </h3>
                        <p className="text-brand-100 text-xs mt-1">
                            {selectedBoqItem.itemName} ({selectedBoqItem.unit})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 flex gap-4 text-sm">
                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase">Total Scope</p>
                            <p className="font-bold text-slate-800">{selectedBoqItem.totalScope}</p>
                        </div>
                        <div className="flex-1 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                            <p className="text-emerald-600/70 text-xs font-bold uppercase">Remaining</p>
                            <p className="font-bold text-emerald-700">{remainingScope.toFixed(2)}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Length (ft)</label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all font-bold text-slate-800"
                                    placeholder="0.00"
                                    value={formData.length}
                                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    {selectedBoqItem.unit === 'SFT' ? 'Width (ft)' : 'Multiplier'}
                                </label>
                                <input
                                    type="number" step="0.01"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="1.00"
                                    value={formData.width}
                                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                    disabled={['RFT', 'NOS', 'LUMP'].includes(selectedBoqItem.unit)}
                                />
                            </div>
                        </div>

                        {/* Calculation Result */}
                        <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${isOverLimit ? 'bg-red-50 border-red-100 text-red-700' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverLimit ? 'bg-red-100 text-red-600' : 'bg-white text-indigo-600'}`}>
                                    <Calculator className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold opacity-70">Calculated Qty</span>
                                    <strong className="text-xl leading-none">{calculatedValue} <span className="text-sm font-normal opacity-70">{selectedBoqItem.unit}</span></strong>
                                </div>
                            </div>
                            {isOverLimit && <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />}
                        </div>
                        {isOverLimit && <p className="text-xs text-center text-red-500 font-bold -mt-3">⚠️ This measurement exceeds the remaining scope!</p>}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Remarks / Location</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all text-sm min-h-[80px]"
                                placeholder="e.g. Living room wall, north side..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || calculatedValue <= 0}
                                className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Measurement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DailyMeasurementsForm;