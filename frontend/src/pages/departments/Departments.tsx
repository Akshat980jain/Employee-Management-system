import { useState, useEffect } from 'react';
import { Plus, Folder, Users, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Departments.module.css';

interface Department {
    _id: string;
    name: string;
    description?: string;
    parentId?: { name: string };
    employeeCount?: number;
}

const Departments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/organizations/departments');
            setDepartments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await api.put(`/organizations/departments/${editingDept._id}`, formData);
                toast.success('Department updated');
            } else {
                await api.post('/organizations/departments', formData);
                toast.success('Department created');
            }
            setShowModal(false);
            setEditingDept(null);
            setFormData({ name: '', description: '' });
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to save department');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/organizations/departments/${id}`);
            toast.success('Department deleted');
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to delete department');
        }
    };

    const openEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, description: dept.description || '' });
        setShowModal(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Departments</h1>
                    <p>Organize your company structure</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Add Department
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading departments...</div>
            ) : departments.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏢</div>
                    <h3>No departments yet</h3>
                    <p>Create departments to organize your team</p>
                    <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                        <Plus size={20} />
                        Add Department
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {departments.map((dept) => (
                        <div key={dept._id} className={styles.card}>
                            <div className={styles.cardIcon}>
                                <Folder size={24} />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{dept.name}</h3>
                                {dept.description && <p>{dept.description}</p>}
                                <div className={styles.stats}>
                                    <Users size={14} />
                                    <span>{dept.employeeCount || 0} employees</span>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <button onClick={() => openEdit(dept)}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(dept._id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{editingDept ? 'Edit Department' : 'Add Department'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Department Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Engineering"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => {
                                    setShowModal(false);
                                    setEditingDept(null);
                                    setFormData({ name: '', description: '' });
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
