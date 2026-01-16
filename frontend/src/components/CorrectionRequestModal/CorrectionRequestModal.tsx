import { useState } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './CorrectionRequestModal.module.css';

interface CorrectionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CorrectionRequestModal = ({ isOpen, onClose, onSuccess }: CorrectionRequestModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        requestType: 'ADD_SESSION',
        reason: '',
        proposedCheckIn: '',
        proposedCheckOut: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reason.trim()) {
            toast.error('Please provide a reason for your request');
            return;
        }

        setLoading(true);
        try {
            await api.post('/attendance/corrections', {
                date: formData.date,
                requestType: formData.requestType,
                reason: formData.reason,
                proposedCheckIn: formData.proposedCheckIn ? `${formData.date}T${formData.proposedCheckIn}:00` : undefined,
                proposedCheckOut: formData.proposedCheckOut ? `${formData.date}T${formData.proposedCheckOut}:00` : undefined,
            });
            toast.success('Correction request submitted successfully!');
            onSuccess();
            onClose();
            setFormData({
                date: new Date().toISOString().split('T')[0],
                requestType: 'ADD_SESSION',
                reason: '',
                proposedCheckIn: '',
                proposedCheckOut: '',
            });
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Request Attendance Correction</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label><Calendar size={16} /> Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label><FileText size={16} /> Request Type</label>
                        <select
                            value={formData.requestType}
                            onChange={e => setFormData({ ...formData, requestType: e.target.value })}
                        >
                            <option value="ADD_SESSION">Add Missing Session</option>
                            <option value="MODIFY_TIME">Modify Check-in/out Time</option>
                            <option value="ADD_MISSING">Add Missing Day Record</option>
                        </select>
                    </div>

                    <div className={styles.timeGroup}>
                        <div className={styles.formGroup}>
                            <label><Clock size={16} /> Proposed Check-in</label>
                            <input
                                type="time"
                                value={formData.proposedCheckIn}
                                onChange={e => setFormData({ ...formData, proposedCheckIn: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Clock size={16} /> Proposed Check-out</label>
                            <input
                                type="time"
                                value={formData.proposedCheckOut}
                                onChange={e => setFormData({ ...formData, proposedCheckOut: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><FileText size={16} /> Reason</label>
                        <textarea
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Explain why you need this correction..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CorrectionRequestModal;
