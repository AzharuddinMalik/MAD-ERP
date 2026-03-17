import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import {
    Users, Plus, Search, Edit, Trash2,
    Shield, CheckCircle2, XCircle, X
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'SUPERVISOR',
        isActive: true
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users. You might not have permission.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditMode(true);
            setSelectedUser(user);
            setFormData({
                username: user.username, // Read-only in edit
                fullName: user.fullName || '',
                password: '', // Don't show hash
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
        try {
            // Map simple role to Full Role Name expected by Backend if needed, 
            // OR Backend Service expects simple name? 
            // Looking at findAllByName -> typically expects "ROLE_ADMIN" or "ROLE_SUPERVISOR"
            // But let's send what the UI has and let Backend handle? 
            // Plan: Send "ROLE_" + role.

            const payload = {
                ...formData,
                role: `ROLE_${formData.role}`
            };

            if (isEditMode) {
                // Remove password if empty (don't update)
                if (!payload.password) delete payload.password;
                await api.put(`/users/${selectedUser.id}`, payload);
            } else {
                await api.post('/users', payload);
            }

            fetchUsers();
            handleCloseModal();
            alert(isEditMode ? "User updated successfully!" : "User created successfully!");
        } catch (err) {
            console.error(err);
            alert("Operation failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to deactivate user.");
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-indigo-600">Loading Users...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                            <Users className="w-8 h-8 text-indigo-600" />
                            User Management
                        </h1>
                        <p className="text-slate-500 mt-1">Create, edit, and manage system access.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>

                {/* Error Banner */}
                {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-bold text-slate-600 text-sm">User Details</th>
                                    <th className="p-4 font-bold text-slate-600 text-sm">Role</th>
                                    <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                                    <th className="p-4 font-bold text-slate-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{user.fullName || 'No Name'}</p>
                                            <p className="text-xs text-slate-500">@{user.username}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.role?.name === 'ROLE_ADMIN'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                {user.role?.name?.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.isActive ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Deactivate"
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
                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No users found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditMode ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. john_doe"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {isEditMode ? 'New Password (Leave blank to keep)' : 'Password'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!isEditMode}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role <span className="text-red-500">*</span></label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            {isEditMode && (
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Account Active</label>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition-colors">
                                    {isEditMode ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
