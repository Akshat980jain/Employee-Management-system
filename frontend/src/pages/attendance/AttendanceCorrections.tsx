import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './AttendanceCorrections.module.css';

interface CorrectionRequest {
    _id: string;
    employeeId: {
        firstName: string;
        lastName: string;
        employeeId: string;
    };
    date: string;
    requestType: string;
    reason: string;
    proposedCheckIn?: string;
    proposedCheckOut?: string;
    status: string;
    createdAt: string;
}

const AttendanceCorrections = () => {
    const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchCorrections();
    }, []);

    const fetchCorrections = async () => {
        try {
            const response = await api.get('/attendance/corrections/pending');
            setCorrections(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch corrections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessing(id);
        try {
            await api.put(`/attendance/corrections/${id}/approve`, { reviewNotes: 'Approved' });
            toast.success('Correction request approved');
            fetchCorrections();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to approve');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        setProcessing(id);
        try {
            await api.put(`/attendance/corrections/${id}/reject`, { reviewNotes: reason });
            toast.success('Correction request rejected');
            fetchCorrections();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to reject');
        } finally {
            setProcessing(null);
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case 'ADD_SESSION': return 'Add Session';
            case 'MODIFY_TIME': return 'Modify Time';
            case 'ADD_MISSING': return 'Add Missing Day';
            default: return type;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Attendance Corrections</h1>
                    <p>Review and approve employee correction requests</p>
                </div>
                <div className={styles.badge}>
                    {corrections.length} Pending
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : corrections.length === 0 ? (
                <div className={styles.emptyState}>
                    <CheckCircle size={48} />
                    <h3>No Pending Requests</h3>
                    <p>All correction requests have been processed</p>
                </div>
            ) : (
                <div className={styles.correctionsList}>
                    {corrections.map((correction) => (
                        <div key={correction._id} className={styles.correctionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.employeeInfo}>
                                    <div className={styles.avatar}>
                                        {correction.employeeId?.firstName?.[0] || '?'}
                                        {correction.employeeId?.lastName?.[0] || '?'}
                                    </div>
                                    <div>
                                        <span className={styles.employeeName}>
                                            {correction.employeeId?.firstName} {correction.employeeId?.lastName}
                                        </span>
                                        <span className={styles.employeeId}>
                                            {correction.employeeId?.employeeId}
                                        </span>
                                    </div>
                                </div>
                                <span className={styles.requestType}>
                                    {getRequestTypeLabel(correction.requestType)}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <Calendar size={16} />
                                    <span>Date: {new Date(correction.date).toLocaleDateString()}</span>
                                </div>

                                {correction.proposedCheckIn && (
                                    <div className={styles.infoRow}>
                                        <Clock size={16} />
                                        <span>
                                            Proposed: {formatDateTime(correction.proposedCheckIn)}
                                            {correction.proposedCheckOut && ` - ${formatDateTime(correction.proposedCheckOut)}`}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.reason}>
                                    <FileText size={16} />
                                    <span>{correction.reason}</span>
                                </div>

                                <div className={styles.submitted}>
                                    Submitted: {formatDateTime(correction.createdAt)}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => handleReject(correction._id)}
                                    disabled={processing === correction._id}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    className={styles.approveBtn}
                                    onClick={() => handleApprove(correction._id)}
                                    disabled={processing === correction._id}
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceCorrections;
