import { useState } from 'react';
import { Target, Plus, CheckCircle, Circle, TrendingUp, Calendar } from 'lucide-react';
import styles from './Goals.module.css';

interface Goal {
    id: number;
    title: string;
    description: string;
    progress: number;
    dueDate: string;
    status: 'in_progress' | 'completed' | 'overdue';
}

const Goals = () => {
    const [goals] = useState<Goal[]>([
        { id: 1, title: 'Complete Q1 Performance Reviews', description: 'Review all team members for Q1', progress: 75, dueDate: '2026-03-31', status: 'in_progress' },
        { id: 2, title: 'Implement New Onboarding Process', description: 'Design and deploy new employee onboarding workflow', progress: 100, dueDate: '2026-02-15', status: 'completed' },
        { id: 3, title: 'Reduce Employee Turnover by 10%', description: 'Implement retention strategies', progress: 45, dueDate: '2026-06-30', status: 'in_progress' },
        { id: 4, title: 'Launch Training Portal', description: 'Deploy online learning management system', progress: 30, dueDate: '2026-01-31', status: 'overdue' },
        { id: 5, title: 'Update Company Policies', description: 'Review and update all HR policies', progress: 60, dueDate: '2026-04-15', status: 'in_progress' },
    ]);

    const getStatusColor = (status: string) => {
        const colors = { in_progress: '#6366f1', completed: '#10b981', overdue: '#ef4444' };
        return colors[status as keyof typeof colors] || '#6b7280';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Goals</h1>
                    <p>Track and manage organizational objectives</p>
                </div>
                <button className={styles.addBtn}>
                    <Plus size={20} />
                    Add Goal
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <Target size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{goals.length}</span>
                        <span className={styles.statLabel}>Total Goals</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{goals.filter(g => g.status === 'completed').length}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{goals.filter(g => g.status === 'in_progress').length}</span>
                        <span className={styles.statLabel}>In Progress</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                        <Circle size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{goals.filter(g => g.status === 'overdue').length}</span>
                        <span className={styles.statLabel}>Overdue</span>
                    </div>
                </div>
            </div>

            <div className={styles.goalsList}>
                {goals.map((goal) => (
                    <div key={goal.id} className={styles.goalCard}>
                        <div className={styles.goalHeader}>
                            <div className={styles.goalIcon} style={{ backgroundColor: `${getStatusColor(goal.status)}15`, color: getStatusColor(goal.status) }}>
                                <Target size={20} />
                            </div>
                            <div className={styles.goalInfo}>
                                <h3>{goal.title}</h3>
                                <p>{goal.description}</p>
                            </div>
                            <span className={styles.status} style={{ backgroundColor: `${getStatusColor(goal.status)}15`, color: getStatusColor(goal.status) }}>
                                {goal.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className={styles.goalProgress}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${goal.progress}%`, backgroundColor: getStatusColor(goal.status) }}
                                />
                            </div>
                            <span className={styles.progressText}>{goal.progress}%</span>
                        </div>
                        <div className={styles.goalFooter}>
                            <Calendar size={14} />
                            <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Goals;
