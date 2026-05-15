import React from 'react';
import { 
    X, Users, UserPlus, HardHat, Clock, Search, Edit2, Trash2, 
    CheckCircle2, UserX, Loader2, AlertCircle, Save 
} from 'lucide-react';

const LabourDrawer = ({ drawer, isFinalized }) => {
    const {
        isOpen,
        closeDrawer,
        activeTab,
        setActiveTab,
        workers,
        attendanceState,
        loading,
        isSubmitting,
        searchTerm,
        setSearchTerm,
        filteredWorkers,
        isFormOpen,
        setIsFormOpen,
        editingId,
        setEditingId,
        formData,
        setFormData,
        duplicateWarnings,
        handleFormSubmit,
        openEditForm,
        handleDelete,
        toggleAttendance,
        submitAttendance
    } = drawer;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                onClick={closeDrawer}
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] md:w-[500px] bg-admin-card border-l border-admin-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 font-admin">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-admin-border bg-admin-card-hover/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-admin-accent/10 rounded-xl text-admin-accent">
                            <HardHat className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-admin-text leading-tight">Workforce Command</h2>
                            <p className="text-xs text-admin-text-secondary mt-0.5">Manage daily crew & attendance</p>
                        </div>
                    </div>
                    <button 
                        onClick={closeDrawer}
                        className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-hover rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-admin-accent animate-spin" />
                        <p className="text-sm font-bold text-admin-text-muted uppercase tracking-widest animate-pulse">Loading Roster...</p>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex border-b border-admin-border bg-admin-card-hover/30 flex-shrink-0 shadow-inner">
                            <button
                                onClick={() => setActiveTab('attendance')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-admin-accent text-admin-accent bg-admin-accent/5' : 'border-transparent text-admin-text-muted hover:text-admin-text hover:bg-admin-hover'}`}
                            >
                                Daily Attendance
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'team' ? 'border-admin-accent text-admin-accent bg-admin-accent/5' : 'border-transparent text-admin-text-muted hover:text-admin-text hover:bg-admin-hover'}`}
                            >
                                Manage Roster
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-admin-bg">
                            
                            {/* TAB: ATTENDANCE */}
                            {activeTab === 'attendance' && (
                                <div className="p-6 space-y-4">
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search team..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-admin-card text-admin-text placeholder:text-admin-text-muted border border-admin-border focus:border-admin-accent/50 transition-all shadow-sm"
                                        />
                                    </div>

                                    {filteredWorkers.map(worker => (
                                        <div key={worker.id} className="bg-admin-card rounded-xl border border-admin-border p-4 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-admin-bg rounded-lg flex items-center justify-center text-admin-text-secondary font-bold shadow-inner border border-admin-border">
                                                    {worker.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-admin-text text-sm capitalize">{worker.name}</p>
                                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-admin-text-muted mt-0.5">
                                                        <span className="text-admin-accent">{worker.type}</span>
                                                        <span>•</span>
                                                        <span className="font-mono bg-admin-bg px-1.5 py-0.5 rounded border border-admin-border/50">₹{worker.dailyWage}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex rounded-lg overflow-hidden border border-admin-border bg-admin-bg">
                                                <button
                                                    disabled={isFinalized}
                                                    onClick={() => toggleAttendance(worker.id, 'PRESENT')}
                                                    className={`flex-1 py-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border-r border-admin-border last:border-0 ${attendanceState[worker.id] === 'PRESENT' ? 'bg-admin-success/20 text-admin-success' : 'text-admin-text-muted hover:bg-admin-hover disabled:opacity-50'}`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Present
                                                </button>
                                                <button
                                                    disabled={isFinalized}
                                                    onClick={() => toggleAttendance(worker.id, 'HALF_DAY')}
                                                    className={`flex-1 py-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border-r border-admin-border last:border-0 ${attendanceState[worker.id] === 'HALF_DAY' ? 'bg-amber-500/20 text-amber-500' : 'text-admin-text-muted hover:bg-admin-hover disabled:opacity-50'}`}
                                                >
                                                    <Clock className="w-4 h-4" /> Half Day
                                                </button>
                                                <button
                                                    disabled={isFinalized}
                                                    onClick={() => toggleAttendance(worker.id, 'ABSENT')}
                                                    className={`flex-1 py-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${attendanceState[worker.id] === 'ABSENT' ? 'bg-admin-danger/20 text-admin-danger' : 'text-admin-text-muted hover:bg-admin-hover disabled:opacity-50'}`}
                                                >
                                                    <UserX className="w-4 h-4" /> Absent
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredWorkers.length === 0 && (
                                        <div className="text-center py-12 text-admin-text-muted">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-sm font-bold">No workers found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: MANAGE TEAM */}
                            {activeTab === 'team' && (
                                <div className="p-6 space-y-6">
                                    {!isFormOpen && !isFinalized && (
                                        <button
                                            onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ name: '', type: 'Helper', wage: '' }); }}
                                            className="w-full py-8 bg-admin-card border-2 border-dashed border-admin-border text-admin-text-secondary rounded-xl font-bold hover:border-admin-accent hover:text-admin-accent hover:bg-admin-accent/5 transition-all flex flex-col justify-center items-center gap-2 group shadow-sm"
                                        >
                                            <div className="p-3 rounded-full bg-admin-bg group-hover:bg-admin-accent/20 transition-colors">
                                                <UserPlus className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm mt-2">Onboard New Worker</p>
                                        </button>
                                    )}

                                    {isFormOpen && !isFinalized && (
                                        <div className="bg-admin-card p-5 rounded-xl border border-admin-accent shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-admin-border">
                                                <h3 className="font-bold text-admin-text flex items-center gap-2">
                                                    {editingId ? <Edit2 className="w-4 h-4 text-admin-accent" /> : <UserPlus className="w-4 h-4 text-admin-accent" />}
                                                    {editingId ? 'Edit Profile' : 'New Worker'}
                                                </h3>
                                                <button onClick={() => setIsFormOpen(false)} className="text-admin-text-muted hover:text-admin-text"><X className="w-4 h-4" /></button>
                                            </div>
                                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-admin-text-secondary uppercase tracking-wider mb-1.5 block">Full Name</label>
                                                    <input
                                                        autoFocus
                                                        required
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-admin-border bg-admin-bg text-admin-text text-sm focus:border-admin-accent outline-none"
                                                        placeholder="Worker Name"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-admin-text-secondary uppercase tracking-wider mb-1.5 block">Role</label>
                                                        <select
                                                            value={formData.type}
                                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg border border-admin-border bg-admin-bg text-admin-text text-sm focus:border-admin-accent outline-none appearance-none"
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
                                                    <div>
                                                        <label className="text-[10px] font-bold text-admin-text-secondary uppercase tracking-wider mb-1.5 block">Daily Wage (₹)</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={formData.wage}
                                                            onChange={e => setFormData({ ...formData, wage: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg border border-admin-border bg-admin-bg text-admin-text text-sm font-mono focus:border-admin-accent outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-2 flex gap-2">
                                                    <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2 text-xs font-bold bg-admin-bg text-admin-text-secondary rounded-lg border border-admin-border hover:text-admin-text transition-colors">Cancel</button>
                                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2 text-xs font-bold bg-admin-accent text-slate-900 rounded-lg hover:bg-admin-accent-hover transition-colors flex justify-center items-center gap-2">
                                                        {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {editingId ? 'Update' : 'Add to Roster'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {workers.map(w => (
                                            <div key={w.id} className="bg-admin-card p-4 rounded-xl border border-admin-border shadow-sm flex items-center justify-between group">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-admin-text">{w.name}</span>
                                                    <span className="text-[10px] text-admin-text-secondary uppercase tracking-wider">{w.type} • ₹{w.dailyWage}/day</span>
                                                </div>
                                                {!isFinalized && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditForm(w)} className="p-1.5 bg-admin-bg rounded border border-admin-border text-admin-info hover:bg-admin-info/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleDelete(w.id, w.name)} className="p-1.5 bg-admin-bg rounded border border-admin-border text-admin-danger hover:bg-admin-danger/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer (Action Button) */}
                        {activeTab === 'attendance' && workers.length > 0 && !isFinalized && (
                            <div className="p-4 border-t border-admin-border bg-admin-card flex-shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                                <button
                                    onClick={submitAttendance}
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-admin-accent text-slate-900 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-admin-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Daily Attendance
                                </button>
                            </div>
                        )}
                        {isFinalized && activeTab === 'attendance' && (
                             <div className="p-4 border-t border-admin-border bg-admin-bg flex-shrink-0 flex items-center justify-center gap-2 text-admin-text-muted">
                                 <AlertCircle className="w-4 h-4" />
                                 <span className="text-xs font-bold uppercase tracking-widest">Read Only (Finalized)</span>
                             </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default LabourDrawer;
