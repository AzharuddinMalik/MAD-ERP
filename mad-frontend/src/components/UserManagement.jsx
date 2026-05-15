import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import {
    Users, Plus, Search, Edit3, Trash2,
    Shield, CheckCircle2, XCircle, X, Loader2, UserCheck, AlertTriangle, KeyRound, UserPlus, ShieldCheck, Mail, Fingerprint, Activity
} from 'lucide-react';
import { useToast } from './ui/Toast';
import Modal, { ModalPrimaryButton, ModalCancelButton } from './ui/Modal';
import PageHeader from './ui/PageHeader';
import { SkeletonTable } from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';
import SearchBar from './ui/SearchBar';

const UserManagement = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'SUPERVISOR',
        isActive: true
    });

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            if (err.name === 'CanceledError') return;
            console.error("Failed to fetch users", err);
            setError("Security Clearance Required: Failed to retrieve personnel manifest.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditMode(true);
            setSelectedUser(user);
            setFormData({
                username: user.username,
                fullName: user.fullName || '',
                password: '',
                role: user.role?.name === 'ROLE_ADMIN' ? 'ADMIN' : 'SUPERVISOR',
                isActive: user.isActive
            });
        } else {
            setIsEditMode(false);
            setSelectedUser(null);
            setFormData({
                username: '',
                fullName: '',
                password: '',
                role: 'SUPERVISOR',
                isActive: true
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                role: `ROLE_${formData.role}`
            };

            if (isEditMode) {
                if (!payload.password) delete payload.password;
                await api.put(`/users/${selectedUser.id}`, payload);
                showToast('success', "Credentials Synchronized", { description: `Access profile for ${payload.fullName} updated.` });
            } else {
                await api.post('/users', payload);
                showToast('success', "Personnel Provisioned", { description: `New clearance granted to ${payload.fullName}.` });
            }

            fetchUsers();
            handleCloseModal();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            showToast('error', "Authentication Error", { description: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (id, name) => {
        if (!window.confirm(`Are you sure you want to revoke access for ${name}?`)) return;
        try {
            await api.delete(`/users/${id}`);
            showToast('info', "Clearance Revoked", { description: `User ${name} has been de-provisioned.` });
            fetchUsers();
        } catch (err) {
            showToast('error', "System Failure", { description: "Could not deactivate personnel record." });
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="space-y-12 max-w-7xl mx-auto px-4 md:px-0 animate-pulse">
            <div className="h-24 bg-admin-bg-tertiary rounded-[2rem]" />
            <SkeletonTable rows={6} cols={4} />
        </div>
    );

    return (
        <div className="font-admin text-admin-text space-y-10 max-w-7xl mx-auto px-4 md:px-0 mb-24 animate-fade-in">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
                <div className="space-y-4">
                    <h1 className="text-editorial-title">Personnel Hub</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-admin-accent animate-pulse" />
                        <p className="text-[10px] font-black text-admin-accent uppercase tracking-[0.4em]">Security Clearance Management</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-premium px-10 py-5 text-sm font-black uppercase tracking-[0.3em] shadow-premium active:scale-95 transition-all"
                >
                    <UserPlus className="w-5 h-5 mr-3" /> Provision Access
                </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Total Personnel', value: users.length, icon: Users, color: 'text-admin-accent' },
                    { label: 'Active Clearance', value: users.filter(u => u.isActive).length, icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'System Admins', value: users.filter(u => u.role?.name === 'ROLE_ADMIN').length, icon: KeyRound, color: 'text-blue-500' },
                    { label: 'Pending Access', value: 0, icon: Activity, color: 'text-admin-text-muted' },
                ].map((stat, i) => (
                    <div key={i} className="bg-admin-bg-secondary p-5 rounded-[2rem] border border-admin-border shadow-sm flex items-center gap-4 group hover:border-admin-accent/30 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl bg-admin-bg-tertiary flex items-center justify-center border border-admin-border group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-admin-text-muted opacity-60 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black tracking-tight leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tactical Control Bar */}
            <div className="bg-admin-bg-secondary p-4 md:p-6 rounded-[2rem] border border-admin-border shadow-soft flex flex-col md:flex-row gap-4 items-center">
                <SearchBar 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    placeholder="Search personnel manifest..."
                    className="flex-1"
                    delay={300}
                />
            </div>

            {/* Manifest Table */}
            <div className="bg-admin-bg-secondary rounded-[2.5rem] border border-admin-border shadow-premium overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-admin-border bg-admin-bg-tertiary/30">
                                <th className="px-8 py-6 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em]">Operator</th>
                                <th className="px-8 py-6 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em]">Clearance Level</th>
                                <th className="px-8 py-6 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.3em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border/40">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="group hover:bg-admin-accent/[0.02] transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-admin-bg-tertiary border border-admin-border rounded-2xl flex items-center justify-center text-admin-accent font-black text-lg shadow-inner-soft group-hover:scale-105 transition-transform duration-300">
                                                {(user.fullName || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-admin-text text-sm tracking-tight leading-none mb-1.5">{user.fullName || 'Unknown Operator'}</p>
                                                <div className="flex items-center gap-2">
                                                    <Fingerprint className="w-3 h-3 text-admin-text-muted" />
                                                    <span className="text-[10px] font-mono text-admin-text-muted opacity-60">ID: {user.username}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-widest ${user.role?.name === 'ROLE_ADMIN'
                                            ? 'bg-admin-accent/10 text-admin-accent border-admin-accent/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {user.role?.name === 'ROLE_ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {user.role?.name?.replace('ROLE_', '') || 'UNASSIGNED'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {user.isActive ? (
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Duty</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2.5 opacity-40">
                                                <span className="w-2.5 h-2.5 rounded-full bg-admin-danger" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-admin-danger">Suspended</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="p-2.5 rounded-xl bg-admin-bg-tertiary border border-admin-border text-admin-text-muted hover:text-admin-accent hover:border-admin-accent/40 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
                                                title="Modify Credentials"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            {user.isActive && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id, user.fullName || user.username)}
                                                    className="p-2.5 rounded-xl bg-admin-bg-tertiary border border-admin-border text-admin-text-muted hover:text-red-500 hover:border-red-500/40 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
                                                    title="Revoke Clearance"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-admin-bg-secondary rounded-[2rem] border border-admin-border p-6 shadow-soft space-y-5">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-admin-bg-tertiary border border-admin-border rounded-2xl flex items-center justify-center text-admin-accent font-black text-lg">
                                    {(user.fullName || 'U').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-admin-text tracking-tight leading-none mb-1.5">{user.fullName || 'Unknown Operator'}</p>
                                    <p className="text-[10px] font-mono text-admin-text-muted opacity-60">ID: {user.username}</p>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg border font-black text-[8px] uppercase tracking-widest ${user.role?.name === 'ROLE_ADMIN'
                                ? 'bg-admin-accent/10 text-admin-accent border-admin-accent/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                                {user.role?.name?.replace('ROLE_', '')}
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-admin-border/40">
                            {user.isActive ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 opacity-40">
                                    <span className="w-2 h-2 rounded-full bg-admin-danger" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-admin-danger">Suspended</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(user)}
                                    className="p-2 rounded-lg bg-admin-bg-tertiary border border-admin-border text-admin-text-muted"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {user.isActive && (
                                    <button
                                        onClick={() => handleDeactivate(user.id, user.fullName || user.username)}
                                        className="p-2 rounded-lg bg-admin-bg-tertiary border border-admin-border text-admin-danger/70"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <EmptyState
                    title="No Personnel Found"
                    description="The search did not return any records from the current manifest."
                    icon={Users}
                />
            )}

            {/* MODAL */}
            <Modal
                isOpen={openModal}
                onClose={handleCloseModal}
                title={isEditMode ? 'Modify Clearance' : 'Provision Personnel'}
                icon={isEditMode ? <UserCheck className="w-6 h-6 text-admin-accent" /> : <Shield className="w-6 h-6 text-admin-accent" />}
                footer={
                    <>
                        <ModalCancelButton onClick={handleCloseModal} />
                        <ModalPrimaryButton
                            form="user-form"
                            loading={isSubmitting}
                        >
                            {isEditMode ? 'Update Credentials' : 'Grant Clearance'}
                        </ModalPrimaryButton>
                    </>
                }
            >
                <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {!isEditMode && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-admin-text tracking-[0.2em] opacity-40 px-1">System Identifier (ID)</label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-4 top-4 w-4 h-4 text-admin-text-muted" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-admin-bg-tertiary border-2 border-transparent rounded-2xl text-sm text-admin-text focus:border-admin-accent outline-none transition-all font-mono shadow-inner-soft"
                                        placeholder="e.g. op_john"
                                    />
                                </div>
                            </div>
                        )}

                        <div className={isEditMode ? 'col-span-2 space-y-2' : 'space-y-2'}>
                            <label className="text-[10px] font-black uppercase text-admin-text tracking-[0.2em] opacity-40 px-1">Legal Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-admin-bg-tertiary border-2 border-transparent rounded-2xl text-sm text-admin-text focus:border-admin-accent outline-none transition-all shadow-inner-soft"
                                placeholder="e.g. Johnathan Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-admin-text tracking-[0.2em] opacity-40 px-1">
                            {isEditMode ? 'Reset Security Key (Optional)' : 'Assigned Security Key'}
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-4 w-4 h-4 text-admin-text-muted" />
                            <input
                                type="password"
                                name="password"
                                required={!isEditMode}
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-5 py-4 bg-admin-bg-tertiary border-2 border-transparent rounded-2xl text-sm text-admin-text focus:border-admin-accent outline-none transition-all font-mono shadow-inner-soft"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-admin-text tracking-[0.2em] opacity-40 px-1">Clearance Tier</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-admin-bg-tertiary border-2 border-transparent rounded-2xl text-sm text-admin-text focus:border-admin-accent outline-none transition-all shadow-inner-soft appearance-none cursor-pointer"
                        >
                            <option value="SUPERVISOR">OPERATOR (Site Logistics)</option>
                            <option value="ADMIN">ADMINISTRATOR (Full Manifest Control)</option>
                        </select>
                    </div>

                    {isEditMode && (
                        <div 
                            className="flex items-center gap-4 p-5 bg-admin-bg-tertiary/50 border border-admin-border rounded-2xl cursor-pointer hover:bg-admin-bg-tertiary transition-colors"
                            onClick={() => handleInputChange({ target: { name: 'isActive', type: 'checkbox', checked: !formData.isActive }})}
                        >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-admin-accent border-admin-accent shadow-premium' : 'border-admin-border'}`}>
                                {formData.isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-admin-text">Active System Status</p>
                                <p className="text-[10px] text-admin-text-muted opacity-60">Enable or revoke platform access immediately.</p>
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;

