import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
    HardHat, MapPin, Users, Send, Ruler, Activity,
    Camera, Building2, LayoutDashboard, RefreshCw,
    ShieldCheck, Clock, ChevronRight, AlertCircle, FileText, Package, Truck, PhoneCall, Filter
} from 'lucide-react';
import PageHeader from './ui/PageHeader';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';
import { useToast } from './ui/Toast';
import { SkeletonTable } from './ui/Skeleton';
// ✅ M4 FIX: Import shared SSE hook for real-time requisition updates
import { useNotifications } from '../hooks/useNotifications';

const SupervisorDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [requisitions, setRequisitions] = useState([]);
    const [receivingReq, setReceivingReq] = useState(null);
    const [receiveQty, setReceiveQty] = useState('');

    // Form Inputs
    const [labourCount, setLabourCount] = useState('');
    const [status, setStatus] = useState('');
    const [remark, setRemark] = useState('');
    const [photo1, setPhoto1] = useState(null);
    const [photo2, setPhoto2] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Requisition Inputs
    const [openReqModal, setOpenReqModal] = useState(false);
    const [reqItemName, setReqItemName] = useState('');
    const [reqQty, setReqQty] = useState('');
    const [reqUnit, setReqUnit] = useState('NOS');
    const [reqUrgency, setReqUrgency] = useState('NORMAL');
    const [reqRemarks, setReqRemarks] = useState('');
    const [isReqSubmitting, setIsReqSubmitting] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    // ✅ M4 FIX: Real-time requisition status updates via shared SSE hook
    const handleRequisitionEvent = useCallback((reqUpdate) => {
        const statusMsg = reqUpdate.status === 'APPROVED' ? '✅ Approved' :
                          reqUpdate.status === 'REJECTED' ? '❌ Rejected' :
                          reqUpdate.status === 'ASSIGNED' ? '🎯 Vendor Assigned' :
                          `Status: ${reqUpdate.status}`;
        showToast('info', `Order Update: ${statusMsg}`, {
            description: reqUpdate.customItemName || 'Material order updated'
        });
    }, [showToast]);

    useNotifications(null, handleRequisitionEvent);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/supervisor/my-projects');
            setProjects(response.data);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Fetch failed", err);
            setError("Failed to load your assigned sites.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequisitions = async () => {
        try {
            const { data } = await api.get('/requisitions/my');
            setRequisitions(data);
        } catch (err) {
            console.error("Failed to fetch requisitions", err);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchRequisitions();
    }, []);

    const handleOpenUpdate = (project) => {
        setSelectedProject(project);
        setLabourCount(project.labourCount || '');
        setStatus(project.status || 'RUNNING');
        setOpenModal(true);
        setPhoto1(null);
        setPhoto2(null);
    };

    const submitUpdate = async () => {
        if (!labourCount || !selectedProject || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('projectId', selectedProject.id);
            formData.append('labourCount', labourCount);
            formData.append('status', status);
            formData.append('remark', remark);
            if (photo1) formData.append('photo1', photo1);
            if (photo2) formData.append('photo2', photo2);

            await api.post('/supervisor/daily-update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setOpenModal(false);
            setRemark('');
            setPhoto1(null);
            setPhoto2(null);
            fetchProjects();
            showToast('success', "Daily operations broadcasted to HQ.");
        } catch (err) {
            showToast('error', "Broadcast failure", { description: "Technical error while uplinking report." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0">
            <div className="flex justify-between items-end mb-8">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-admin-border animate-pulse rounded-lg" />
                    <div className="h-4 w-64 bg-admin-border/50 animate-pulse rounded-lg" />
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-admin-card rounded-2xl border border-admin-border animate-pulse p-6" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="font-admin text-admin-text space-y-12 max-w-4xl mx-auto px-4 md:px-0 mb-24 relative animate-fade-in">
            {/* Editorial Header */}
            <div className="flex justify-between items-end mb-16 pt-8">
                <div className="space-y-3">
                    <h1 className="text-editorial-title text-admin-text">Field Portal</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-admin-accent animate-pulse" />
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">Live Operations Control</p>
                    </div>
                </div>
                <button onClick={fetchProjects} className="p-4 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent rounded-full transition-all hover:scale-110 active:scale-95 shadow-premium">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-admin-accent' : ''}`} />
                </button>
            </div>

            {error ? (
                <div className="admin-card border-admin-danger/20 p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-admin-danger/10 rounded-full flex items-center justify-center mx-auto text-admin-danger animate-bounce-soft">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold uppercase tracking-widest">Synchronization Error</h3>
                        <p className="text-xs text-admin-text-muted opacity-60">Unable to uplink with command center.</p>
                    </div>
                    <button onClick={fetchProjects} className="btn-premium px-12 py-4 justify-center">Retry Connection</button>
                </div>
            ) : projects.length === 0 ? (
                <div className="admin-card border-dashed p-20 text-center space-y-6 opacity-40">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold uppercase tracking-widest">No Active Sites</h3>
                        <p className="text-xs">Deployment queue empty for this operative.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    {projects.map((project) => (
                        <div key={project.id} className="admin-card relative group hover:scale-[1.01] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest block opacity-40 mb-1">Active Crew</span>
                                    <span className="text-5xl font-black text-admin-accent font-admin tracking-tighter leading-none">{project.labourCount || 0}</span>
                                </div>
                            </div>

                            <div className="p-8 sm:p-12 space-y-8">
                                <div className="max-w-[70%]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-admin-success" />
                                        <span className="text-[10px] font-black text-admin-success uppercase tracking-[0.3em]">Operational</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-admin-text leading-tight font-admin tracking-tight group-hover:text-admin-accent transition-colors">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-4 text-admin-text-muted opacity-40">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">{project.city?.name || 'Jaipur HQ'}</span>
                                    </div>
                                </div>

                                {/* High-Touch Action Matrix - Bundled 2x2 Grid */}
                                <div className="mt-8 bg-admin-bg-tertiary border border-admin-border rounded-[2rem] overflow-hidden shadow-inner-soft grid grid-cols-2">
                                    <button onClick={() => handleOpenUpdate(project)} className="w-full flex flex-col items-start justify-center p-6 border-b border-r border-admin-border/50 hover:bg-admin-hover transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="w-12 h-12 rounded-[1rem] bg-admin-bg flex items-center justify-center text-admin-accent shadow-sm border border-admin-border/50 group-hover:scale-105 transition-transform mb-4">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div className="text-left w-full flex flex-col gap-1">
                                            <span className="block text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-accent transition-colors line-clamp-1">Report Status</span>
                                            <span className="text-[9px] text-admin-text-muted uppercase tracking-wider opacity-60 line-clamp-1">Daily Log</span>
                                        </div>
                                        <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-admin-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-admin-accent transition-all" />
                                    </button>
                                    
                                    <button onClick={() => navigate(`/smart-book/${project.id}`, { state: { projectName: project.name } })} className="w-full flex flex-col items-start justify-center p-6 border-b border-admin-border/50 hover:bg-admin-hover transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="w-12 h-12 rounded-[1rem] bg-admin-bg flex items-center justify-center text-admin-text-muted group-hover:text-admin-text transition-colors shadow-sm border border-admin-border/50 group-hover:scale-105 transition-transform mb-4">
                                            <Ruler className="w-5 h-5" />
                                        </div>
                                        <div className="text-left w-full flex flex-col gap-1">
                                            <span className="block text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-text transition-colors line-clamp-1">Measure</span>
                                            <span className="text-[9px] text-admin-text-muted uppercase tracking-wider opacity-60 line-clamp-1">Smart BOQ</span>
                                        </div>
                                        <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-admin-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-admin-text transition-all" />
                                    </button>

                                    <button onClick={() => navigate(`/labour/${project.id}`, { state: { projectName: project.name } })} className="w-full flex flex-col items-start justify-center p-6 border-r border-admin-border/50 hover:bg-admin-hover transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="w-12 h-12 rounded-[1rem] bg-admin-bg flex items-center justify-center text-admin-text-muted group-hover:text-admin-text transition-colors shadow-sm border border-admin-border/50 group-hover:scale-105 transition-transform mb-4">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="text-left w-full flex flex-col gap-1">
                                            <span className="block text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-text transition-colors line-clamp-1">Attendance</span>
                                            <span className="text-[9px] text-admin-text-muted uppercase tracking-wider opacity-60 line-clamp-1">Workforce</span>
                                        </div>
                                        <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-admin-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-admin-text transition-all" />
                                    </button>

                                    <button onClick={() => { setSelectedProject(project); setOpenReqModal(true); }} className="w-full flex flex-col items-start justify-center p-6 hover:bg-admin-hover transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="w-12 h-12 rounded-[1rem] bg-admin-bg flex items-center justify-center text-admin-text-muted group-hover:text-admin-text transition-colors shadow-sm border border-admin-border/50 group-hover:scale-105 transition-transform mb-4">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="text-left w-full flex flex-col gap-1">
                                            <span className="block text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-text transition-colors line-clamp-1">Order</span>
                                            <span className="text-[9px] text-admin-text-muted uppercase tracking-wider opacity-60 line-clamp-1">Logistics</span>
                                        </div>
                                        <ChevronRight className="absolute right-4 bottom-4 w-4 h-4 text-admin-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-admin-text transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Logistics Section — Premium Typography */}
            <div className="pt-12 space-y-8">
                <div className="flex items-center justify-between border-b-4 border-admin-text/5 pb-8">
                    <h2 className="text-editorial-title">Logistics Pipeline</h2>
                    <div className="px-4 py-2 bg-admin-accent rounded-full text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                        {requisitions.filter(r => r.status === 'ASSIGNED').length} In Transit
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {requisitions.filter(r => r.status === 'ASSIGNED').map(req => (
                        <div key={req.id} className="admin-card border-l-8 border-l-admin-accent p-8 animate-slide-up group">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-4">
                                    <div className="p-4 w-16 h-16 bg-admin-accent/10 rounded-2xl flex items-center justify-center text-admin-accent">
                                        <Truck className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-admin-text uppercase tracking-tight">{req.customItemName}</h3>
                                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.3em] mt-2">Dispatched to {req.project?.name}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setReceivingReq(req); setReceiveQty(req.quantity); }}
                                    className="btn-premium py-4 px-8 justify-center gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5" /> Receive Stock
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-admin-border opacity-40">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Partner Vendor</p>
                                    <p className="text-sm font-bold text-admin-text">{req.vendor?.name || 'Enterprise Supplier'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Expected Manifest</p>
                                    <p className="text-sm font-bold text-admin-text">{req.quantity} {req.unitOfMeasure}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {requisitions.filter(r => r.status === 'ASSIGNED').length === 0 && (
                        <div className="py-20 text-center admin-card border-dashed opacity-20">
                            <Truck className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Logistics clear. No pending arrivals.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            <Modal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                title="Field Report Broadcast"
                footer={
                    <div className="flex gap-4 w-full">
                        <ModalCancelButton onClick={() => setOpenModal(false)} className="flex-1">Discard</ModalCancelButton>
                        <ModalPrimaryButton onClick={submitUpdate} loading={isSubmitting} className="flex-[2]">
                            <Send className="w-4 h-4 mr-2" /> Broadcast to HQ
                        </ModalPrimaryButton>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Current Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text rounded-2xl focus:border-admin-accent outline-none appearance-none font-bold shadow-inner"
                            >
                                <option value="RUNNING">Active / Running</option>
                                <option value="DELAYED">Delayed / Blocked</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Phase Complete</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Active Crew</label>
                            <input
                                type="number"
                                value={labourCount}
                                onChange={(e) => setLabourCount(e.target.value)}
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text font-mono rounded-2xl focus:border-admin-accent outline-none font-black shadow-inner"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Field Intelligence</label>
                        <textarea
                            rows="4"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text rounded-2xl focus:border-admin-accent outline-none placeholder:text-admin-text-muted/30 text-sm font-medium shadow-inner"
                            placeholder="Describe site conditions, arrivals or blockers..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <label key={i} className="block cursor-pointer group">
                                <div className={`border-2 border-dashed ${(i === 1 ? photo1 : photo2) ? 'border-admin-accent bg-admin-accent/5' : 'border-admin-border bg-admin-bg-tertiary'} rounded-2xl p-8 text-center transition-all group-hover:border-admin-accent/50 shadow-inner`}>
                                    <Camera className={`w-8 h-8 mx-auto mb-3 ${(i === 1 ? photo1 : photo2) ? 'text-admin-accent animate-pulse' : 'text-admin-text-muted'}`} />
                                    <span className={`text-[10px] font-black truncate block ${(i === 1 ? photo1 : photo2) ? 'text-admin-accent' : 'text-admin-text-muted opacity-40 uppercase'}`}>
                                        {(i === 1 ? photo1 : photo2) ? (i === 1 ? photo1 : photo2).name : `Visual Proof ${i}`}
                                    </span>
                                    <input type="file" accept="image/*" onChange={(e) => i === 1 ? setPhoto1(e.target.files[0]) : setPhoto2(e.target.files[0])} className="hidden" />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Requisition Modal */}
            <Modal
                isOpen={openReqModal}
                onClose={() => setOpenReqModal(false)}
                title="Material Request"
                footer={
                    <div className="flex gap-4 w-full">
                        <ModalCancelButton onClick={() => setOpenReqModal(false)} className="flex-1">Discard</ModalCancelButton>
                        <ModalPrimaryButton 
                            onClick={async () => {
                                if(!reqItemName || !reqQty || isReqSubmitting) return;
                                setIsReqSubmitting(true);
                                try {
                                    await api.post('/requisitions', {
                                        project: { id: selectedProject.id },
                                        customItemName: reqItemName,
                                        quantity: reqQty,
                                        unitOfMeasure: reqUnit,
                                        urgency: reqUrgency,
                                        remarks: reqRemarks
                                    });
                                    setOpenReqModal(false);
                                    showToast('success', "Order placed successfully!");
                                } catch (err) {
                                    showToast('error', "Order uplink failed");
                                } finally {
                                    setIsReqSubmitting(false);
                                }
                            }}
                            loading={isReqSubmitting}
                            className="flex-[2]"
                        >
                            <Send className="w-4 h-4 mr-2" /> Place Requisition
                        </ModalPrimaryButton>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Material Description</label>
                        <input
                            type="text"
                            value={reqItemName}
                            onChange={(e) => setReqItemName(e.target.value)}
                            className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text rounded-2xl focus:border-admin-accent outline-none font-bold shadow-inner"
                            placeholder="e.g. 50kg Cement Bags, 12mm TMT Steel..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Quantity</label>
                            <input
                                type="number"
                                value={reqQty}
                                onChange={(e) => setReqQty(e.target.value)}
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text font-mono rounded-2xl focus:border-admin-accent outline-none font-black shadow-inner"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Unit</label>
                            <select
                                value={reqUnit}
                                onChange={(e) => setReqUnit(e.target.value)}
                                className="w-full px-6 py-4 bg-admin-bg-tertiary border-2 border-admin-border text-admin-text rounded-2xl focus:border-admin-accent outline-none appearance-none font-bold shadow-inner"
                            >
                                <option value="NOS">Numbers</option>
                                <option value="BAGS">Bags</option>
                                <option value="KG">Kilograms</option>
                                <option value="MT">Metric Tons</option>
                                <option value="SFT">Square Feet</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Deployment Urgency</label>
                        <div className="flex gap-3">
                            {['NORMAL', 'URGENT', 'CRITICAL'].map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setReqUrgency(u)}
                                    className={`flex-1 py-4 text-[10px] font-black rounded-xl border-2 transition-all ${
                                        reqUrgency === u 
                                        ? 'bg-admin-accent text-white border-admin-accent shadow-premium scale-105' 
                                        : 'bg-admin-bg-tertiary border-admin-border text-admin-text-muted'
                                    }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Receipt Modal */}
            <Modal
                isOpen={!!receivingReq}
                onClose={() => setReceivingReq(null)}
                title="Manifest Receipt"
                footer={
                    <div className="flex gap-4 w-full">
                        <ModalCancelButton onClick={() => setReceivingReq(null)} className="flex-1">Cancel</ModalCancelButton>
                        <ModalPrimaryButton
                            onClick={async () => {
                                if(!receiveQty || isSubmitting) return;
                                setIsSubmitting(true);
                                try {
                                    await api.post(`/requisitions/${receivingReq.id}/receive?quantity=${receiveQty}`);
                                    setReceivingReq(null);
                                    fetchRequisitions();
                                    showToast('success', "Stock reconciled successfully");
                                } catch (err) {
                                    showToast('error', "Reconciliation failed");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            loading={isSubmitting}
                            className="flex-[2]"
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Confirm Receipt
                        </ModalPrimaryButton>
                    </div>
                }
            >
                <div className="space-y-8 font-mono">
                    <div className="p-8 bg-admin-bg-tertiary rounded-[2rem] border-2 border-admin-border shadow-inner">
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-widest mb-2">Item on Manifest</p>
                        <h4 className="text-3xl font-black text-admin-text uppercase tracking-tight">{receivingReq?.customItemName}</h4>
                        <div className="mt-8 flex gap-4">
                            <div className="px-4 py-2 bg-admin-bg border-2 border-admin-border rounded-xl text-[10px] font-black uppercase">
                                PO QTY: {receivingReq?.quantity} {receivingReq?.unitOfMeasure}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest ml-1">Actual Delivered Qty</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={receiveQty}
                                onChange={(e) => setReceiveQty(e.target.value)}
                                className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border text-admin-text text-4xl font-black rounded-[2rem] focus:border-admin-accent outline-none font-mono shadow-inner"
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-admin-text-muted uppercase">
                                {receivingReq?.unitOfMeasure}
                            </span>
                        </div>
                        {parseFloat(receiveQty) < parseFloat(receivingReq?.quantity) && (
                            <p className="text-[10px] font-black text-admin-danger uppercase tracking-widest flex items-center gap-2 mt-4 animate-pulse">
                                <AlertCircle className="w-4 h-4" /> Discrepancy: Partial receipt detected
                            </p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupervisorDashboard;