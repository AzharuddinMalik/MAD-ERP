import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, Loader2, MapPin, FileCheck, IndianRupee, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import CitySearch from './CitySearch';
import SupervisorSelector from './SupervisorSelector';
import { useToast } from './ui/Toast';
import PageHeader from './ui/PageHeader';

// 🛡️ Moved outside to fix focus stealing (prevents remounting on every render)
const InputField = React.forwardRef(({ label, required, name, validation, onBlur, ...props }, ref) => {
    return (
        <div>
            <label className="block text-sm font-bold text-admin-text-secondary mb-1.5 font-admin">
                {label} {required && <span className="text-admin-danger">*</span>}
            </label>
            <div className="relative">
                <input
                    ref={ref}
                    name={name}
                    {...props}
                    onBlur={onBlur}
                    className={`w-full p-2.5 rounded-lg border bg-admin-card text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none transition text-sm font-admin ${
                        validation?.valid === false ? 'border-red-500/50' : validation?.valid === true ? 'border-emerald-500/50' : 'border-admin-border'
                    }`}
                />
                {validation && (
                    <span className="absolute right-3 top-3">
                        {validation.valid
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <XCircle className="w-4 h-4 text-red-400" />
                        }
                    </span>
                )}
            </div>
            {validation?.valid === false && (
                <p className="text-xs text-red-400 mt-1 font-admin">{validation.msg}</p>
            )}
        </div>
    );
});

const CreateProject = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const firstInputRef = useRef(null);

    // Auto-focus first input on mount
    useEffect(() => {
        firstInputRef.current?.focus();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        clientName: '',
        startDate: '',
        location: '',
        plotNo: '',
        colony: '',
        pincode: '',
        district: '',
        state: '',
        cityId: '',
        projectType: 'G+3',
        squareFeet: '',
        budget: '',
        reraNumber: '',
        fireNocNumber: '',
        supervisorId: '',
        status: 'RUNNING'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePincodeChange = (e) => {
        const pin = e.target.value;
        setFormData(prev => ({ ...prev, pincode: pin }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.cityId) {
            setError("Please select a city.");
            setLoading(false);
            return;
        }

        try {
            await api.post('/projects', formData);
            showToast('success', `Project "${formData.name}" created successfully!`);
            navigate('/active-projects', { replace: true });
        } catch (err) {
            console.error("Create failed", err);
            const msg = err.response?.data?.details || err.response?.data?.message || 'Failed to create project. Ensure all fields are valid.';
            setError(msg);
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const getValidation = (field) => {
        if (!touched[field]) return null;
        const val = formData[field];
        if (field === 'name' && (!val || val.trim().length < 2)) return { valid: false, msg: 'Project name is required (min 2 chars)' };
        if (field === 'clientName' && (!val || val.trim().length < 2)) return { valid: false, msg: 'Client name is required' };
        if (field === 'name' && val.trim().length >= 2) return { valid: true };
        if (field === 'clientName' && val.trim().length >= 2) return { valid: true };
        return null;
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <PageHeader
                title="Create New Project"
                subtitle="Initialize a new site contract with detailed specifications."
                icon={<Building2 className="w-6 h-6 text-admin-accent" />}
                backTo="/active-projects"
                backLabel="Back to Projects"
            />

            {/* Form Card */}
            <div className="bg-admin-card rounded-xl shadow-sm border border-admin-border overflow-hidden">

                <div className="p-6 md:p-8 bg-admin-bg/30">
                    {error && (
                        <div className="mb-6 bg-red-500/10 text-admin-danger p-4 rounded-lg text-sm border border-admin-danger/20 flex items-center gap-2 font-admin">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 font-admin">
                        {/* SECTION 1: BASIC INFO */}
                        <div className="bg-admin-card p-6 rounded-xl border border-admin-border">
                            <h3 className="text-lg font-bold text-admin-text mb-5 flex items-center gap-2 pb-3 border-b border-admin-border">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <InputField
                                        ref={firstInputRef}
                                        label="Project Name"
                                        required
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Skyline Tower Renovation"
                                        value={formData.name}
                                        onChange={handleChange}
                                        validation={getValidation('name')}
                                        onBlur={() => handleBlur('name')}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <InputField
                                        label="Start Date"
                                        required
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        validation={getValidation('startDate')}
                                        onBlur={() => handleBlur('startDate')}
                                    />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3">
                                    <InputField
                                        label="Client Name"
                                        required
                                        type="text"
                                        name="clientName"
                                        placeholder="e.g. Metropolis Group"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        validation={getValidation('clientName')}
                                        onBlur={() => handleBlur('clientName')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: LOCATION */}
                        <div className="bg-admin-card p-6 rounded-xl border border-admin-border">
                            <h3 className="text-lg font-bold text-admin-text mb-5 flex items-center gap-2 pb-3 border-b border-admin-border">
                                <MapPin className="w-5 h-5 text-admin-accent" /> Location Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <InputField
                                        label="Plot No / Flat No"
                                        type="text"
                                        name="plotNo"
                                        placeholder="e.g. 405/A"
                                        value={formData.plotNo}
                                        onChange={handleChange}
                                        validation={getValidation('plotNo')}
                                        onBlur={() => handleBlur('plotNo')}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Street / Colony"
                                        type="text"
                                        name="colony"
                                        placeholder="e.g. Green Valley, Main Road"
                                        value={formData.colony}
                                        onChange={handleChange}
                                        validation={getValidation('colony')}
                                        onBlur={() => handleBlur('colony')}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <InputField
                                        label="Landmark / Specific Location"
                                        required
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Near City Center Mall"
                                        value={formData.location}
                                        onChange={handleChange}
                                        validation={getValidation('location')}
                                        onBlur={() => handleBlur('location')}
                                    />
                                </div>

                                <div className="md:col-span-3 lg:col-span-1">
                                    <label className="block text-sm font-bold text-admin-text-secondary mb-1.5 font-admin">
                                        City <span className="text-admin-danger">*</span>
                                    </label>
                                    <CitySearch
                                        selectedCityId={formData.cityId}
                                        onSelect={(city) => {
                                            if (city) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    cityId: city.id,
                                                    state: city.state || prev.state
                                                }));
                                            } else {
                                                setFormData(prev => ({ ...prev, cityId: '' }));
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputField
                                        label="State"
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                        readOnly
                                        className="w-full p-2.5 rounded-lg border border-admin-border bg-admin-hover text-admin-text-secondary outline-none text-sm font-admin"
                                    />
                                </div>

                                <div>
                                    <InputField
                                        label="Pincode"
                                        type="text"
                                        name="pincode"
                                        maxLength="6"
                                        placeholder="e.g. 110001"
                                        value={formData.pincode}
                                        onChange={handlePincodeChange}
                                        validation={getValidation('pincode')}
                                        onBlur={() => handleBlur('pincode')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: SPECIFICATIONS */}
                        <div className="bg-admin-card p-6 rounded-xl border border-admin-border">
                            <h3 className="text-lg font-bold text-admin-text mb-5 flex items-center gap-2 pb-3 border-b border-admin-border">
                                <FileCheck className="w-5 h-5 text-admin-info" /> Project Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-admin-text-secondary mb-1.5 font-admin">Project Type</label>
                                    <select
                                        name="projectType"
                                        className="w-full p-2.5 rounded-lg border border-admin-border bg-admin-card text-admin-text focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none text-sm font-admin"
                                        value={formData.projectType}
                                        onChange={handleChange}
                                    >
                                        <option value="G+1">G+1 Residential</option>
                                        <option value="G+2">G+2 Residential</option>
                                        <option value="G+3">G+3 Residential</option>
                                        <option value="Commercial">Commercial Complex</option>
                                        <option value="Industrial">Industrial Shed</option>
                                        <option value="Villa">Villa / Bungalow</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <InputField
                                        label="Total Area (Sq. Ft)"
                                        type="number"
                                        name="squareFeet"
                                        placeholder="e.g. 2500"
                                        value={formData.squareFeet}
                                        onChange={handleChange}
                                        validation={getValidation('squareFeet')}
                                        onBlur={() => handleBlur('squareFeet')}
                                    />
                                    <div>
                                        <label className="block text-sm font-bold text-admin-text-secondary mb-1.5 font-admin">Estimated Budget</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IndianRupee className="h-4 w-4 text-admin-text-muted" />
                                            </div>
                                            <input
                                                type="number"
                                                name="budget"
                                                className="w-full pl-9 p-2.5 rounded-lg border border-admin-border bg-admin-card text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none text-sm font-mono"
                                                placeholder="5000000"
                                                value={formData.budget}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('budget')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <InputField
                                    label="RERA Number"
                                    type="text"
                                    name="reraNumber"
                                    placeholder="If applicable"
                                    value={formData.reraNumber}
                                    onChange={handleChange}
                                    validation={getValidation('reraNumber')}
                                    onBlur={() => handleBlur('reraNumber')}
                                />
                                <InputField
                                    label="Fire NOC Number"
                                    type="text"
                                    name="fireNocNumber"
                                    placeholder="If applicable"
                                    value={formData.fireNocNumber}
                                    onChange={handleChange}
                                    validation={getValidation('fireNocNumber')}
                                    onBlur={() => handleBlur('fireNocNumber')}
                                />
                            </div>
                        </div>

                        {/* SECTION 4: TEAM */}
                        <div className="bg-admin-card-hover p-6 rounded-xl border border-admin-border">
                            <SupervisorSelector
                                selectedSupervisorId={formData.supervisorId}
                                onSelect={(id) => setFormData(prev => ({ ...prev, supervisorId: id }))}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto flex justify-center items-center gap-2 py-3 px-8 border border-transparent rounded-lg shadow-lg shadow-amber-500/20 text-sm font-bold text-white bg-admin-accent hover:bg-admin-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent focus:ring-offset-admin-bg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {loading ? 'Creating Project...' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;