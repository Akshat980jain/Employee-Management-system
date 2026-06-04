import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, LogOut, RefreshCw, Building } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../logo.png';
import styles from './PendingVerification.module.css';

interface JoinRequestInfo {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    organization?: { name: string };
    rejectionReason?: string;
    createdAt: string;
}

const PendingVerification = () => {
    const navigate = useNavigate();
    const { user, organization, logout, checkVerificationStatus } = useAuthStore();
    const [request, setRequest] = useState<JoinRequestInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRequestStatus = async () => {
        try {
            const response = await api.get('/join-requests/my');
            const requests = response.data.data;
            if (requests && requests.length > 0) {
                // Get the most recent request
                setRequest(requests[0]);

                // If approved, redirect to dashboard
                if (requests[0].status === 'APPROVED') {
                    const isVerified = await checkVerificationStatus();
                    if (isVerified) {
                        toast.success('Your account has been approved!');
                        navigate('/dashboard');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch request status:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequestStatus();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchRequestStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchRequestStatus();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusIcon = () => {
        if (!request) return <Clock className={styles.statusIconPending} size={64} />;

        switch (request.status) {
            case 'APPROVED':
                return <CheckCircle className={styles.statusIconApproved} size={64} />;
            case 'REJECTED':
                return <XCircle className={styles.statusIconRejected} size={64} />;
            default:
                return <Clock className={styles.statusIconPending} size={64} />;
        }
    };

    const getStatusMessage = () => {
        if (!request) return 'Loading your request status...';

        switch (request.status) {
            case 'APPROVED':
                return 'Your account has been approved!';
            case 'REJECTED':
                return 'Unfortunately, your request was declined.';
            default:
                return 'Your account is pending verification';
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.loading}>
                        <RefreshCw className={styles.spinner} size={32} />
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoSection} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={logo} alt="StaffSphere Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }} />
                        <span className={styles.logoText}>StaffSphere</span>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.statusIcon}>
                        {getStatusIcon()}
                    </div>

                    <h1 className={styles.title}>{getStatusMessage()}</h1>

                    {request?.status === 'PENDING' && (
                        <>
                            <p className={styles.description}>
                                Hello <strong>{user?.firstName}</strong>, your request to join{' '}
                                <strong>{organization?.name}</strong> is being reviewed.
                            </p>
                            <p className={styles.subtext}>
                                An HR manager or Admin will review your request and you'll be notified once it's approved.
                                This page will automatically update when your status changes.
                            </p>
                        </>
                    )}

                    {request?.status === 'REJECTED' && (
                        <>
                            <p className={styles.description}>
                                Your request to join <strong>{organization?.name}</strong> was not approved.
                            </p>
                            {request.rejectionReason && (
                                <div className={styles.rejectionBox}>
                                    <strong>Reason:</strong> {request.rejectionReason}
                                </div>
                            )}
                            <p className={styles.subtext}>
                                Please contact the organization's HR department for more information.
                            </p>
                        </>
                    )}

                    {request?.status === 'APPROVED' && (
                        <>
                            <p className={styles.description}>
                                Welcome to <strong>{organization?.name}</strong>! You can now access the portal.
                            </p>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => navigate('/dashboard')}
                            >
                                Go to Dashboard
                            </button>
                        </>
                    )}

                    <div className={styles.orgInfo}>
                        <Building size={18} />
                        <span>{organization?.name || 'Organization'}</span>
                    </div>

                    {request?.status === 'PENDING' && (
                        <div className={styles.requestInfo}>
                            <p>Request submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {request?.status === 'PENDING' && (
                        <button
                            className={styles.refreshBtn}
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={18} className={isRefreshing ? styles.spinning : ''} />
                            {isRefreshing ? 'Checking...' : 'Check Status'}
                        </button>
                    )}

                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerification;
