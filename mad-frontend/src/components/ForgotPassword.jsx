import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                {/* Header Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 p-8 text-center border-b border-slate-800">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                            <Mail className="w-8 h-8 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        <p className="text-slate-400 text-sm mt-2">
                            Enter your email or username to receive a reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 text-center">
                            <ShieldCheck className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-300 font-medium">
                                This feature is coming soon.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Please contact your administrator to reset your password.
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-semibold transition-all text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-600">
                        © 2026 Malik Art Decor. Authorized Personnel Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
