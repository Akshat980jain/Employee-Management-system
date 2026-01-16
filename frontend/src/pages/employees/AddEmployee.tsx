import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './AddEmployee.module.css';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        employmentType: 'FULL_TIME',
        workLocation: 'ONSITE',
        status: 'HIRED',
        joinDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/employees', {
                ...formData,
                employeeId: `EMP${Date.now().toString(36).toUpperCase()}`,
                joinDate: new Date(formData.joinDate),
            });
            toast.success('Employee added successfully!');
            navigate('/employees');
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/employees')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1>Add New Employee</h1>
                    <p>Enter employee details to add them to the system</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.card}>
                    <h3><User size={18} /> Personal Information</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Mail size={14} /> Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="employee@company.com"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Phone size={14} /> Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3><Briefcase size={18} /> Employment Details</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g., Software Engineer"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Employment Type</label>
                            <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERN">Intern</option>
                                <option value="CONSULTANT">Consultant</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Work Location</label>
                            <select name="workLocation" value={formData.workLocation} onChange={handleChange}>
                                <option value="ONSITE">Onsite</option>
                                <option value="REMOTE">Remote</option>
                                <option value="HYBRID">Hybrid</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="HIRED">Hired</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_PROBATION">On Probation</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label><Calendar size={14} /> Join Date</label>
                            <input
                                type="date"
                                name="joinDate"
                                value={formData.joinDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => navigate('/employees')}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Adding...' : 'Add Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployee;
