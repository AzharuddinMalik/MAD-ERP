import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig'; // ✅ Fixed import path
import { useNavigate } from 'react-router-dom';
import { LogOut, HardHat, MapPin, Users, Send, Ruler } from 'lucide-react';

const SupervisorDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Form Inputs
    const [labourCount, setLabourCount] = useState('');
    const [status, setStatus] = useState('');
    const [remark, setRemark] = useState('');
    const [photo1, setPhoto1] = useState(null);
    const [photo2, setPhoto2] = useState(null);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const response = await api.get('/supervisor/my-projects');
            setProjects(response.data);
        } catch (err) {
            console.error("Fetch failed", err);
            setError("Failed to load your projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
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
        if (!labourCount || !selectedProject) return;
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
            alert("Update Submitted Successfully!");
        } catch (err) {
            alert("Failed to submit update.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 font-sans">
            <div className="max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">My Sites</h1>
                        <p className="text-xs text-slate-500">Supervisor Portal</p>
                    </div>
                    <button onClick={handleLogout} className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : projects.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                        <p className="text-slate-500">No projects assigned.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${project.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {project.status}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-1">{project.name}</h3>
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <MapPin className="w-3 h-3 mr-1" /> {project.city?.name}
                                        </div>
                                    </div>
                                    <div className="text-center bg-slate-50 p-2 rounded-lg">
                                        <span className="block text-2xl font-bold text-brand-600">{project.labourCount}</span>
                                        <span className="text-[10px] uppercase text-slate-400 font-bold">Workers</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={() => handleOpenUpdate(project)}
                                        className="bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <HardHat className="w-4 h-4" /> Daily Status
                                    </button>

                                    {/* ✅ NEW: Pass project name in state */}
                                    <button
                                        onClick={() => navigate(`/smart-book/${project.id}`, {
                                            state: {
                                                projectName: project.name,
                                                projectLocation: project.location
                                            }
                                        })}
                                        className="bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Ruler className="w-4 h-4" /> Measure Book
                                    </button>
                                    <button
                                        onClick={() => navigate(`/labour/${project.id}`, {
                                            state: { projectName: project.name }
                                        })}
                                        className="bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Users className="w-4 h-4" /> Team
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl h-auto max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Update Site Status</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                >
                                    <option value="RUNNING">Running</option>
                                    <option value="DELAYED">Delay</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Complete</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Labour Count (Today)</label>
                                <input
                                    type="number"
                                    value={labourCount}
                                    onChange={(e) => setLabourCount(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                                <textarea
                                    rows="3"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Work done today..."
                                ></textarea>
                            </div>

                            {/* Photo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Site Photo 1</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPhoto1(e.target.files[0])}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Site Photo 2</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPhoto2(e.target.files[0])}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setOpenModal(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg font-medium">Cancel</button>
                                <button onClick={submitUpdate} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;