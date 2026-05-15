import React, { useState, useEffect, memo } from 'react';
import { X, Save, Building2, MapPin, User, Calendar, HardHat, RefreshCw, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';

/**
 * 🔒 Reusable Input Field - Industrial Elegance Edition
 */
const InputField = memo(({ label, icon: Icon, ...props }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">
            {label}
        </label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-4 top-3.5 w-4 h-4 text-admin-text-muted group-focus-within:text-admin-accent transition-colors" />}
            <input
                {...props}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-xl border border-admin-border bg-admin-bg-secondary text-admin-text placeholder:text-admin-text-muted/40 focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/5 outline-none transition-all text-sm font-admin font-medium shadow-inner`}
            />
        </div>
    </div>
));

InputField.displayName = 'InputField';

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
        if (project) {
            setFormData({
                name: project.name || project.projectName || '',
                clientName: project.clientName || '',
                location: project.location || '',
                cityId: project.city ? String(project.city.id) : '',
                supervisorId: project.supervisor ? String(project.supervisor.id) : '',
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
    };

    if (!project) return null;

    return (
        <Modal
            isOpen={!!project}
            onClose={onClose}
            title="Modify Project"
            icon={<Building2 className="w-6 h-6 text-admin-accent" />}
            footer={
                <div className="flex justify-between items-center w-full">
                    <ModalCancelButton onClick={onClose}>
                        Abandon Changes
                    </ModalCancelButton>
                    <ModalPrimaryButton
                        type="submit"
                        form="edit-project-form"
                        loading={isUpdating}
                        icon={Save}
                        className="min-w-[180px]"
                    >
                        {isUpdating ? 'Synchronizing...' : 'Commit Updates'}
                    </ModalPrimaryButton>
                </div>
            }
        >
            <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
                {/* Status Select - Industrial Toggle */}
                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">
                        Operational Status
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-admin-bg-tertiary rounded-xl border border-admin-border shadow-inner">
                        {['RUNNING', 'ON_HOLD', 'DELAYED', 'COMPLETED'].map(status => (
                            <label key={status} className={`
                                cursor-pointer rounded-lg py-2.5 text-center transition-all border
                                ${formData.status === status
                                    ? 'bg-admin-accent text-white border-admin-accent font-black shadow-lg shadow-admin-accent/20'
                                    : 'bg-transparent border-transparent text-admin-text-muted hover:text-admin-text font-bold'}
                            `}>
                                <input
                                    type="radio"
                                    name="status"
                                    value={status}
                                    checked={formData.status === status}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className="text-[9px] uppercase tracking-widest">
                                    {status.replace('_', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Project Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Client / Principal"
                            icon={User}
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Site Location"
                            icon={MapPin}
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Target Zone (City)</label>
                            <select
                                name="cityId"
                                value={formData.cityId}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-admin-border bg-admin-bg-secondary text-admin-text focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/5 outline-none text-sm transition-all font-admin font-medium appearance-none shadow-inner"
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Structural Supervisor</label>
                            <div className="relative group">
                                <HardHat className="absolute left-4 top-3.5 w-4 h-4 text-admin-text-muted group-focus-within:text-admin-accent transition-colors" />
                                <select
                                    name="supervisorId"
                                    value={formData.supervisorId}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-admin-border bg-admin-bg-secondary text-admin-text focus:border-admin-accent/50 focus:ring-4 focus:ring-admin-accent/5 outline-none text-sm transition-all font-admin font-medium appearance-none shadow-inner"
                                >
                                    <option value="">Unassigned</option>
                                    {supervisors.map(s => (
                                        <option key={s.id} value={s.id}>{s.username} {s.fullName ? `(${s.fullName})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <InputField
                            label="Chronological Initiation"
                            icon={Calendar}
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EditProjectModal;
