import { useAuthStore } from '../store/authStore';
import AdminDashboard from './dashboard/AdminDashboard';
import HRDashboard from './dashboard/HRDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

const Dashboard = () => {
    const { user } = useAuthStore();

    // Get user's role from the auth store
    const getUserRole = (): 'Admin' | 'HR' | 'Employee' => {
        if (!user) return 'Employee';

        const roles = (user as any)?.roles || [];

        // Check for specific roles
        for (const role of roles) {
            const roleName = typeof role === 'string' ? role : role?.name || '';

            if (roleName.toLowerCase().includes('admin')) {
                return 'Admin';
            }
            if (roleName.toLowerCase().includes('hr') || roleName.toLowerCase().includes('human')) {
                return 'HR';
            }
        }

        return 'Employee';
    };

    const role = getUserRole();

    // Render appropriate dashboard based on role
    switch (role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'HR':
            return <HRDashboard />;
        default:
            return <EmployeeDashboard />;
    }
};

export default Dashboard;
