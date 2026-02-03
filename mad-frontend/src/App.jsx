import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
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
import ProjectAudit from './components/ProjectAudit'; // 🟢 Import Audit Component

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* Public Route: Login */}
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/active-projects" element={<ActiveProjects />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/users" element={<UserManagement />} />

                {/* Supervisor Routes */}
                <Route path="/supervisor" element={<SupervisorDashboard />} />

                {/* Fallback: Redirect unknown URLs to Login */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

                <Route path="/demo" element={<EnterpriseProjectDetail />} />

                {/* Shared / Dynamic Routes */}
                {/* ✅ DYNAMIC ROUTE FOR MEASUREMENT BOOK */}
                <Route path="/smart-book/:projectId" element={<SmartMeasurementBook />} />
                {/*<Route path="/client-view" element={<ClientView />} />*/}
                {/* ✅ PUBLIC CLIENT VIEW (No Login Required) */}
                <Route path="/client-view/:token" element={<ClientView />} />

                {/* <Route path="/projects/edit/:id" element={<EditProject />} /> */}
                <Route path="/labour/:projectId" element={<LabourManagement />} />
                <Route path="/project-audit/:projectId" element={<ProjectAudit />} />

            </Routes>
        </Router>
    );
};

export default App;
