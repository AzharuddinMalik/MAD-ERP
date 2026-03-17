import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects'; // Import our new hook
import {
    ArrowLeft, Plus, RefreshCw, Search, MapPin,
    MoreVertical, CheckCircle2, AlertCircle, PauseCircle,
    Calendar, Edit, Trash2, ChevronDown, Building2, ClipboardCheck
} from 'lucide-react';
import EditProjectModal from './EditProjectModal'; // 🟢 Import Modal

const ActiveProjects = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // 1. Use the Hook (All data logic is here)
    const {
        projects, cities, supervisors, isLoading, error, // 🟢 Added supervisors
        deleteProject, updateProject, isDeleting, isUpdating // 🟢 Added isUpdating
    } = useProjects();

    // Local UI State (Search & Toggles only)
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCity, setExpandedCity] = useState(null); // Simple toggle
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingProject, setEditingProject] = useState(null); // 🟢 Modal State

    // 2. Derived State: Group Projects by City (Memoized for performance)
    const groupedProjects = useMemo(() => {
        if (!projects) return {};

        // Filter first
        const filtered = projects.filter(p =>
            p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Then Group
        const grouped = filtered.reduce((acc, project) => {
            const cityName = project.city?.name || 'Unassigned';
            if (!acc[cityName]) acc[cityName] = [];
            acc[cityName].push(project);
            return acc;
        }, {});

        // Sort each group by Status Priority
        const statusPriority = { RUNNING: 1, ON_HOLD: 2, DELAYED: 3, COMPLETED: 4 };
        Object.keys(grouped).forEach(city => {
            grouped[city].sort((a, b) => {
                const p1 = statusPriority[a.status] || 99;
                const p2 = statusPriority[b.status] || 99;
                return p1 - p2;
            });
        });

        return grouped;
    }, [projects, searchTerm]);

    // 3. Effect: Handle navigation from Dashboard
    React.useEffect(() => {
        if (location.state?.selectedCity) {
            setExpandedCity(location.state.selectedCity);
            // Optional: clear state so it doesn't persist on refresh/re-nav (optional, but good practice)
            // window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Handlers
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteProject(id);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen text-indigo-600">
            <RefreshCw className="w-10 h-10 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-bold">System Error</h2>
            <p>Could not load projects. Please try again later.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                    <div>
                        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-2 font-medium">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight">Live Operations</h1>
                    </div>
                    <button onClick={() => navigate('/create-project')} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search projects, clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                </div>

                {/* Content Render */}
                <div className="space-y-6">
                    {Object.entries(groupedProjects).map(([city, cityProjects]) => (
                        <div key={city} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* City Header */}
                            <button
                                onClick={() => setExpandedCity(expandedCity === city ? null : city)}
                                className="w-full flex justify-between items-center px-4 py-3 md:px-6 md:py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-bold">{city}</h2>
                                    <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-500 border border-slate-200">
                                        {cityProjects.length}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedCity === city ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Projects Grid (Collapsible) */}
                            {(expandedCity === city || !expandedCity) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:gap-6 md:p-6 bg-white">
                                    {cityProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onDelete={handleDelete}
                                            onEdit={setEditingProject}
                                            activeDropdown={activeDropdown}
                                            setActiveDropdown={setActiveDropdown}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {Object.keys(groupedProjects).length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No projects found matching your search.</p>
                        </div>
                    )}
                </div>

                {/* 🟢 Render the Edit Modal */}
                {editingProject && (
                    <EditProjectModal
                        project={editingProject}
                        cities={cities}
                        supervisors={supervisors}
                        isUpdating={isUpdating}
                        isOpen={!!editingProject}
                        onClose={() => setEditingProject(null)}
                        onUpdate={(updatedData) => {
                            updateProject(updatedData);
                            setEditingProject(null); // Close immediately, let hook handle loading state if needed
                        }}
                    />
                )}
            </div>
        </div>
    );
};
// ✅ FIX: Move ProjectCard Component changes here
const ProjectCard = ({ project, onDelete, onEdit, activeDropdown, setActiveDropdown }) => {
    // 1. ADD THIS LINE inside the sub-component
    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RUNNING': return { style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> };
            case 'COMPLETED': return { style: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle2 className="w-3 h-3" /> };
            case 'DELAYED': return { style: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle className="w-3 h-3" /> };
            case 'ON_HOLD': return { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: <PauseCircle className="w-3 h-3" /> };
            default: return { style: 'bg-slate-100 text-slate-600 border-slate-200', icon: <PauseCircle className="w-3 h-3" /> };
        }
    };

    const statusConfig = getStatusStyle(project.status);

    return (
        <div className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${statusConfig.style}`}>
                    {statusConfig.icon}
                    {project.status}
                </span>

                <div className="relative">
                    <button onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}>
                        <MoreVertical className="w-5 h-5 text-slate-400 hover:text-slate-700" />
                    </button>
                    {activeDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-lg shadow-xl z-10 py-1">

                            {/* ✅ 2. Open Modal instead of Navigate */}
                            <button onClick={() => {
                                // alert("Debug: Edit clicked"); // Removed to check next step
                                onEdit(project);
                                setActiveDropdown(null);
                            }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                <Edit className="w-3 h-3" /> Edit
                            </button>

                            {/* Smart Book Link */}
                            <button
                                onClick={() => navigate(`/smart-book/${project.id}`, { state: { projectName: project.projectName || project.name } })}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-indigo-600 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                Smart Book
                            </button>

                            {/* 🟢 Audit Link */}
                            <button
                                onClick={() => navigate(`/project-audit/${project.id}`)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                            >
                                <ClipboardCheck className="w-3 h-3" /> Audit
                            </button>

                            <button
                                onClick={() => onDelete(project.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{project.projectName || project.name}</h3>
            <p className="text-sm text-slate-500 mb-2 truncate">{project.clientName}</p>

            {/* ✅ 3. ADD LOCATION HERE */}
            {
                project.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                    </div>
                )
            }

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 mt-auto">
                <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Labour</p>
                    <p className="text-xl font-bold text-slate-800">{project.labourCount || 0}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Start Date</p>
                    <div className="flex items-center justify-end gap-1 text-slate-700 font-medium text-sm">
                        <Calendar className="w-3 h-3" />
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ActiveProjects;