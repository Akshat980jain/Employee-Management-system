import { useEffect, useState } from 'react';
import { Building2, Clock, Calendar, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import styles from './OrganizationSettings.module.css';

const OrganizationSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        name: '',
        timezone: 'UTC',
        industry: '',
        size: '',
        workingDays: [] as string[],
        annualLeaveQuota: 20,
        sickLeaveQuota: 10,
        carryForwardLimit: 5,
    });

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/organizations/settings');
            const data = response.data.data;
            setSettings({
                name: data.name || '',
                timezone: data.timezone || 'UTC',
                industry: '',
                size: '',
                workingDays: data.workingDays || [],
                annualLeaveQuota: data.annualLeaveQuota || 20,
                sickLeaveQuota: data.sickLeaveQuota || 10,
                carryForwardLimit: data.carryForwardLimit || 5,
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/organizations', settings);
            toast.success('Settings saved successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setSettings(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Organization Settings</h1>
                    <p>Configure your organization preferences</p>
                </div>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2><Building2 size={18} /> General</h2>
                    <div className={styles.formGroup}>
                        <label>Organization Name</label>
                        <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                            <option value="Asia/Kolkata">India</option>
                        </select>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2><Clock size={18} /> Working Days</h2>
                    <p className={styles.sectionDesc}>Select the days your organization operates</p>
                    <div className={styles.daysGrid}>
                        {days.map(day => (
                            <button
                                key={day}
                                className={`${styles.dayBtn} ${settings.workingDays.includes(day) ? styles.active : ''}`}
                                onClick={() => toggleDay(day)}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h2><Calendar size={18} /> Leave Defaults</h2>
                    <p className={styles.sectionDesc}>Default quotas for new employees</p>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Annual Leave (days)</label>
                            <input
                                type="number"
                                value={settings.annualLeaveQuota}
                                onChange={(e) => setSettings({ ...settings, annualLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Sick Leave (days)</label>
                            <input
                                type="number"
                                value={settings.sickLeaveQuota}
                                onChange={(e) => setSettings({ ...settings, sickLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Carry Forward Limit</label>
                            <input
                                type="number"
                                value={settings.carryForwardLimit}
                                onChange={(e) => setSettings({ ...settings, carryForwardLimit: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSettings;
