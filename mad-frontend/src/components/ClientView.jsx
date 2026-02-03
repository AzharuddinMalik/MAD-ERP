import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig'; // ✅ Corrected path
import {
    Building2, MapPin, Calendar, CheckCircle2,
    AlertCircle, Loader2, Ruler, User
} from 'lucide-react';

const ClientView = () => {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Decode Token (Simple Base64 for now)
                // Format: base64(projectId:timestamp)
                const decoded = atob(token);
                const [projectId] = decoded.split(':'); // We only need ID

                if (!projectId) throw new Error("Invalid Link");

                // 2. Fetch Public Data (No Auth Header needed if endpoint is public)
                // Note: Ensure axiosConfig doesn't force auth header for this specific route if using interceptors
                // Or just use fetch() to bypass interceptors for public route
                const response = await fetch(`${api.defaults.baseURL}/public/project/${projectId}`);

                if (!response.ok) throw new Error("Failed to load project");

                const jsonData = await response.json();
                setData(jsonData);

            } catch (err) {
                console.error("Link Error", err);
                setError("This link is invalid or has expired.");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50 text-slate-500 p-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-sm text-slate-500">{error}</p>
        </div>
    );

    const { project, boq } = data;

    // Calculate total progress
    const totalScope = boq.reduce((acc, item) => acc + item.totalScope, 0);
    const completedScope = boq.reduce((acc, item) => acc + item.completedScope, 0);
    const overallProgress = totalScope > 0 ? Math.round((completedScope / totalScope) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Brand Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            M
                        </div>
                        <span className="font-bold text-lg text-slate-800 tracking-tight">Malik Art Decor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Status</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Project Hero Card */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                                Project Report
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{project.name}</h1>

                            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>Client: <strong className="text-slate-800">{project.clientName}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{project.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>Started: {project.startDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-[200px] bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                            <span className="text-sm font-medium text-slate-500 mb-1">Overall Completion</span>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-extrabold text-indigo-600">{overallProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${overallProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOQ / Scope of Work */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Ruler className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Work Progress Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boq.map((item) => {
                        const progress = item.totalScope > 0 ? Math.round((item.completedScope / item.totalScope) * 100) : 0;
                        const isComplete = progress >= 100;

                        return (
                            <div key={item.id} className={`bg-white p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-slate-900 leading-tight">{item.itemName}</h3>
                                    {isComplete && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                </div>

                                <div className="flex justify-between text-sm text-slate-600 mb-2 font-medium">
                                    <span>{item.completedScope} / {item.totalScope} {item.unit}</span>
                                    <span className={isComplete ? 'text-emerald-600' : 'text-indigo-600'}>{progress}%</span>
                                </div>

                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center border-t border-slate-200 pt-8 pb-4">
                    <p className="text-xs text-slate-400">
                        Powered by <span className="font-bold text-slate-500">MAD-ERP System</span> • Real-time Site Tracking
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClientView;