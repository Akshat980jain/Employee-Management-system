import { useState } from 'react';
import { DollarSign, Download, TrendingUp, Users, FileText } from 'lucide-react';
import styles from './Payroll.module.css';

const Payroll = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const stats = [
        { label: 'Total Payroll', value: '$125,000', icon: DollarSign, color: '#6366f1' },
        { label: 'Employees', value: '45', icon: Users, color: '#10b981' },
        { label: 'Pending', value: '3', icon: FileText, color: '#f59e0b' },
        { label: 'Processed', value: '42', icon: TrendingUp, color: '#3b82f6' },
    ];

    const payrollData = [
        { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000, deductions: 500, netPay: 4500, status: 'Paid' },
        { id: 2, name: 'Jane Smith', department: 'Design', basicSalary: 4500, deductions: 450, netPay: 4050, status: 'Paid' },
        { id: 3, name: 'Mike Johnson', department: 'Marketing', basicSalary: 4000, deductions: 400, netPay: 3600, status: 'Pending' },
        { id: 4, name: 'Sarah Williams', department: 'HR', basicSalary: 4200, deductions: 420, netPay: 3780, status: 'Paid' },
        { id: 5, name: 'Tom Brown', department: 'Sales', basicSalary: 4800, deductions: 480, netPay: 4320, status: 'Pending' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Payroll</h1>
                    <p>Manage employee salaries and payments</p>
                </div>
                <div className={styles.actions}>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={styles.monthPicker}
                    />
                    <button className={styles.exportBtn}>
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)` }}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>Payroll Details</h3>
                    <button className={styles.processBtn}>Process Payroll</button>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Basic Salary</th>
                            <th>Deductions</th>
                            <th>Net Pay</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrollData.map((row) => (
                            <tr key={row.id}>
                                <td>{row.name}</td>
                                <td>{row.department}</td>
                                <td>${row.basicSalary.toLocaleString()}</td>
                                <td className={styles.deduction}>-${row.deductions.toLocaleString()}</td>
                                <td className={styles.netPay}>${row.netPay.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[row.status.toLowerCase()]}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payroll;
