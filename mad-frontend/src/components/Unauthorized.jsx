import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-lg shadow-red-500/10">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400">
                        You do not have the required security clearance to view this page.
                    </p>
                </div>
                
                <div className="pt-6">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-all border border-slate-700 shadow-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
