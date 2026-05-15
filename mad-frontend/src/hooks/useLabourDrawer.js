import { useState, useEffect, useCallback } from 'react';
import { workerService } from '../services/workerService';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../components/ui/Toast';

export const useLabourDrawer = (projectId) => {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'team'
    
    // Data state
    const [workers, setWorkers] = useState([]);
    const [attendanceState, setAttendanceState] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAttendanceLoggedToday, setHasAttendanceLoggedToday] = useState(false);
    
    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [duplicateWarnings, setDuplicateWarnings] = useState([]);
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Helper', wage: '' });

    const openDrawer = useCallback(() => setIsOpen(true), []);
    const closeDrawer = useCallback(() => {
        setIsOpen(false);
        // Optional: reset states when closed if desired, or keep them to resume where left off
    }, []);

    const fetchTeam = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [workersData, attendanceData] = await Promise.all([
                workerService.getWorkersByProject(projectId).catch(err => {
                    if (err.name !== 'CanceledError') console.error("Worker fetch failed", err);
                    return []; // Safe fallback
                }),
                attendanceService.getProjectAttendance(projectId).catch(err => {
                    if (err.name !== 'CanceledError') console.error("Attendance fetch failed", err);
                    return []; // Safe fallback
                }) 
            ]);
            setWorkers(workersData);

            const today = new Date().toISOString().split('T')[0];
            const loggedToday = attendanceData.some(a => {
                const dateStr = a.date || a.createdAt || '';
                return dateStr.startsWith(today);
            });
            setHasAttendanceLoggedToday(loggedToday);

            const initialAttendance = {};
            workersData.forEach(w => {
                initialAttendance[w.id] = 'PRESENT';
            });
            // Overwrite with actual attendance data if logged today
            if (loggedToday) {
                attendanceData.filter(a => (a.date || a.createdAt || '').startsWith(today)).forEach(a => {
                    initialAttendance[a.labourId] = a.status || 'PRESENT';
                });
            }
            // Only set attendanceState if it's empty to avoid overwriting user edits if they reload the team
            setAttendanceState(prev => {
                if (Object.keys(prev).length === 0 || loggedToday) return initialAttendance;
                // Merge new workers with existing state
                const newState = { ...prev };
                workersData.forEach(w => {
                    if (!newState[w.id]) newState[w.id] = 'PRESENT';
                });
                return newState;
            });
        } catch (err) {
            console.error("Failed to load team in drawer", err);
            showToast('error', "Failed to load project workforce.");
        } finally {
            setLoading(false);
        }
    }, [projectId, showToast]);

    useEffect(() => {
        if (projectId) {
            fetchTeam();
        }
    }, [projectId, fetchTeam]);

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
            await fetchTeam();
        } catch (err) {
            showToast('error', "Operation failed. Check system logs.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from this project?`)) return;
        try {
            await workerService.deleteWorker(id);
            showToast('success', `${name} removed from project.`);
            await fetchTeam();
            
            // Clean up attendance state
            setAttendanceState(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (err) {
            showToast('error', "Failed to remove worker.");
        }
    };

    const openEditForm = (worker) => {
        setEditingId(worker.id);
        setFormData({ name: worker.name, type: worker.type, wage: worker.dailyWage });
        setIsFormOpen(true);
    };

    const toggleAttendance = (id, status) => {
        setAttendanceState(prev => ({ ...prev, [id]: status }));
    };

    const submitAttendance = async () => {
        if (isSubmitting || workers.length === 0) return;
        setIsSubmitting(true);
        const payload = workers.map(w => ({
            labourId: w.id,
            projectId,
            status: attendanceState[w.id] || 'PRESENT'
        }));

        try {
            await attendanceService.markAttendance(payload);
            setHasAttendanceLoggedToday(true);
            showToast('success', "Attendance Saved Successfully!", { description: "Work logs for today have been archived." });
            // Optionally close drawer or switch to read-only view
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data || err.message || "Server Error";
            showToast('error', "Failed to save attendance", { description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate active crew sum for project audit page
    const activeCrewCount = Object.values(attendanceState).filter(s => s === 'PRESENT' || s === 'HALF_DAY').length;
    const activeCrewTotalCount = workers.length;
    
    const activeLabourCost = workers.reduce((acc, w) => {
        const status = attendanceState[w.id];
        if (status === 'PRESENT') return acc + (w.dailyWage || 0);
        if (status === 'HALF_DAY') return acc + ((w.dailyWage || 0) * 0.5);
        return acc;
    }, 0);

    return {
        // Drawer state
        isOpen,
        openDrawer,
        closeDrawer,
        
        // Tab state
        activeTab,
        setActiveTab,

        // Data
        workers,
        attendanceState,
        loading,
        isSubmitting,
        activeCrewCount,
        activeCrewTotalCount,
        hasAttendanceLoggedToday,
        activeLabourCost,

        // Search & Filter
        searchTerm,
        setSearchTerm,
        filteredWorkers: workers.filter(w =>
            w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.type.toLowerCase().includes(searchTerm.toLowerCase())
        ),

        // Form Logic
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

        // Attendance Logic
        toggleAttendance,
        submitAttendance
    };
};
