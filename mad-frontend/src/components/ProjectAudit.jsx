import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
    AlertTriangle, CheckCircle, Users, FileText,
    ArrowLeft, Phone, MapPin, Hammer, ArrowRight
} from 'lucide-react';

const ProjectAudit = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAuditData = async () => {
            try {
                // Fetch basic data needed for the audit
                const [projRes, labourRes, boqRes] = await Promise.all([
                    api.get(`/admin/projects/${projectId}`),
                    api.get(`/labour/project/${projectId}`),
                    api.get(`/measurements/project/${projectId}`)
                ]);

                setProject(projRes.data);
                setWorkers(labourRes.data);

                // Generate Alerts locally
                const newAlerts = [];

                // 1. Check BOQ Overruns
                const boqItems = boqRes.data;
                const overrunItems = boqItems.filter(item => item.completedScope > item.totalScope);
                if (overrunItems.length > 0) {
                    newAlerts.push({
                        type: 'critical',
                        title: 'Scope Overrun Detected',
                        message: `${overrunItems.length} items have measurements exceeding the budget. Please verify before billing.`
                    });
                }

                // 2. Check Labour Count vs Active Workers
                if (projRes.data.labourCount === 0 && labourRes.data.length > 0) {
                    newAlerts.push({
                        type: 'warning',
                        title: 'No Daily Labour Count',
                        message: "Today's labour count is 0, but you have active workers assigned."
                    });
                }

                setAlerts(newAlerts);

            } catch (err) {
                console.error("Audit load failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditData();
    }, [projectId]);

    if (loading) return <div className="p-10 text-center flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;
    if (!project) return <div className="p-10 text-center text-red-500">Project Not Found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            Project Audit <span className="text-slate-400 text-lg font-normal">| {project.name}</span>
                        </h1>
                    </div>
                    <div>
                        {alerts.length === 0 ? (
                            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Ready for Billing
                            </span>
                        ) : (
                            <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Attention Needed
                            </span>
                        )}
                    </div>
                </div>

                {/* Section 1: Critical Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <AlertTriangle className="text-red-500" /> Critical Issues
                        </h2>
                        <div className="space-y-4">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${alert.type === 'critical' ? 'border-red-500' : 'border-amber-500'}`}>
                                    <h3 className={`font-bold ${alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {alert.title}
                                    </h3>
                                    <p className="text-slate-600 mt-1">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 2: On-Site Team Details */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Users className="text-indigo-600" /> On-Site Team
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workers.map(worker => (
                            <div key={worker.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                    {worker.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{worker.name}</h4>
                                    <p className="text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">
                                        {worker.type}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {worker.phone || 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Hammer className="w-3 h-3" /> ₹{worker.dailyWage}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {workers.length === 0 && (
                            <div className="col-span-full p-6 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                No workers assigned to this project yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 mt-12 pt-6 border-t border-slate-200">
                    <button onClick={() => navigate(`/labour/${projectId}`)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Manage Team
                    </button>
                    <button
                        onClick={() => alert("Proceeding to Invoice Generator...")}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                        Proceed to Billing <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectAudit;