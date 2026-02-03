import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, User, Calendar, HardHat, AlertCircle, CheckCircle2 } from 'lucide-react';

const EditProjectModal = ({ project, cities, supervisors, onClose, onUpdate, isUpdating }) => {
    const [formData, setFormData] = useState({
        name: '',
        clientName: '',
        location: '',
        cityId: '',
        supervisorId: '',
        startDate: '',
        status: ''
    });

    useEffect(() => {
        alert("Debug: Modal Mounted for " + (project.name || project.projectName)); // 🟢 DEBUG: Verify Mount
        console.log("EditProjectModal Mounted", project);
        if (project) {
            setFormData({
                name: project.name || project.projectName || '',
                clientName: project.clientName || '',
                location: project.location || '',
                cityId: project.city ? project.city.id : '',
                supervisorId: project.supervisor ? project.supervisor.id : '',
                startDate: project.startDate || '',
                status: project.status || 'RUNNING'
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prepare payload
        const payload = {
            name: formData.name,
            clientName: formData.clientName,
            location: formData.location,
            cityId: formData.cityId ? Number(formData.cityId) : null,
            supervisorId: formData.supervisorId ? Number(formData.supervisorId) : null,
            startDate: formData.startDate,
            status: formData.status
        };
        onUpdate({ id: project.id, data: payload });
        onClose();
    };

    if (!project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Edit Project: <span className="text-indigo-600">{project.projectName || project.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Status Select */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Project Status</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['RUNNING', 'ON_HOLD', 'DELAYED', 'COMPLETED'].map(status => (
                                <label key={status} className={`
                                    cursor-pointer border rounded-lg p-3 text-center text-xs font-bold transition-all
                                    ${formData.status === status
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                `}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        checked={formData.status === status}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    {status}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        {/* Client */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Client Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    name="clientName"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                            <select
                                name="cityId"
                                value={formData.cityId}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Supervisor & Start Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Supervisor</label>
                            <div className="relative">
                                <HardHat className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select
                                    name="supervisorId"
                                    value={formData.supervisorId}
                                    onChange={handleChange}
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="">No Supervisor Assigned</option>
                                    {supervisors.map(s => (
                                        <option key={s.id} value={s.id}>{s.username} {s.fullName ? `(${s.fullName})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? <span className="animate-spin">⌛</span> : <Save className="w-4 h-4" />}
                            Update Project
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;
