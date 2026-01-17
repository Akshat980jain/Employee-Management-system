import { Role, UserRole, User } from '../../models/index.js';
import { CreateRoleInput, UpdateRoleInput, AssignRoleInput } from './rbac.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class RbacService {
    // Available permissions list
    private static PERMISSIONS = [
        'employees:create', 'employees:read', 'employees:update', 'employees:delete',
        'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
        'leave:create', 'leave:read', 'leave:approve', 'leave:delete',
        'payroll:read', 'payroll:update',
        'roles:create', 'roles:read', 'roles:update', 'roles:delete',
        'organization:read', 'organization:update',
        'reports:read', 'audit:read',
        '*:*',
    ];

    async getPermissions() {
        return RbacService.PERMISSIONS.map(p => {
            const [module, action] = p.split(':');
            return { name: p, module, action };
        });
    }

    async getRoles(organizationId: string) {
        return Role.find({ organizationId }).select('-__v').sort({ isSystem: -1, name: 1 });
    }

    async getRole(roleId: string, organizationId: string) {
        return Role.findOne({ _id: roleId, organizationId }).select('-__v');
    }

    async createRole(organizationId: string, input: CreateRoleInput) {
        // Check for duplicate name
        const existing = await Role.findOne({ name: input.name, organizationId });
        if (existing) {
            throw ApiError.conflict('Role with this name already exists');
        }

        return Role.create({
            name: input.name,
            description: input.description,
            organizationId,
            permissions: input.permissionIds || [],
        });
    }

    async updateRole(roleId: string, organizationId: string, input: UpdateRoleInput) {
        const role = await Role.findOne({ _id: roleId, organizationId });
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        if (role.isSystem) {
            throw ApiError.badRequest('Cannot modify system roles');
        }

        return Role.findByIdAndUpdate(roleId, input, { new: true }).select('-__v');
    }

    async deleteRole(roleId: string, organizationId: string) {
        const role = await Role.findOne({ _id: roleId, organizationId });
        if (!role) {
            throw ApiError.notFound('Role not found');
        }

        if (role.isSystem) {
            throw ApiError.badRequest('Cannot delete system roles');
        }

        // Check if role is assigned to users
        const assignedUsers = await UserRole.countDocuments({ roleId });
        if (assignedUsers > 0) {
            throw ApiError.badRequest('Cannot delete role assigned to users');
        }

        await Role.findByIdAndDelete(roleId);
    }

    async assignRole(userId: string, roleId: string, organizationId?: string) {
        // Check if already assigned
        const existing = await UserRole.findOne({ userId, roleId });
        if (existing) {
            throw ApiError.conflict('Role already assigned to user');
        }

        return UserRole.create({
            userId,
            roleId,
        });
    }

    async removeRole(userId: string, roleId: string) {
        const userRole = await UserRole.findOne({ userId, roleId });
        if (!userRole) {
            throw ApiError.notFound('Role assignment not found');
        }

        await UserRole.findByIdAndDelete(userRole._id);
    }

    async getUserRoles(userId: string) {
        return UserRole.find({ userId }).populate('roleId').select('-__v');
    }

    async getPermissionMatrix(organizationId: string) {
        const roles = await Role.find({ organizationId }).select('-__v');

        return roles.map(role => ({
            roleId: role._id,
            roleName: role.name,
            permissions: role.permissions,
        }));
    }

    async getPermissionsByModule() {
        const permissions = await this.getPermissions();
        const grouped: Record<string, string[]> = {};

        for (const p of permissions) {
            if (!grouped[p.module]) {
                grouped[p.module] = [];
            }
            grouped[p.module].push(p.name);
        }

        return grouped;
    }
}

export const rbacService = new RbacService();

