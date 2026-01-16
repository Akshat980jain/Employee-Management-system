import { useState, useEffect, useCallback } from 'react';
import { UserPlus, CheckCircle, XCircle, Users } from 'lucide-react';
import api from '../../services/api';
import { connectSocket, onJoinRequestUpdate } from '../../services/socket';
import styles from './JoinRequestsCard.module.css';

interface JoinRequest {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    requestedRole: string;
    message?: string;
    createdAt: string;
}

const JoinRequestsCard = () => {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        try {
            const response = await api.get('/join-requests?status=PENDING');
            setRequests(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch join requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();

        // Connect to socket and subscribe to events
        connectSocket();
        const unsubscribe = onJoinRequestUpdate(
            // On approved - remove from list
            (data) => {
                setRequests(prev => prev.filter(r => r._id !== data.requestId));
            },
            // On rejected - remove from list
            (data) => {
                setRequests(prev => prev.filter(r => r._id !== data.requestId));
            },
            // On new request - refetch list
            () => {
                fetchRequests();
            }
        );

        return () => {
            unsubscribe();
        };
    }, [fetchRequests]);

    const handleApprove = async (requestId: string) => {
        setProcessing(requestId);
        try {
            await api.post(`/join-requests/${requestId}/approve`);
            // Remove from local state immediately for responsive UI
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId: string) => {
        const reason = prompt('Rejection reason (optional):');
        setProcessing(requestId);
        try {
            await api.post(`/join-requests/${requestId}/reject`, { rejectionReason: reason });
            // Remove from local state immediately for responsive UI
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Failed to reject request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3>
                    <UserPlus size={18} />
                    Pending Join Requests
                    {requests.length > 0 && (
                        <span className={styles.badge}>{requests.length}</span>
                    )}
                </h3>
            </div>

            <div className={styles.requestList}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <span>Loading...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Users size={24} />
                        </div>
                        <p>No pending requests</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request._id} className={styles.requestItem}>
                            <div className={styles.avatar}>
                                {request.userId.avatar ? (
                                    <img src={request.userId.avatar} alt="" />
                                ) : (
                                    `${request.userId.firstName[0]}${request.userId.lastName[0]}`
                                )}
                            </div>
                            <div className={styles.requestInfo}>
                                <span className={styles.userName}>
                                    {request.userId.firstName} {request.userId.lastName}
                                </span>
                                <span className={styles.userEmail}>
                                    {request.userId.email}
                                </span>
                                <div className={styles.requestMeta}>
                                    <span className={styles.roleBadge}>
                                        {request.requestedRole}
                                    </span>
                                    <span className={styles.timeAgo}>
                                        {formatTimeAgo(request.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className={styles.approveBtn}
                                    onClick={() => handleApprove(request._id)}
                                    disabled={processing === request._id}
                                    title="Approve"
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => handleReject(request._id)}
                                    disabled={processing === request._id}
                                    title="Reject"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JoinRequestsCard;
