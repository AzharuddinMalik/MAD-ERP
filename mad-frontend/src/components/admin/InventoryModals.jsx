import React, { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Loader2, AlertCircle, ShieldCheck, Mail, Phone, Package, ChevronRight, HelpCircle, Filter, DollarSign, Clock } from 'lucide-react';
import Button from '../ui/Button';

const Field = ({ label, children, span = 1, icon: Icon, error }) => (
    <div className={span === 2 ? 'col-span-1 sm:col-span-2' : 'space-y-2'}>
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase text-admin-text tracking-[0.2em] opacity-40 flex items-center gap-2 font-admin">
                {label}
                {Icon && <Icon className="w-3.5 h-3.5 opacity-40" />}
            </label>
            {error && (
                <span className="text-[10px] text-admin-danger font-black animate-fade-in uppercase tracking-widest">
                    {error}
                </span>
            )}
        </div>
        {children}
    </div>
);

const inputClass = "w-full bg-admin-bg-tertiary border-2 border-transparent rounded-2xl px-5 py-4 text-sm text-admin-text focus:border-admin-accent focus:bg-admin-bg-secondary outline-none transition-all duration-300 font-admin placeholder:text-admin-text-muted/30 shadow-inner-soft";
const sectionHeaderClass = "text-[12px] font-black text-admin-text uppercase tracking-[0.3em] mb-6 flex items-center gap-4 opacity-30";

// ═══════════════════════════════════════════════
// ADD MATERIAL MODAL
// ═══════════════════════════════════════════════
export const AddMaterialModal = memo(({ onClose, projects, vendors, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'MASONRY',
        unitOfMeasure: '', 
        currentQuantity: 0,
        minimumStockLevel: 0,
        projectId: '',
        vendorId: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name' && !value) error = 'Required';
        if (name === 'unitOfMeasure' && !value) error = 'Required';
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateField('name', formData.name) || !validateField('unitOfMeasure', formData.unitOfMeasure)) return;

        setLoading(true);
        setError('');
        try {
            const { inventoryService } = await import('../../services/inventoryService');
            const payload = {
                ...formData,
                project: formData.projectId ? { id: parseInt(formData.projectId) } : null,
                vendor: formData.vendorId ? { id: parseInt(formData.vendorId) } : null
            };
            await inventoryService.create(payload);
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-admin-bg-primary/80 backdrop-blur-xl animate-fade-in">
            <div className="bg-admin-bg-secondary w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-[2rem] p-8 sm:p-12 animate-slide-up sm:animate-scale-in max-h-[95vh] overflow-y-auto no-scrollbar shadow-premium relative border-t sm:border border-admin-border">
                
                {/* Header — Editorial Style */}
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                        <h3 className="text-editorial-title text-admin-text">
                            Inventory
                        </h3>
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.3em]">
                            New Material Registration
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-6 rounded-3xl bg-admin-danger/10 text-admin-danger text-xs font-black uppercase tracking-widest border border-admin-danger/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Item Definition */}
                    <div className="space-y-6">
                        <div className={sectionHeaderClass}>
                            <span className="flex-shrink-0">Item Definition</span>
                            <div className="h-px w-full bg-admin-border" />
                        </div>
                        
                        <Field label="Description" error={errors.name}>
                            <input 
                                required 
                                name="name"
                                className={`${inputClass} text-lg font-bold`} 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                onBlur={handleBlur}
                                placeholder="e.g. Italian Marble 'Calacatta'" 
                                autoFocus 
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Category">
                                <select 
                                    className={`${inputClass} cursor-pointer`} 
                                    value={formData.category} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="MASONRY">Masonry & Stone</option>
                                    <option value="ELECTRICAL">Electrical Systems</option>
                                    <option value="PLUMBING">Hydraulic Works</option>
                                    <option value="FINISHING">Artisanal Finishing</option>
                                    <option value="TOOLS">Precision Tools</option>
                                </select>
                            </Field>

                            <Field label="Unit" error={errors.unitOfMeasure}>
                                <input 
                                    required
                                    name="unitOfMeasure"
                                    placeholder="e.g. SQFT, PCS" 
                                    className={inputClass} 
                                    value={formData.unitOfMeasure} 
                                    onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })} 
                                    onBlur={handleBlur}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Logistics & Linking */}
                    <div className="space-y-6">
                        <div className={sectionHeaderClass}>
                            <span className="flex-shrink-0">Logistics & Linking</span>
                            <div className="h-px w-full bg-admin-border" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Target Project">
                                <select 
                                    className={inputClass} 
                                    value={formData.projectId} 
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">Global Inventory</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name || p.projectName}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Default Vendor">
                                <select 
                                    className={inputClass} 
                                    value={formData.vendorId} 
                                    onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Initial Stock">
                                <input type="number" className={inputClass} value={formData.currentQuantity || ''} onChange={e => setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) || 0 })} />
                            </Field>
                            <Field label="Min. Threshold">
                                <input type="number" className={inputClass} value={formData.minimumStockLevel || ''} onChange={e => setFormData({ ...formData, minimumStockLevel: parseFloat(e.target.value) || 0 })} />
                            </Field>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-12">
                        <button type="button" onClick={onClose} className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
                            Dismiss
                        </button>
                        <button disabled={loading} type="submit" className="btn-premium flex-1 py-5 justify-center gap-4">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
});

// ═══════════════════════════════════════════════
// ASSIGN VENDOR MODAL
// ═══════════════════════════════════════════════
export const AssignVendorModal = memo(({ requisition, vendors, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [isManualOverride, setIsManualOverride] = useState(false);
    const [assignedVendor, setAssignedVendor] = useState(null);

    useEffect(() => {
        if (!isManualOverride && unitPrice) {
            setTotalCost(parseFloat(unitPrice) * requisition.quantity);
        }
    }, [unitPrice, requisition.quantity, isManualOverride]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vendorId) return;
        setLoading(true);
        setError('');
        try {
            const { requisitionService } = await import('../../services/requisitionService');
            await requisitionService.assignVendor(requisition.id, vendorId, unitPrice, totalCost);
            const vendor = vendors.find(v => v.id === parseInt(vendorId));
            setAssignedVendor(vendor);
            onSuccess(false);
        } catch (err) {
            setError(err?.response?.data?.message || 'Assignment failed');
        } finally {
            setLoading(false);
        }
    };

    const generateEmailBody = (vendor) => {
        const subject = encodeURIComponent(`Material Request - ${requisition.project?.name}`);
        const body = encodeURIComponent(`Order Details:\nItem: ${requisition.customItemName}\nQty: ${requisition.quantity} ${requisition.unitOfMeasure}`);
        return `mailto:${vendor.email}?subject=${subject}&body=${body}`;
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-admin-bg-primary/80 backdrop-blur-xl animate-fade-in">
            <div className="bg-admin-bg-secondary w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-8 sm:p-12 animate-slide-up sm:animate-scale-in max-h-[95vh] overflow-y-auto no-scrollbar shadow-premium relative border-t sm:border border-admin-border">
                
                {assignedVendor ? (
                    <div className="text-center space-y-8 py-8">
                        <div className="w-24 h-24 rounded-full bg-admin-success/10 text-admin-success flex items-center justify-center mx-auto animate-bounce-soft">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-editorial-title">Success</h3>
                            <p className="text-xs font-black uppercase tracking-widest opacity-40">Order Dispatched to @{assignedVendor.name}</p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={() => window.open(generateEmailBody(assignedVendor))} className="btn-premium w-full py-5 justify-center">
                                Finalize via Email
                            </button>
                            <button onClick={onClose} className="w-full py-5 text-[10px] font-black uppercase tracking-widest opacity-40">
                                Close Window
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h3 className="text-editorial-title">Fulfillment</h3>
                                <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.3em]">Project Logistics</p>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-text transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 rounded-3xl bg-admin-bg-tertiary border border-admin-border space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Reference</p>
                            <p className="text-xl font-bold">{requisition.customItemName}</p>
                            <div className="flex gap-4">
                                <span className="px-3 py-1 bg-admin-accent/10 text-admin-accent rounded-full text-[10px] font-black">{requisition.quantity} {requisition.unitOfMeasure}</span>
                                <span className="text-[10px] font-black opacity-30 self-center uppercase tracking-widest truncate">{requisition.project?.name}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <Field label="Select Supplier" icon={ShieldCheck}>
                                <select 
                                    required 
                                    className={inputClass} 
                                    value={vendorId} 
                                    onChange={e => setVendorId(e.target.value)}
                                >
                                    <option value="">Choose a verified vendor...</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </Field>

                            <div className="grid grid-cols-2 gap-6">
                                <Field label="Unit Price" icon={DollarSign}>
                                    <input type="number" required className={`${inputClass} font-mono`} value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0.00" />
                                </Field>
                                <Field label="Gross Total" icon={Package}>
                                    <input type="number" className={`${inputClass} font-mono text-admin-accent font-black`} value={totalCost} onChange={e => { setTotalCost(parseFloat(e.target.value) || 0); setIsManualOverride(true); }} />
                                </Field>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-12">
                                <button type="button" onClick={onClose} className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
                                    Abort
                                </button>
                                <button disabled={!vendorId || loading} type="submit" className="btn-premium flex-1 py-5 justify-center gap-4">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
});
// ═══════════════════════════════════════════════
// EDIT MATERIAL MODAL
// ═══════════════════════════════════════════════
export const EditMaterialModal = memo(({ material, onClose, projects, vendors, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: material.name || '',
        category: material.category || 'MASONRY',
        unitOfMeasure: material.unitOfMeasure || '',
        currentQuantity: material.currentQuantity || 0,
        minimumStockLevel: material.minimumStockLevel || 0,
        projectId: material.project?.id || '',
        vendorId: material.vendor?.id || '',
        description: material.description || ''
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';
        if (name === 'name' && !value) error = 'Required';
        if (name === 'unitOfMeasure' && !value) error = 'Required';
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateField('name', formData.name) || !validateField('unitOfMeasure', formData.unitOfMeasure)) return;

        setLoading(true);
        setError('');
        try {
            const { inventoryService } = await import('../../services/inventoryService');
            const payload = {
                ...formData,
                id: material.id,
                project: formData.projectId ? { id: parseInt(formData.projectId) } : null,
                vendor: formData.vendorId ? { id: parseInt(formData.vendorId) } : null
            };
            await inventoryService.update(material.id, payload);
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-admin-bg-primary/80 backdrop-blur-xl animate-fade-in">
            <div className="bg-admin-bg-secondary w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-[2rem] p-8 sm:p-12 animate-slide-up sm:animate-scale-in max-h-[95vh] overflow-y-auto no-scrollbar shadow-premium relative border-t sm:border border-admin-border">
                
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                        <h3 className="text-editorial-title text-admin-text">Update Stock</h3>
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.3em]">Modifying Manifest Item</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-6 rounded-3xl bg-admin-danger/10 text-admin-danger text-xs font-black uppercase tracking-widest border border-admin-danger/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="space-y-6">
                        <div className={sectionHeaderClass}>
                            <span className="flex-shrink-0">Item Definition</span>
                            <div className="h-px w-full bg-admin-border" />
                        </div>
                        
                        <Field label="Description" error={errors.name}>
                            <input 
                                required 
                                name="name"
                                className={`${inputClass} text-lg font-bold`} 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="Description" 
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Category">
                                <select 
                                    className={`${inputClass} cursor-pointer`} 
                                    value={formData.category} 
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="MASONRY">Masonry & Stone</option>
                                    <option value="ELECTRICAL">Electrical Systems</option>
                                    <option value="PLUMBING">Hydraulic Works</option>
                                    <option value="FINISHING">Artisanal Finishing</option>
                                    <option value="TOOLS">Precision Tools</option>
                                </select>
                            </Field>

                            <Field label="Unit" error={errors.unitOfMeasure}>
                                <input 
                                    required
                                    name="unitOfMeasure"
                                    className={inputClass} 
                                    value={formData.unitOfMeasure} 
                                    onChange={e => setFormData({ ...formData, unitOfMeasure: e.target.value })} 
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={sectionHeaderClass}>
                            <span className="flex-shrink-0">Stock Parameters</span>
                            <div className="h-px w-full bg-admin-border" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Target Project">
                                <select 
                                    className={inputClass} 
                                    value={formData.projectId} 
                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                >
                                    <option value="">Global Inventory</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name || p.projectName}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Default Vendor">
                                <select 
                                    className={inputClass} 
                                    value={formData.vendorId} 
                                    onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Current Quantity">
                                <input type="number" className={inputClass} value={formData.currentQuantity} onChange={e => setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) || 0 })} />
                            </Field>
                            <Field label="Min. Threshold">
                                <input type="number" className={inputClass} value={formData.minimumStockLevel} onChange={e => setFormData({ ...formData, minimumStockLevel: parseFloat(e.target.value) || 0 })} />
                            </Field>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-12">
                        <button type="button" onClick={onClose} className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
                            Dismiss
                        </button>
                        <button disabled={loading} type="submit" className="btn-premium flex-1 py-5 justify-center gap-4">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Synchronize Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
});
