import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Extract your sidebar here

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64 p-8"> {/* ml-64 matches sidebar width */}
                <Outlet /> {/* This is where Dashboard/ActiveProjects renders */}
            </div>
        </div>
    );
};
export default AdminLayout;