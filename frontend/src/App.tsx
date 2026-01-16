import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './components/Layout/AuthLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingVerification from './pages/auth/PendingVerification';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Employees from './pages/employees/Employees';
import AddEmployee from './pages/employees/AddEmployee';
import JoinRequests from './pages/employees/JoinRequests';
import Departments from './pages/departments/Departments';
import Attendance from './pages/attendance/Attendance';
import AttendanceCorrections from './pages/attendance/AttendanceCorrections';
import StaffMonitoring from './pages/attendance/StaffMonitoring';
import Leave from './pages/leave/Leave';
import Payroll from './pages/payroll/Payroll';
import Goals from './pages/goals/Goals';
import Reviews from './pages/reviews/Reviews';
import Feedback from './pages/feedback/Feedback';
import AIInsights from './pages/ai-insights/AIInsights';
import HRChatbot from './pages/hr-chatbot/HRChatbot';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import TransferRequest from './pages/transfer/TransferRequest';
import IncomingTransfers from './pages/transfer/IncomingTransfers';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isVerified, isLoading, pendingVerification } = useAuthStore();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect unverified users to pending verification page
    if (!isVerified || pendingVerification) {
        return <Navigate to="/pending-verification" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isVerified, isLoading, pendingVerification } = useAuthStore();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        // If authenticated but not verified, go to pending page
        if (!isVerified || pendingVerification) {
            return <Navigate to="/pending-verification" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--background-alt)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--success-500)',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--danger-500)',
                            secondary: 'white',
                        },
                    },
                }}
            />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />
                </Route>

                {/* Pending Verification Route */}
                <Route path="/pending-verification" element={<PendingVerification />} />

                {/* Protected Routes */}
                <Route element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/new" element={<AddEmployee />} />
                    <Route path="/employees/join-requests" element={<JoinRequests />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/attendance/corrections" element={<AttendanceCorrections />} />
                    <Route path="/attendance/monitoring" element={<StaffMonitoring />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/hr-chatbot" element={<HRChatbot />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/transfer" element={<TransferRequest />} />
                    <Route path="/transfer/incoming" element={<IncomingTransfers />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <h1>404</h1>
                        <p>Page not found</p>
                        <a href="/dashboard" style={{ color: 'var(--primary-500)' }}>
                            Go to Dashboard
                        </a>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
