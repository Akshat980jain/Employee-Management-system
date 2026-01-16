import { useState } from 'react';
import { Star, User, Calendar, ChevronRight, Award, TrendingUp } from 'lucide-react';
import styles from './Reviews.module.css';

interface Review {
    id: number;
    employeeName: string;
    department: string;
    reviewPeriod: string;
    rating: number;
    status: 'pending' | 'completed' | 'in_review';
    lastUpdated: string;
}

const Reviews = () => {
    const [filter, setFilter] = useState('all');

    const reviews: Review[] = [
        { id: 1, employeeName: 'John Doe', department: 'Engineering', reviewPeriod: 'Q4 2025', rating: 4.5, status: 'completed', lastUpdated: '2026-01-05' },
        { id: 2, employeeName: 'Jane Smith', department: 'Design', reviewPeriod: 'Q4 2025', rating: 4.8, status: 'completed', lastUpdated: '2026-01-08' },
        { id: 3, employeeName: 'Mike Johnson', department: 'Marketing', reviewPeriod: 'Q4 2025', rating: 0, status: 'pending', lastUpdated: '2026-01-10' },
        { id: 4, employeeName: 'Sarah Williams', department: 'HR', reviewPeriod: 'Q4 2025', rating: 4.2, status: 'in_review', lastUpdated: '2026-01-09' },
        { id: 5, employeeName: 'Tom Brown', department: 'Sales', reviewPeriod: 'Q4 2025', rating: 0, status: 'pending', lastUpdated: '2026-01-10' },
    ];

    const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    fill={i <= rating ? '#f59e0b' : 'none'}
                    color={i <= rating ? '#f59e0b' : '#e2e8f0'}
                />
            );
        }
        return stars;
    };

    const getStatusColor = (status: string) => {
        const colors = { pending: '#f59e0b', completed: '#10b981', in_review: '#6366f1' };
        return colors[status as keyof typeof colors] || '#6b7280';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Performance Reviews</h1>
                    <p>Manage employee performance evaluations</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <User size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{reviews.length}</span>
                        <span className={styles.statLabel}>Total Reviews</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <Award size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{reviews.filter(r => r.status === 'completed').length}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>
                            {(reviews.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / reviews.filter(r => r.rating > 0).length).toFixed(1)}
                        </span>
                        <span className={styles.statLabel}>Avg. Rating</span>
                    </div>
                </div>
            </div>

            <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`} onClick={() => setFilter('pending')}>Pending</button>
                <button className={`${styles.filterBtn} ${filter === 'in_review' ? styles.active : ''}`} onClick={() => setFilter('in_review')}>In Review</button>
                <button className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            </div>

            <div className={styles.reviewsList}>
                {filteredReviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.avatar}>
                            {review.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={styles.reviewInfo}>
                            <h3>{review.employeeName}</h3>
                            <p>{review.department} • {review.reviewPeriod}</p>
                            {review.rating > 0 && (
                                <div className={styles.rating}>
                                    {renderStars(review.rating)}
                                    <span>{review.rating}</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.reviewMeta}>
                            <span className={styles.status} style={{ backgroundColor: `${getStatusColor(review.status)}15`, color: getStatusColor(review.status) }}>
                                {review.status.replace('_', ' ')}
                            </span>
                            <span className={styles.date}>
                                <Calendar size={14} />
                                {new Date(review.lastUpdated).toLocaleDateString()}
                            </span>
                        </div>
                        <button className={styles.viewBtn}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
