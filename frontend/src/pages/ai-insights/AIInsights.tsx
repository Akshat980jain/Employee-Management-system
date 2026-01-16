import { useState } from 'react';
import { Brain, TrendingUp, Users, AlertTriangle, Lightbulb, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './AIInsights.module.css';

interface Insight {
    id: number;
    type: 'prediction' | 'recommendation' | 'alert';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    metric?: { value: string; change: number };
}

const AIInsights = () => {
    const insights: Insight[] = [
        { id: 1, type: 'prediction', title: 'Attrition Risk Detected', description: '3 employees in Engineering show early signs of disengagement. Recommended action: Schedule 1-on-1 meetings.', impact: 'high', metric: { value: '12%', change: -3 } },
        { id: 2, type: 'recommendation', title: 'Optimize Team Structure', description: 'Marketing team productivity could increase by 15% with role redistribution.', impact: 'medium' },
        { id: 3, type: 'alert', title: 'Overtime Trend Alert', description: 'Sales team averaging 12+ overtime hours weekly. Consider hiring or workload adjustment.', impact: 'high', metric: { value: '12.5h', change: 25 } },
        { id: 4, type: 'prediction', title: 'Performance Review Insights', description: 'Top 20% performers share common traits: self-directed learning, cross-team collaboration.', impact: 'medium' },
        { id: 5, type: 'recommendation', title: 'Training Opportunity', description: 'AI suggests Python training for 8 analysts to improve data processing efficiency by 40%.', impact: 'medium' },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'prediction': return <TrendingUp size={20} />;
            case 'recommendation': return <Lightbulb size={20} />;
            case 'alert': return <AlertTriangle size={20} />;
            default: return <Brain size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        const colors = { prediction: '#6366f1', recommendation: '#10b981', alert: '#f59e0b' };
        return colors[type as keyof typeof colors] || '#64748b';
    };

    const getImpactColor = (impact: string) => {
        const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
        return colors[impact as keyof typeof colors] || '#64748b';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>AI Insights</h1>
                    <p>AI-powered analytics and recommendations for your organization</p>
                </div>
            </div>

            <div className={styles.hero}>
                <div className={styles.heroIcon}>
                    <Brain size={32} />
                </div>
                <div className={styles.heroContent}>
                    <h2>Powered by Advanced AI</h2>
                    <p>Our AI analyzes your organization's data to provide actionable insights, predict trends, and recommend improvements. All insights are generated in real-time based on your latest data.</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{insights.length}</span>
                        <span className={styles.statLabel}>Active Insights</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{insights.filter(i => i.impact === 'high').length}</span>
                        <span className={styles.statLabel}>High Priority</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <Lightbulb size={20} />
                    </div>
                    <div>
                        <span className={styles.statValue}>{insights.filter(i => i.type === 'recommendation').length}</span>
                        <span className={styles.statLabel}>Recommendations</span>
                    </div>
                </div>
            </div>

            <div className={styles.insightsList}>
                {insights.map((insight) => (
                    <div key={insight.id} className={styles.insightCard}>
                        <div className={styles.insightHeader}>
                            <div className={styles.insightType} style={{ backgroundColor: `${getTypeColor(insight.type)}15`, color: getTypeColor(insight.type) }}>
                                {getTypeIcon(insight.type)}
                                <span>{insight.type}</span>
                            </div>
                            <span className={styles.impact} style={{ backgroundColor: `${getImpactColor(insight.impact)}15`, color: getImpactColor(insight.impact) }}>
                                {insight.impact} impact
                            </span>
                        </div>
                        <h3>{insight.title}</h3>
                        <p>{insight.description}</p>
                        {insight.metric && (
                            <div className={styles.metric}>
                                <span className={styles.metricValue}>{insight.metric.value}</span>
                                <span className={`${styles.metricChange} ${insight.metric.change >= 0 ? styles.positive : styles.negative}`}>
                                    {insight.metric.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    {Math.abs(insight.metric.change)}%
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIInsights;
