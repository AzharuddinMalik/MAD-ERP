import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import ActiveProjects from './components/ActiveProjects';
import CreateProject from './components/CreateProject';
import EnterpriseProjectDetail from "./components/EnterpriseProjectDetail.jsx";
import SmartMeasurementBook from "./components/SmartMeasurementBook.jsx";
import DailyMeasurementsForm from "./components/DailyMeasurementsForm.jsx";
import ClientView from "./components/ClientView.jsx";
import LabourManagement from "./components/LabourManagement.jsx";
import LandingPage from './components/landing/LandingPage';
import UserManagement from './components/UserManagement';
import ProjectAudit from './components/ProjectAudit';
import LeadsManagement from './components/LeadsManagement';
import InventoryDashboard from './components/admin/InventoryDashboard';
import VendorManagement from './components/admin/VendorManagement';
import AuditTrail from './components/admin/AuditTrail';
import FinancialDashboard from './components/admin/FinancialDashboard';
import VendorLedger from './components/admin/VendorLedger';
import ResourceOptimization from './components/admin/ResourceOptimization';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import { TourProvider } from './contexts/TourContext';
import TourTooltip from './components/ui/TourTooltip';

const App = () => {
    return (
        <ToastProvider>
        <TourProvider>
            <Router>
                <Routes>
                    {/* ... routes ... */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/client-view/:token" element={<ClientView />} />
                    <Route path="/demo" element={<EnterpriseProjectDetail />} />

                    <Route element={<AdminLayout />}>
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/supervisor" element={<SupervisorDashboard />} />
                            <Route path="/active-projects" element={<ActiveProjects />} />
                            <Route path="/smart-book/:projectId" element={<SmartMeasurementBook />} />
                            <Route path="/labour/:projectId" element={<LabourManagement />} />
                            <Route path="/project-audit/:projectId" element={<ProjectAudit />} />
                            <Route path="/leads" element={<LeadsManagement />} />
                            <Route path="/inventory" element={<InventoryDashboard />} />
                            <Route path="/vendors" element={<VendorManagement />} />
                            <Route path="/audit-trail" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <AuditTrail />
                                </ProtectedRoute>
                            } />
                            <Route path="/financials" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <FinancialDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/vendor-ledger" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <VendorLedger />
                                </ProtectedRoute>
                            } />
                            <Route path="/resource-optimization" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <ResourceOptimization />
                                </ProtectedRoute>
                            } />

                            <Route path="/create-project" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <CreateProject />
                                </ProtectedRoute>
                            } />
                            <Route path="/users" element={
                                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                                    <UserManagement />
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Route>

                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
            <TourTooltip />
        </TourProvider>
        </ToastProvider>
    );
};

export default App;
