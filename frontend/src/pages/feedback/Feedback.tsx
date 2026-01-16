import { useState } from 'react';
import { MessageSquare, ThumbsUp, Clock, Send, Star, TrendingUp } from 'lucide-react';
import styles from './Feedback.module.css';

interface FeedbackItem {
    id: number;
    from: string;
    to: string;
    type: 'praise' | 'suggestion' | 'general';
    message: string;
    date: string;
    isAnonymous: boolean;
}

const Feedback = () => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ to: '', type: 'praise', message: '', isAnonymous: false });

    const feedbackItems: FeedbackItem[] = [
        { id: 1, from: 'Jane Smith', to: 'John Doe', type: 'praise', message: 'Great job on the last project! Your attention to detail really made a difference.', date: '2026-01-10', isAnonymous: false },
        { id: 2, from: 'Anonymous', to: 'Marketing Team', type: 'suggestion', message: 'It would be helpful to have more frequent team sync-ups to improve coordination.', date: '2026-01-09', isAnonymous: true },
        { id: 3, from: 'Mike Johnson', to: 'Sarah Williams', type: 'praise', message: 'Thank you for helping with the onboarding process. You made it so smooth!', date: '2026-01-08', isAnonymous: false },
        { id: 4, from: 'Tom Brown', to: 'HR Team', type: 'general', message: 'The new benefits package is excellent. Really appreciate the effort!', date: '2026-01-07', isAnonymous: false },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'praise': return <ThumbsUp size={16} />;
            case 'suggestion': return <TrendingUp size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    const getTypeColor = (type: string) => {
        const colors = { praise: '#10b981', suggestion: '#6366f1', general: '#64748b' };
        return colors[type as keyof typeof colors] || '#64748b';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting feedback:', formData);
        setShowForm(false);
        setFormData({ to: '', type: 'praise', message: '', isAnonymous: false });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Feedback</h1>
                    <p>Share and receive constructive feedback</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowForm(true)}>
                    <Send size={18} />
                    Give Feedback
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <ThumbsUp size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{feedbackItems.filter(f => f.type === 'praise').length}</span>
                        <span className={styles.statLabel}>Praise</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{feedbackItems.filter(f => f.type === 'suggestion').length}</span>
                        <span className={styles.statLabel}>Suggestions</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}>
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{feedbackItems.length}</span>
                        <span className={styles.statLabel}>Total Feedback</span>
                    </div>
                </div>
            </div>

            <div className={styles.feedbackList}>
                {feedbackItems.map((item) => (
                    <div key={item.id} className={styles.feedbackCard}>
                        <div className={styles.feedbackHeader}>
                            <div className={styles.typeTag} style={{ backgroundColor: `${getTypeColor(item.type)}15`, color: getTypeColor(item.type) }}>
                                {getTypeIcon(item.type)}
                                <span>{item.type}</span>
                            </div>
                            <span className={styles.date}>
                                <Clock size={14} />
                                {new Date(item.date).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={styles.message}>{item.message}</p>
                        <div className={styles.feedbackFooter}>
                            <span className={styles.from}>From: {item.isAnonymous ? 'Anonymous' : item.from}</span>
                            <span className={styles.to}>To: {item.to}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Give Feedback</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>To</label>
                                <input type="text" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} placeholder="Person or team name" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Type</label>
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="praise">Praise</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message</label>
                                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Your feedback..." rows={4} required />
                            </div>
                            <div className={styles.checkbox}>
                                <input type="checkbox" id="anonymous" checked={formData.isAnonymous} onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })} />
                                <label htmlFor="anonymous">Send anonymously</label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Send Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feedback;
