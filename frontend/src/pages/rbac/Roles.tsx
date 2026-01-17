import { useEffect, useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import api from '../../services/api';
import styles from './Roles.module.css';

const Roles = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/rbac/roles'),
                api.get('/rbac/permissions'),
            ]);
            setRoles(rolesRes.data.data);
            setPermissions(permsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const hasPermission = (roleId: string, permissionId: string) => {
        const role = roles.find(r => r.id === roleId);
        return role?.permissions?.some((p: any) => p.permission.id === permissionId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Roles & Permissions</h1>
                    <p>Manage access control for your organization</p>
                </div>
            </div>

            <div className={styles.layout}>
                <div className={styles.rolesPanel}>
                    <h2>Roles</h2>
                    <div className={styles.rolesList}>
                        {loading ? (
                            <p className={styles.loading}>Loading...</p>
                        ) : (
                            roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`${styles.roleCard} ${selectedRole?.id === role.id ? styles.active : ''}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <div className={styles.roleIcon}>
                                        <Shield size={18} />
                                    </div>
                                    <div className={styles.roleInfo}>
                                        <span className={styles.roleName}>{role.name}</span>
                                        <span className={styles.roleCount}>{role._count?.users || 0} users</span>
                                    </div>
                                    {role.isSystem && <span className={styles.systemBadge}>System</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.permissionsPanel}>
                    <h2>Permissions {selectedRole && `- ${selectedRole.name}`}</h2>
                    {!selectedRole ? (
                        <p className={styles.selectHint}>Select a role to view permissions</p>
                    ) : (
                        <div className={styles.permissionsGrid}>
                            {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
                                <div key={module} className={styles.permissionGroup}>
                                    <h3>{module.charAt(0).toUpperCase() + module.slice(1)}</h3>
                                    <div className={styles.permissionsList}>
                                        {perms.map((perm: any) => (
                                            <div key={perm.id} className={styles.permissionItem}>
                                                <span className={styles.permissionAction}>{perm.action}</span>
                                                <span className={`${styles.permissionStatus} ${hasPermission(selectedRole.id, perm.id) ? styles.granted : styles.denied}`}>
                                                    {hasPermission(selectedRole.id, perm.id) ? <Check size={14} /> : <X size={14} />}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Roles;
