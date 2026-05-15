import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Ruler, X, Calculator, Save, Loader2, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from './ui/Toast';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';

const DailyMeasurementsForm = ({ selectedBoqItem, onClose, onSuccess }) => {
    if (!selectedBoqItem) return null;

    const [formData, setFormData] = useState({
        length: '',
        width: '',
        todayQty: 0,
        remarks: '',
        supervisorName: 'Supervisor'
    });

    const [loading, setLoading] = useState(false);
    const [calculatedValue, setCalculatedValue] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setFormData(prev => ({ ...prev, supervisorName: storedUser }));
        }
    }, []);

    useEffect(() => {
        const l = parseFloat(formData.length) || 0;
        const w = parseFloat(formData.width) || 0;
        let qty = 0;

        if (selectedBoqItem.unit === 'SFT' || selectedBoqItem.unit === 'CUM') {
            qty = l * w;
        } else {
            qty = l;
        }

        setCalculatedValue(parseFloat(qty.toFixed(2)));
    }, [formData.length, formData.width, selectedBoqItem.unit]);

    const remainingScope = selectedBoqItem.totalScope - selectedBoqItem.completedScope;
    const isOverLimit = calculatedValue > remainingScope;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (calculatedValue <= 0) {
            showToast('error', "Invalid Entry", { description: "Please enter valid site dimensions." });
            return;
        }

        setLoading(true);
        try {
            await api.post('/measurements/record', {
                boqId: selectedBoqItem.id,
                length: parseFloat(formData.length) || 0,
                width: parseFloat(formData.width) || 0,
                remarks: formData.remarks,
                supervisorName: formData.supervisorName
            });

            showToast('success', "Measurement Recorded", { description: `${calculatedValue} ${selectedBoqItem.unit} added to audit.` });
            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (err) {
            showToast('error', "Sync failure", { description: err.response?.data || "Failed to log measurement." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={!!selectedBoqItem}
            onClose={onClose}
            title="Field Log Entry"
            icon={<Calculator className="w-6 h-6 text-admin-accent" />}
            footer={
                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || calculatedValue <= 0 || isOverLimit}
                        className="btn-premium w-full py-6 justify-center text-sm font-black uppercase tracking-[0.4em]"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                        {loading ? 'SYNCING...' : 'COMMIT ENTRY'}
                    </button>
                    <button onClick={onClose} className="w-full py-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest hover:text-admin-text transition-colors">
                        Discard Draft
                    </button>
                </div>
            }
        >
            <div className="space-y-10 py-4">
                {/* Editorial Context */}
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em] mb-1">Item Reference</p>
                    <h3 className="text-3xl font-black text-admin-text uppercase tracking-tighter leading-none">{selectedBoqItem.itemName}</h3>
                    <div className="flex items-center gap-2 pt-2">
                        <span className="px-3 py-1 bg-admin-bg-tertiary border-2 border-admin-border rounded-full text-[10px] font-black text-admin-text-muted uppercase tracking-widest">{selectedBoqItem.unit}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-border" />
                        <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Target: {selectedBoqItem.totalScope}</span>
                    </div>
                </div>

                {/* Metric Matrix */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-admin-bg-tertiary border-2 border-admin-border rounded-[2rem] shadow-inner">
                        <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Remaining</p>
                        <p className={`text-2xl font-black ${remainingScope > 0 ? 'text-admin-success' : 'text-admin-danger'} tracking-tighter`}>{remainingScope.toFixed(2)}</p>
                    </div>
                    <div className={`p-6 border-2 rounded-[2rem] shadow-premium transition-all ${isOverLimit ? 'bg-admin-danger/10 border-admin-danger shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-admin-accent/5 border-admin-accent'}`}>
                        <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-widest mb-2">New Entry</p>
                        <p className={`text-2xl font-black ${isOverLimit ? 'text-admin-danger' : 'text-admin-accent'} tracking-tighter`}>{calculatedValue}</p>
                    </div>
                </div>

                {/* Tactile Dimension Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Length (FT)</label>
                        <input
                            type="number" step="0.01"
                            className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-4xl font-black text-admin-text focus:border-admin-accent outline-none shadow-inner transition-all text-center"
                            placeholder="0.00"
                            value={formData.length}
                            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">
                            {['RFT', 'NOS', 'LUMP'].includes(selectedBoqItem.unit) ? 'Multiplier' : 'Width (FT)'}
                        </label>
                        <input
                            type="number" step="0.01"
                            className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-4xl font-black text-admin-text focus:border-admin-accent outline-none shadow-inner transition-all text-center disabled:opacity-20"
                            placeholder="1.00"
                            value={formData.width}
                            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                            disabled={['RFT', 'NOS', 'LUMP'].includes(selectedBoqItem.unit)}
                        />
                    </div>
                </div>

                {/* Remark Field */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Work Annotation / Floor Marking</label>
                    <textarea
                        rows="3"
                        className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border rounded-[2rem] text-sm font-black uppercase tracking-tight text-admin-text focus:border-admin-accent outline-none shadow-inner placeholder:text-admin-text-muted/30"
                        placeholder="E.G. GROUND FLOOR LOBBY, NORTH WALL..."
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                {isOverLimit && (
                    <div className="flex items-center gap-4 p-6 bg-admin-danger/10 border-2 border-admin-danger rounded-[1.5rem] animate-pulse">
                        <AlertTriangle className="w-6 h-6 text-admin-danger" />
                        <p className="text-[10px] font-black text-admin-danger uppercase tracking-widest leading-relaxed">
                            Critical: Entry exceeds remaining manifest scope. Review dimensions before commit.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default DailyMeasurementsForm;
