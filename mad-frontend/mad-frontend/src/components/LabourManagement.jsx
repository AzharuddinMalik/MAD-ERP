import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { workerService } from '../services/workerService';
import { attendanceService } from '../services/attendanceService';
import {
    Users, Plus, Save, UserCheck, UserX, Clock,
    ArrowLeft, HardHat, Loader2, Edit2, Trash2, X,
    CheckCircle2, AlertCircle, Search, Filter
} from 'lucide-react';

const LabourManagement = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const projectName = location.state?.projectName || `Project #${projectId}`;

    const [activeTab, setActiveTab] = useState('attendance');
    const [workers, setWorkers] = useState([]);
    const [attendanceState, setAttendanceState] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [duplicateWarnings, setDuplicateWarnings] = useState([]); // Store duplicate warnings
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add/Edit Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Helper', wage: '' });

    // 1. Fetch Team
    const fetchTeam = async () => {
        setLoading(true);
        try {
            // Use centralized service
            const data = await workerService.getWorkersByProject(projectId);
            setWorkers(data);

            // Initialize attendance state (Default: Present)
            const initialAttendance = {};
            data.forEach(w => {
                initialAttendance[w.id] = 'PRESENT';
            });
            setAttendanceState(initialAttendance);
        } catch (err) {
            console.error("Failed to load team", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [projectId]);

    // Check for duplicates when form data changes
    useEffect(() => {
        if (!formData.name) return;

        const possibleDuplicates = workers.filter(w =>
            w.id !== editingId && // Don't compare with self
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
                // UPDATE via Service
                await workerService.updateWorker(editingId, { ...formData, projectId });
                alert("Worker updated successfully!");
            } else {
                // CREATE via Service
                await workerService.createWorker({ ...formData, projectId });
                alert("Worker added successfully!");
            }
            setIsFormOpen(false);
            setEditingId(null);
            setFormData({ name: '', type: 'Helper', wage: '' });
            setDuplicateWarnings([]);
            fetchTeam();
        } catch (err) {
            alert("Operation failed. Check console.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the worker from this project.")) return;
        try {
            // Delete via Service
            await workerService.deleteWorker(id);
            alert("Worker removed.");
            fetchTeam();
        } catch (err) {
            alert("Failed to delete.");
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
            // Submit via Service
            await attendanceService.markAttendance(payload);
            alert("✅ Attendance Saved Successfully!");
            navigate(-1);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data || err.message || "Server Error";
            alert("❌ Failed to save attendance: " + errorMessage);
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

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 text-brand-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 mb-2 hover:text-brand-600 transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Labour Management</h1>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                            <HardHat className="w-4 h-4 text-slate-400" />
                            {projectName}
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search workers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:bg-slate-50 transition-colors w-48 md:w-64"
                            />
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            Daily Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'team' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            Manage Team
                        </button>
                    </div>

                    <div className="p-6">
                        {/* TAB 1: ATTENDANCE */}
                        {activeTab === 'attendance' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Mark Attendance</h3>
                                            <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600 shadow-sm">
                                        Total: {workers.length}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {filteredWorkers.map(worker => (
                                        <div key={worker.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group bg-white">
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                                                    {worker.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{worker.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{worker.type}</span>
                                                        <span>•</span>
                                                        <span>₹{worker.dailyWage}/day</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-lg border border-slate-100 w-full sm:w-fit">
                                                <button
                                                    onClick={() => toggleStatus(worker.id, 'PRESENT')}
                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${attendanceState[worker.id] === 'PRESENT' ? 'bg-white text-green-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Present
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(worker.id, 'HALF_DAY')}
                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${attendanceState[worker.id] === 'HALF_DAY' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <Clock className="w-4 h-4" /> Half Day
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(worker.id, 'ABSENT')}
                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${attendanceState[worker.id] === 'ABSENT' ? 'bg-white text-red-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <UserX className="w-4 h-4" /> Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredWorkers.length === 0 && (
                                        <div className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold mb-1">No Workers Found</h3>
                                            <p className="text-slate-500 text-sm">Try adjusting your search or add a new worker.</p>
                                        </div>
                                    )}
                                </div>
                                {workers.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                        <button
                                            onClick={submitAttendance}
                                            disabled={isSubmitting}
                                            className={`w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:scale-[1.01]'}`}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {isSubmitting ? 'Saving...' : 'Save Daily Attendance'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: MANAGE TEAM */}
                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                {!isFormOpen ? (
                                    <button
                                        onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ name: '', type: 'Helper', wage: '' }); }}
                                        className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl font-bold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex justify-center items-center gap-2 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span>Add New Worker to Team</span>
                                    </button>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="bg-slate-50 p-6 rounded-xl border border-brand-100 relative animate-in fade-in slide-in-from-top-4 duration-300">
                                        <button type="button" onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                                            {editingId ? <Edit2 className="w-5 h-5 text-brand-600" /> : <Plus className="w-5 h-5 text-brand-600" />}
                                            {editingId ? 'Edit Worker Details' : 'Add New Worker'}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                                <input
                                                    placeholder="e.g. Rajesh Kumar"
                                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                                {duplicateWarnings.length > 0 && (
                                                    <div className="mt-2 p-2 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100 flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-bold">Possible duplicate(s) found:</p>
                                                            <ul className="list-disc list-inside">
                                                                {duplicateWarnings.map(w => (
                                                                    <li key={w.id}>{w.name} ({w.type})</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                                                <select
                                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none bg-white transition-all"
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                >
                                                    <option>Mason</option>
                                                    <option>Helper</option>
                                                    <option>Carpenter</option>
                                                    <option>Painter</option>
                                                    <option>Supervisor</option>
                                                    <option>Electrician</option>
                                                    <option>Plumber</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Wage</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full pl-8 p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
                                                        value={formData.wage}
                                                        onChange={e => setFormData({ ...formData, wage: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 transition-colors flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700'}`}
                                            >
                                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {editingId ? 'Update Worker Details' : 'Add to Team'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredWorkers.map(w => (
                                        <div key={w.id} className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditForm(w)}
                                                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(w.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex flex-col items-center text-center mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-indigo-100 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-2xl mb-3 shadow-inner">
                                                    {w.name.charAt(0)}
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg">{w.name}</h3>
                                                <p className="text-sm text-slate-500 font-medium">{w.type}</p>
                                            </div>

                                            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-xs text-slate-500 font-bold uppercase">Daily Wage</span>
                                                <span className="font-bold text-slate-800">₹{w.dailyWage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabourManagement;