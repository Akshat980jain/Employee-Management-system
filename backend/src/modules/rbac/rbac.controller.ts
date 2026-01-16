import { Response, NextFunction } from 'express';
import { rbacService } from './rbac.service.js';
import { createRoleSchema, updateRoleSchema, assignRoleSchema } from './rbac.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class RbacController {
    // Roles
    async getRoles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const roles = await rbacService.getRoles(req.user!.organizationId);

            res.json({
                success: true,
                data: roles,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRole(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const role = await rbacService.getRole(req.user!.organizationId, req.params.id);

            res.json({
                success: true,
                data: role,
            });
        } catch (error) {
            next(error);
        }
    }

    async createRole(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createRoleSchema.parse(req.body);
            const role = await rbacService.createRole(req.user!.organizationId, input);

            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: role,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateRoleSchema.parse(req.body);
            const role = await rbacService.updateRole(req.user!.organizationId, req.params.id, input);

            res.json({
                success: true,
                message: 'Role updated successfully',
                data: role,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await rbacService.deleteRole(req.user!.organizationId, req.params.id);

            res.json({
                success: true,
                message: 'Role deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    // Permissions
    async getPermissions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const permissions = await rbacService.getPermissions();

            res.json({
                success: true,
                data: permissions,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPermissionsByModule(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const permissions = await rbacService.getPermissionsByModule();

            res.json({
                success: true,
                data: permissions,
            });
        } catch (error) {
            next(error);
        }
    }

    // User role management
    async assignRoleToUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { roleId } = assignRoleSchema.parse(req.body);
            const userRole = await rbacService.assignRole(
                req.params.userId,
                roleId,
                req.user!.organizationId
            );

            res.status(201).json({
                success: true,
                message: 'Role assigned successfully',
                data: userRole,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async removeRoleFromUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await rbacService.removeRole(req.params.userId, req.params.roleId);

            res.json({
                success: true,
                message: 'Role removed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserRoles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const roles = await rbacService.getUserRoles(req.params.userId);

            res.json({
                success: true,
                data: roles,
            });
        } catch (error) {
            next(error);
        }
    }

    // Permission matrix
    async getPermissionMatrix(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const matrix = await rbacService.getPermissionMatrix(req.user!.organizationId);

            res.json({
                success: true,
                data: matrix,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const rbacController = new RbacController();
