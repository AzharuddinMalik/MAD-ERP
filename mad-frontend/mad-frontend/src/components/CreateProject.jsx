import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Save, Loader2, MapPin, FileCheck, IndianRupee, AlertCircle, XCircle } from 'lucide-react';
import CitySearch from './CitySearch';
import SupervisorSelector from './SupervisorSelector';

const CreateProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        clientName: '',
        startDate: '',
        // Address
        location: '', // Street Address / Landmark
        plotNo: '',
        colony: '',
        pincode: '',
        district: '',
        state: '',
        cityId: '',
        // Specs
        projectType: 'G+3',
        squareFeet: '',
        budget: '',
        // Compliance
        reraNumber: '',
        fireNocNumber: '',
        // Team
        supervisorId: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-fill District/State based on Pincode (Mock)
    const handlePincodeChange = (e) => {
        const pin = e.target.value;
        setFormData(prev => ({ ...prev, pincode: pin }));

        if (pin.length === 6) {
            // In a real app, use an API like postalpincode.in
            // For now, mock it or leave it for manual entry if unknown
            // Let's just suggest if it matches some common ones or do nothing
        }
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
            await api.post('/admin/create-project', formData);
            alert("Project Created Successfully!");
            navigate('/dashboard');
        } catch (err) {
            console.error("Create failed", err);
            setError("Failed to create project. Ensure all fields are valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-white p-6 border-b border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="text-indigo-600" />
                            Create New Project
                        </h2>
                        <p className="text-slate-500 mt-1">Initialize a new site contract with detailed specifications.</p>
                    </div>

                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* SECTION 1: BASIC INFO */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Project Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Skyline Tower Renovation"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="clientName"
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Metropolis Group"
                                            value={formData.clientName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: LOCATION */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <MapPin className="w-5 h-5 text-indigo-500" /> Location Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Plot No / Flat No</label>
                                        <input
                                            type="text"
                                            name="plotNo"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. 405/A"
                                            value={formData.plotNo}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Street / Colony</label>
                                        <input
                                            type="text"
                                            name="colony"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Green Valley, Main Road"
                                            value={formData.colony}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Landmark / Specific Location <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="location"
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Near City Center Mall"
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            maxLength="6"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. 110001"
                                            value={formData.pincode}
                                            onChange={handlePincodeChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: SPECIFICATIONS */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <FileCheck className="w-5 h-5 text-indigo-500" /> Project Specifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Project Type</label>
                                        <select
                                            name="projectType"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Total Area (Sq. Ft)</label>
                                        <input
                                            type="number"
                                            name="squareFeet"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. 2500"
                                            value={formData.squareFeet}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Estimated Budget (INR)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IndianRupee className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="budget"
                                                className="w-full pl-9 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. 5000000"
                                                value={formData.budget}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: COMPLIANCE */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    Compliance & Permits
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">RERA Number</label>
                                        <input
                                            type="text"
                                            name="reraNumber"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="If applicable"
                                            value={formData.reraNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Fire NOC Number</label>
                                        <input
                                            type="text"
                                            name="fireNocNumber"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="If applicable"
                                            value={formData.fireNocNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 5: TEAM */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <SupervisorSelector
                                    selectedSupervisorId={formData.supervisorId}
                                    onSelect={(id) => setFormData(prev => ({ ...prev, supervisorId: id }))}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto flex justify-center items-center gap-2 py-3 px-8 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                    {loading ? 'Creating Project...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;