import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import {
    Plus, RefreshCw, Search, MapPin, MoreVertical, CheckCircle2, AlertCircle, PauseCircle,
    Calendar, Edit, Trash2, ChevronDown, Building2, ClipboardCheck,
    BookOpen, LayoutDashboard, History, Filter, ArrowRight, LayoutGrid, List
} from 'lucide-react';
import EditProjectModal from './EditProjectModal';
import PageHeader from './ui/PageHeader';
import { useToast } from './ui/Toast';
import { SkeletonTable } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';
import Modal, { ModalCancelButton, ModalPrimaryButton } from './ui/Modal';

const ActiveProjects = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const {
        projects, cities, supervisors, isLoading, error,
        deleteProject, updateProject, isDeleting, isUpdating
    } = useProjects();

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCity, setExpandedCity] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isGrouped, setIsGrouped] = useState(false); // Default to flat list as per user request
    const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'status'
    
    const { showToast } = useToast();
    const userRole = localStorage.getItem('role') || 'ROLE_SUPERVISOR';
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    const processedProjects = useMemo(() => {
        if (!projects) return isGrouped ? {} : [];
        
        // 1. Filter
        const filtered = projects.filter(p =>
            (p.projectName || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Sort
        const statusPriority = { RUNNING: 1, DELAYED: 2, ON_HOLD: 3, COMPLETED: 4, INVOICED: 5 };
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'name') {
                return (a.name || a.projectName || '').localeCompare(b.name || b.projectName || '');
            }
            if (sortBy === 'status') {
                const p1 = statusPriority[a.status] || 99;
                const p2 = statusPriority[b.status] || 99;
                return p1 - p2;
            }
            // Default: Date newest first
            const dateA = new Date(a.startDate || a.createdAt || 0).getTime();
            const dateB = new Date(b.startDate || b.createdAt || 0).getTime();
            // Handle invalid dates falling back to 0
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        // 3. Group (if enabled)
        if (isGrouped) {
            return sorted.reduce((acc, project) => {
                const cityName = project.city?.name || 'Unassigned';
                if (!acc[cityName]) acc[cityName] = [];
                acc[cityName].push(project);
                return acc;
            }, {});
        }

        return sorted;
    }, [projects, searchTerm, isGrouped, sortBy]);

    React.useEffect(() => {
        if (location.state?.selectedCity) {
            setExpandedCity(location.state.selectedCity);
        }
    }, [location.state]);

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProject(projectToDelete.id);
            showToast('success', `Project "${projectToDelete.name || projectToDelete.projectName}" archived successfully.`);
            setProjectToDelete(null);
        } catch (err) {
            showToast('error', "Failed to delete project.");
        }
    };

    if (isLoading) return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
            <div className="flex justify-between items-end mb-8">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-admin-border animate-pulse rounded-lg" />
                    <div className="h-4 w-64 bg-admin-border/50 animate-pulse rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-admin-card rounded-2xl border border-admin-border animate-pulse p-6 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-6 w-20 bg-admin-border rounded-full" />
                            <div className="h-6 w-6 bg-admin-border rounded-lg" />
                        </div>
                        <div className="h-8 w-40 bg-admin-border rounded-lg" />
                        <div className="h-4 w-56 bg-admin-border opacity-50 rounded-lg" />
                        <div className="pt-4 border-t border-admin-border flex justify-between">
                            <div className="h-10 w-20 bg-admin-border rounded-lg" />
                            <div className="h-10 w-20 bg-admin-border rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-full text-admin-danger font-admin">
            <AlertCircle className="w-14 h-14 mb-4 opacity-80" />
            <h2 className="text-xl font-bold mb-2 text-admin-text">System Error</h2>
            <p className="text-admin-text-secondary">Could not load projects. Please try again later.</p>
        </div>
    );
    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 mb-20 relative">
            <PageHeader
                title="Live Operations"
                subtitle="Monitor and manage active construction sites."
                icon={<LayoutDashboard className="w-6 h-6 text-admin-accent" />}
                backTo="/dashboard"
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                searchPlaceholder="Search projects..."
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 bg-admin-card p-1 rounded-xl border border-admin-border shadow-sm w-full">
                            {/* Sort Controls */}
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-xs font-bold text-admin-text-secondary outline-none px-2 cursor-pointer hover:text-admin-accent transition-colors"
                            >
                                <option value="date" className="bg-admin-card">Newest First</option>
                                <option value="name" className="bg-admin-card">A - Z</option>
                                <option value="status" className="bg-admin-card">Priority Status</option>
                            </select>

                            <div className="w-px h-6 bg-admin-border"></div>
                            
                            {/* Grouping Toggle */}
                            <button 
                                onClick={() => setIsGrouped(!isGrouped)}
                                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isGrouped ? 'bg-admin-accent/10 text-admin-accent shadow-inner' : 'text-admin-text-muted hover:text-admin-accent'}`}
                                title={isGrouped ? "Show Flat List" : "Group by City"}
                            >
                                {isGrouped ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                {isGrouped ? "City Grouped" : "Flat View"}
                            </button>
                        </div>
                        {isAdmin && (
                            <Button
                                onClick={() => navigate('/create-project')}
                                icon={Plus}
                                size="sm"
                                className="hidden md:flex whitespace-nowrap"
                            >
                                <span>Add Site</span>
                            </Button>
                        )}
                    </div>
                }
            />



            {/* Content Render */}
            <div className="space-y-6">
                {isGrouped ? (
                    Object.entries(processedProjects).map(([city, cityProjects]) => (
                        <div key={city} className="bg-admin-card rounded-xl border border-admin-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* City Header */}
                            <button
                                onClick={() => setExpandedCity(expandedCity === city ? null : city)}
                                className="w-full flex justify-between items-center px-4 py-3 md:px-6 md:py-4 hover:bg-admin-hover transition-colors cursor-pointer border-b border-admin-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-admin-accent-soft rounded-lg">
                                        <MapPin className="w-5 h-5 text-admin-accent" />
                                    </div>
                                    <h2 className="text-lg font-admin font-bold text-admin-text">{city}</h2>
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-admin font-bold uppercase tracking-wider border border-admin-border bg-admin-bg text-admin-text-secondary">
                                        {cityProjects.length} Sites
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-admin-text-muted transition-transform ${expandedCity === city ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Projects Grid */}
                            {(expandedCity === city || !expandedCity) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:gap-6 md:p-6 bg-admin-bg/50">
                                    {cityProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            isAdmin={isAdmin}
                                            onDelete={() => setProjectToDelete(project)}
                                            onEdit={setEditingProject}
                                            activeDropdown={activeDropdown}
                                            setActiveDropdown={setActiveDropdown}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {processedProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isAdmin={isAdmin}
                                onDelete={() => setProjectToDelete(project)}
                                onEdit={setEditingProject}
                                activeDropdown={activeDropdown}
                                setActiveDropdown={setActiveDropdown}
                            />
                        ))}
                    </div>
                )}

                {((isGrouped && Object.keys(processedProjects).length === 0) || (!isGrouped && processedProjects.length === 0)) && (
                    <EmptyState 
                        title="No operations found"
                        description={searchTerm ? `No projects match "${searchTerm}". Try a different name or client.` : "You don't have any active projects yet."}
                        icon={Building2}
                        actionLabel={isAdmin ? "Add New Site" : null}
                        onAction={isAdmin ? () => navigate('/create-project') : null}
                    />
                )}
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    cities={cities}
                    supervisors={supervisors}
                    isUpdating={isUpdating}
                    isOpen={!!editingProject}
                    onClose={() => setEditingProject(null)}
                    onUpdate={async (updatedData) => {
                        try {
                            await updateProject(updatedData);
                            showToast('success', 'Project updated successfully');
                            setEditingProject(null);
                        } catch (err) {
                            showToast('error', 'Failed to update project');
                        }
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                title="Archive Operation"
                icon={<Trash2 className="w-5 h-5 text-admin-danger" />}
                footer={
                    <>
                        <ModalCancelButton onClick={() => setProjectToDelete(null)}>Not Now</ModalCancelButton>
                        <ModalPrimaryButton
                            onClick={confirmDelete}
                            loading={isDeleting}
                            danger
                        >
                            Yes, Archive Project
                        </ModalPrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-admin-text-secondary text-sm leading-relaxed">
                        You are about to archive <span className="text-admin-text font-bold">"{projectToDelete?.projectName || projectToDelete?.name}"</span>. 
                    </p>
                    <div className="p-4 bg-admin-danger/10 border border-admin-danger/20 rounded-xl">
                        <p className="text-xs text-admin-danger font-medium leading-relaxed">
                            <span className="font-bold flex items-center gap-1.5 mb-1"><AlertCircle className="w-3.5 h-3.5" /> Warning</span>
                            This action will remove the project from active operations. Historical data (Labour logs, Measurements) will be preserved in audits but the site will no longer appear in daily management.
                        </p>
                    </div>
                    <p className="text-xs text-admin-text-muted italic">Are you sure you want to proceed?</p>
                </div>
            </Modal>
        </div>
    );
};

const ProjectCard = ({ project, isAdmin, onDelete, onEdit, activeDropdown, setActiveDropdown }) => {
    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RUNNING': return { 
                style: 'bg-green-500/10 text-admin-success border-admin-success/20', 
                icon: <CheckCircle2 className="w-3 h-3 animate-pulse" />,
                glow: 'hover:shadow-green-500/10 hover:border-admin-success/40'
            };
            case 'COMPLETED': return { 
                style: 'bg-blue-500/10 text-admin-info border-admin-info/20', 
                icon: <CheckCircle2 className="w-3 h-3" />,
                glow: 'hover:shadow-blue-500/10 hover:border-admin-info/40'
            };
            case 'DELAYED': return { 
                style: 'bg-red-500/10 text-admin-danger border-admin-danger/20', 
                icon: <AlertCircle className="w-3 h-3 animate-bounce" />,
                glow: 'shadow-lg shadow-red-500/10 border-admin-danger/30' // Permanent glow for delayed
            };
            case 'ON_HOLD': return { 
                style: 'bg-amber-500/10 text-admin-accent border-admin-accent/20', 
                icon: <PauseCircle className="w-3 h-3" />,
                glow: 'hover:shadow-amber-500/10 hover:border-admin-accent/40'
            };
            default: return { 
                style: 'bg-slate-500/10 text-admin-text-muted border-admin-border', 
                icon: <PauseCircle className="w-3 h-3" />,
                glow: ''
            };
        }
    };

    const statusConfig = getStatusStyle(project.status);

    return (
        <div className={`group relative bg-admin-card rounded-xl border border-admin-border p-5 transition-all duration-300 flex flex-col h-full font-admin ${statusConfig.glow}`}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusConfig.style}`}>
                    {statusConfig.icon}
                    {project.status}
                </span>

                <div className="relative">
                    <button 
                        onClick={() => setActiveDropdown(activeDropdown === project.id ? null : project.id)}
                        className="p-1 rounded hover:bg-admin-hover cursor-pointer"
                    >
                        <MoreVertical className="w-5 h-5 text-admin-text-muted hover:text-admin-text" />
                    </button>
                    {activeDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-admin-card border border-admin-border rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                            {isAdmin && (
                                <button onClick={() => { onEdit(project); setActiveDropdown(null); }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-admin-hover flex items-center gap-2 text-admin-text font-medium cursor-pointer">
                                    <Edit className="w-3.5 h-3.5 text-admin-text-muted" /> Edit
                                </button>
                            )}
                            <button onClick={() => navigate(`/smart-book/${project.id}`, { state: { projectName: project.projectName || project.name } })}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-admin-hover flex items-center gap-2 text-admin-accent font-medium cursor-pointer">
                                <BookOpen className="w-3.5 h-3.5" /> Smart Book
                            </button>
                            <button onClick={() => navigate(`/project-audit/${project.id}`)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-admin-hover flex items-center gap-2 text-admin-info font-medium cursor-pointer">
                                <ClipboardCheck className="w-3.5 h-3.5" /> Audit
                            </button>
                            {isAdmin && (
                                <>
                                    <div className="h-px bg-admin-border my-1"></div>
                                    <button onClick={() => { onDelete(project); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2 text-sm text-admin-danger hover:bg-admin-danger/10 flex items-center gap-2 font-medium cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold text-admin-text leading-tight mb-1 group-hover:text-admin-accent transition-colors">
                {project.projectName || project.name}
            </h3>
            <p className="text-sm text-admin-text-secondary mb-3 truncate">{project.clientName}</p>

            {project.location && (
                <div className="flex items-center gap-1.5 text-xs text-admin-text-muted mb-5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-admin-border pt-4 mt-auto">
                <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-admin-text-muted font-bold">Workforce Load</p>
                    <div className="flex items-end gap-2">
                        <p className="text-xl font-bold text-admin-text leading-none font-mono">
                            {project.labourCount || 0}
                        </p>
                        <span className="text-[10px] text-admin-text-muted font-normal lowercase mb-0.5">workers</span>
                    </div>
                    {/* Visual Load Indicator */}
                    <div className="w-full h-1 bg-admin-border rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${
                                project.labourCount > 10 ? 'bg-admin-danger animate-pulse' : 
                                project.labourCount > 5 ? 'bg-admin-accent' : 'bg-admin-success'
                            }`}
                            style={{ width: `${Math.min((project.labourCount / 15) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/smart-book/${project.id}`, { state: { projectName: project.projectName || project.name } }); }}
                        className="p-2 bg-admin-accent/10 text-admin-accent rounded-lg border border-admin-accent/20 hover:bg-admin-accent hover:text-white transition-all cursor-pointer group"
                    >
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveProjects;