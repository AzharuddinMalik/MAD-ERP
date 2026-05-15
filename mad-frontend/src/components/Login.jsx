import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Loader2, HardHat, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });

            // Store token and role securely
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user', response.data.username);
            localStorage.setItem('username', response.data.username);

            // Both roles go to dashboard (sidebar handles role-based nav)
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error("Login failed", err);
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md relative z-10">
                {/* Login Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Simplified Header */}
                    <div className="p-8 pb-4 text-center">
                        <div className="w-12 h-12 bg-[#E07A5F]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#E07A5F]/20 shadow-lg shadow-[#E07A5F]/10">
                            <HardHat className="w-6 h-6 text-[#E07A5F]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">MAD-ERP</h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Enterprise Management System</p>
                    </div>

                    {/* Form */}
                    <div className="p-8 pt-4">
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        id="login-username"
                                        className="block w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-all text-sm"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        id="login-password"
                                        className="block w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:border-[#E07A5F] outline-none transition-all text-sm font-mono"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-[#E07A5F] hover:text-[#C9694F] font-semibold transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20 flex items-center gap-2 font-medium">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                id="login-submit"
                                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#E07A5F] hover:bg-[#C9694F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] cursor-pointer"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
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

export default Login;