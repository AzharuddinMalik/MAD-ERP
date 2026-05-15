import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { workerService } from '../services/workerService';
import { attendanceService } from '../services/attendanceService';
import {
    Users, Plus, Save, UserCheck, UserX, Clock,
    ArrowLeft, HardHat, Loader2, Edit2, Trash2, X, Lock,
    CheckCircle2, AlertCircle, Search, Filter, IndianRupee, UserPlus,
    TrendingUp, Activity, Coins, Fingerprint, Calendar
} from 'lucide-react';
import { useToast } from './ui/Toast';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';
import PageHeader from './ui/PageHeader';
import { SkeletonTable } from './ui/Skeleton';
import Tooltip from './ui/Tooltip';

const LabourManagement = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const projectName = location.state?.projectName || `Project #${projectId}`;

    const [activeTab, setActiveTab] = useState('attendance');
    const [workers, setWorkers] = useState([]);
    const [attendanceState, setAttendanceState] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [duplicateWarnings, setDuplicateWarnings] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add/Edit Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Helper', wage: '' });

    const [project, setProject] = useState(null);

    // 1. Fetch Team & Project Context
    const fetchTeam = async () => {
        setLoading(true);
        try {
            // Fetch Workers
            const workersData = await workerService.getWorkersByProject(projectId);
            setWorkers(workersData);

            // Fetch Project Status
            const { data: projectData } = await api.get(`/admin/projects/${projectId}`);
            setProject(projectData);

            const initialAttendance = {};
            workersData.forEach(w => {
                initialAttendance[w.id] = 'PRESENT';
            });
            setAttendanceState(initialAttendance);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Failed to load project context", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [projectId]);

    const isFinalized = project?.status === 'COMPLETED' || project?.status === 'INVOICED';

    useEffect(() => {
        if (!formData.name) {
            setDuplicateWarnings([]);
            return;
        }

        const possibleDuplicates = workers.filter(w =>
            w.id !== editingId &&
            w.name.toLowerCase().includes(formData.name.toLowerCase())
        );

        setDuplicateWarnings(possibleDuplicates);
    }, [formData.name, workers, editingId]);

    // 2. Handle Add / Update
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (editingId) {
                await workerService.updateWorker(editingId, { ...formData, projectId });
                showToast('success', `Worker "${formData.name}" updated successfully.`);
            } else {
                await workerService.createWorker({ ...formData, projectId });
                showToast('success', `Worker "${formData.name}" added to the project.`);
            }
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ name: '', type: 'Helper', wage: '' });
            setDuplicateWarnings([]);
            fetchTeam();
        } catch (err) {
            showToast('error', "Operation failed. Check system logs.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Handle Delete
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from this project?`)) return;
        try {
            await workerService.deleteWorker(id);
            showToast('success', `${name} removed from project.`);
            fetchTeam();
        } catch (err) {
            showToast('error', "Failed to remove worker.");
        }
    };

    const openEditForm = (worker) => {
        setEditingId(worker.id);
        setFormData({ name: worker.name, type: worker.type, wage: worker.dailyWage });
        setIsFormOpen(true);
    };

    // 4. Submit Attendance
    const submitAttendance = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const payload = workers.map(w => ({
            labourId: w.id,
            projectId,
            status: attendanceState[w.id]
        }));

        try {
            await attendanceService.markAttendance(payload);
            showToast('success', "Attendance Saved Successfully!", { description: "Work logs for today have been archived." });
            navigate(-1);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data || err.message || "Server Error";
            showToast('error', "Failed to save attendance", { description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = (id, status) => {
        setAttendanceState(prev => ({ ...prev, [id]: status }));
    };

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: workers.length,
        present: Object.values(attendanceState).filter(s => s === 'PRESENT').length,
        half: Object.values(attendanceState).filter(s => s === 'HALF_DAY').length,
        dailyWage: workers.reduce((acc, w) => acc + (w.dailyWage || 0), 0)
    };

    if (loading && !project) return (
        <div className="space-y-6 max-w-7xl mx-auto p-8">
            <SkeletonTable rows={10} cols={4} />
        </div>
    );

    return (
        <div className="font-admin text-admin-text space-y-12 max-w-5xl mx-auto px-4 md:px-0 mb-24 relative animate-fade-in">
            {/* Editorial Header */}
            <div className="flex justify-between items-end mb-16 pt-8">
                <div className="space-y-3">
                    <h1 className="text-editorial-title">Labour Portal</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-admin-accent animate-pulse" />
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">{projectName}</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-4 bg-admin-bg-secondary border border-admin-border text-admin-text-muted hover:text-admin-accent rounded-full transition-all hover:scale-110 shadow-premium group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* High-Density Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Site Crew', val: stats.total, icon: Users, color: 'emerald' },
                    { label: 'Present', val: stats.present, icon: Activity, color: 'blue' },
                    { label: 'Half Day', val: stats.half, icon: Clock, color: 'amber' },
                    { label: 'Est. Daily', val: `₹${stats.dailyWage}`, icon: Coins, color: 'purple', tooltip: "Projected daily expenditure based on present crew." }
                ].map((s, i) => (
                    <Tooltip key={i} content={s.tooltip || `${s.label} count for current site manifest.`} position="bottom">
                        <div className="admin-card p-6 flex items-center gap-4 border-l-4 h-full" style={{ borderLeftColor: `var(--admin-${s.color})` }}>
                            <div className={`p-3 rounded-xl bg-admin-bg-tertiary text-admin-${s.color} shadow-inner`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-[0.2em]">{s.label}</p>
                                <h4 className="text-xl font-black tracking-tight">{s.val}</h4>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>

            {/* Mobile-Optimized Tab Switcher */}
            <div className="flex p-2 bg-admin-bg-secondary rounded-[2rem] border-2 border-admin-border shadow-inner-soft">
                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${activeTab === 'attendance' ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    <Calendar className="w-3.5 h-3.5" />
                    Daily Roster
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${activeTab === 'team' ? 'bg-admin-accent text-white shadow-premium' : 'text-admin-text-muted hover:text-admin-text'}`}
                >
                    <Users className="w-3.5 h-3.5" />
                    Manage Team
                </button>
            </div>

            <div className="space-y-8">
                {activeTab === 'attendance' && (
                    <div className="space-y-8">
                        {/* Finalized Warning */}
                        {isFinalized && (
                            <div className="admin-card bg-red-500/10 border-red-500/20 p-6 flex items-start gap-4 animate-shake">
                                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-sm font-black text-red-500 uppercase tracking-widest">Operation Locked</h4>
                                    <p className="text-xs text-admin-text-secondary mt-1 leading-relaxed">
                                        Site archived. Attendance records are now immutable.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-text-muted group-focus-within:text-admin-accent transition-colors opacity-40" />
                            <input
                                type="text"
                                placeholder="IDENTIFY PERSONNEL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-8 py-6 bg-admin-bg-secondary border-2 border-admin-border rounded-[2rem] text-xs font-black uppercase tracking-widest focus:border-admin-accent outline-none shadow-inner-soft transition-all disabled:opacity-50"
                                disabled={isFinalized}
                            />
                        </div>

                        {/* Worker Matrix */}
                        <div className={`space-y-4 ${isFinalized ? 'opacity-50 pointer-events-none' : ''}`}>
                            {filteredWorkers.map(worker => (
                                <div key={worker.id} className="admin-card p-6 sm:p-8 hover:bg-admin-bg-secondary transition-all group relative overflow-hidden border-b-4 border-b-admin-border">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-admin-bg-tertiary rounded-2xl flex items-center justify-center text-admin-accent border-2 border-admin-border shadow-inner font-black text-xl transition-all duration-500 group-hover:bg-admin-accent group-hover:text-white">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xl font-black text-admin-text uppercase tracking-tight">{worker.name}</h4>
                                                    {attendanceState[worker.id] === 'PRESENT' && (
                                                        <Tooltip content="Personnel is active and on-site today.">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[9px] font-black text-admin-accent uppercase tracking-widest bg-admin-accent/10 px-2.5 py-1 rounded-md">{worker.type}</span>
                                                    <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest font-mono">₹{worker.dailyWage}/D</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tactile Status Toggles */}
                                        <div className="flex gap-2 p-1.5 bg-admin-bg-tertiary rounded-[1.2rem] border-2 border-admin-border shadow-inner">
                                            {[
                                                { id: 'PRESENT', label: 'PRESENT', color: 'emerald' },
                                                { id: 'HALF_DAY', label: 'HALF', color: 'amber' },
                                                { id: 'ABSENT', label: 'ABSENT', color: 'red' }
                                            ].map(status => (
                                                <button
                                                    key={status.id}
                                                    onClick={() => toggleStatus(worker.id, status.id)}
                                                    className={`px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${attendanceState[worker.id] === status.id ? `bg-${status.color}-500 text-white shadow-premium scale-[1.02]` : 'text-admin-text-muted hover:bg-admin-border'}`}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sticky Action Button */}
                        <div className="pt-12 sticky bottom-8 z-10">
                            <button
                                onClick={submitAttendance}
                                disabled={isSubmitting || workers.length === 0 || isFinalized}
                                className="btn-premium w-full py-8 text-sm font-black uppercase tracking-[0.3em] justify-center shadow-premium-lg disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSubmitting ? 'Syncing Manifest...' : 'Commit Daily Log'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-12">
                        {/* Onboard Button */}
                        <button
                            onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ name: '', type: 'Mason', wage: '' }); }}
                            disabled={isFinalized}
                            className="w-full admin-card border-dashed p-12 flex flex-col items-center gap-4 hover:border-admin-accent hover:bg-admin-accent/5 transition-all group disabled:opacity-30"
                        >
                            <div className="w-16 h-16 bg-admin-bg-tertiary rounded-full flex items-center justify-center border-2 border-admin-border shadow-inner group-hover:bg-admin-accent group-hover:text-white transition-all">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black uppercase tracking-tight">Onboard Specialist</h3>
                                <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-[0.2em] mt-1">Add a new specialist to the site roster</p>
                            </div>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredWorkers.map(w => (
                                <div key={w.id} className="admin-card p-8 group relative overflow-hidden bg-admin-bg-secondary/50 border-b-8 border-b-admin-border">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditForm(w)} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-accent rounded-xl border border-admin-border shadow-inner transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(w.id, w.name)} className="p-2.5 bg-admin-bg-tertiary text-admin-text-muted hover:text-admin-danger rounded-xl border border-admin-border shadow-inner transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    
                                    <div className="flex items-start gap-6">
                                        <div className="w-20 h-20 bg-admin-bg-tertiary rounded-3xl flex items-center justify-center text-admin-accent border-4 border-admin-border shadow-inner font-black text-3xl group-hover:bg-admin-accent group-hover:text-white transition-all">
                                            {w.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black text-admin-text-muted uppercase tracking-[0.3em] mb-1">Worker ID: #{w.id.toString().slice(-4)}</p>
                                            <h3 className="text-2xl font-black text-admin-text uppercase tracking-tight leading-none mb-4">{w.name}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-admin-accent uppercase tracking-widest bg-admin-accent/10 px-3 py-1.5 rounded-lg border border-admin-accent/20">
                                                    {w.type}
                                                </span>
                                                <span className="text-sm font-black font-mono text-admin-text-muted">₹{w.dailyWage}/D</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Onboarding Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId ? 'Refine Profile' : 'Onboard Specialist'}
                footer={
                    <div className="flex gap-4 w-full">
                        <ModalCancelButton onClick={() => setIsFormOpen(false)} className="flex-1">Discard</ModalCancelButton>
                        <ModalPrimaryButton form="worker-form" loading={isSubmitting} className="flex-[2]">
                            {editingId ? 'Commit Update' : 'Initialize Specialist'}
                        </ModalPrimaryButton>
                    </div>
                }
            >
                <form id="worker-form" onSubmit={handleFormSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 ml-1">
                            <Fingerprint className="w-4 h-4 text-admin-accent" />
                            <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Full Identity</label>
                        </div>
                        <input
                            placeholder="NAME AS PER SYSTEM RECORD..."
                            className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border text-admin-text font-black uppercase tracking-widest rounded-[2rem] focus:border-admin-accent outline-none shadow-inner transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        {duplicateWarnings.length > 0 && (
                            <div className="p-4 bg-admin-accent/10 text-admin-accent rounded-2xl border-2 border-admin-accent/20 flex items-start gap-3 animate-pulse">
                                <AlertCircle className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Identity Match Found</p>
                                    <p className="text-[9px] opacity-70 mt-1">Personnel already exists: {duplicateWarnings[0].name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2 ml-1">
                                <HardHat className="w-4 h-4 text-admin-accent" />
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Specialization</label>
                            </div>
                            <select
                                className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border text-admin-text font-black uppercase tracking-widest rounded-[2rem] focus:border-admin-accent outline-none appearance-none shadow-inner cursor-pointer"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Mason</option>
                                <option>Helper</option>
                                <option>Carpenter</option>
                                <option>Painter</option>
                                <option>Electrician</option>
                                <option>Plumber</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2 ml-1">
                                <IndianRupee className="w-4 h-4 text-admin-accent" />
                                <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Daily Wage</label>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full px-8 py-6 bg-admin-bg-tertiary border-4 border-admin-border text-admin-text font-mono font-black text-2xl rounded-[2rem] focus:border-admin-accent outline-none shadow-inner"
                                    value={formData.wage}
                                    onChange={e => setFormData({ ...formData, wage: e.target.value })}
                                    required
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-admin-text-muted opacity-40 tracking-widest">INR</span>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LabourManagement;