import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service.js';
import { updateOrganizationSchema, createDepartmentSchema, updateDepartmentSchema } from './organization.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Organization } from '../../models/index.js';

export class OrganizationController {
    // Public endpoint - returns minimal info for registration dropdown
    async getPublicOrganizations(req: Request, res: Response, next: NextFunction) {
        try {
            const organizations = await Organization.find({})
                .select('_id name')
                .sort({ name: 1 });

            res.json({
                success: true,
                data: organizations.map(org => ({
                    id: org._id,
                    name: org.name,
                })),
            });
        } catch (error) {
            next(error);
        }
    }

    // Search organizations by name (for transfer feature)
    async searchOrganizations(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.query as string || '';

            const filter = query.length >= 2
                ? { name: { $regex: query, $options: 'i' } }
                : {};

            const organizations = await Organization.find(filter)
                .select('_id name slug')
                .sort({ name: 1 })
                .limit(10);

            res.json({
                success: true,
                data: organizations,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrganization(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const organization = await organizationService.getOrganization(req.user!.organizationId);

            if (!organization) {
                throw ApiError.notFound('Organization not found');
            }

            res.json({
                success: true,
                data: organization,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateOrganization(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateOrganizationSchema.parse(req.body);
            const organization = await organizationService.updateOrganization(
                req.user!.organizationId,
                input
            );

            res.json({
                success: true,
                data: organization,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const settings = await organizationService.getSettings(req.user!.organizationId);

            res.json({
                success: true,
                data: settings,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const settings = await organizationService.updateSettings(
                req.user!.organizationId,
                req.body
            );

            res.json({
                success: true,
                data: settings,
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const stats = await organizationService.getStats(req.user!.organizationId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    // Department endpoints
    async getDepartments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const departments = await organizationService.getDepartments(req.user!.organizationId);

            res.json({
                success: true,
                data: departments,
            });
        } catch (error) {
            next(error);
        }
    }

    async getDepartmentTree(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const tree = await organizationService.getDepartmentTree(req.user!.organizationId);

            res.json({
                success: true,
                data: tree,
            });
        } catch (error) {
            next(error);
        }
    }

    async createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createDepartmentSchema.parse(req.body);
            const department = await organizationService.createDepartment(
                req.user!.organizationId,
                input
            );

            res.status(201).json({
                success: true,
                data: department,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async updateDepartment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateDepartmentSchema.parse(req.body);
            const department = await organizationService.updateDepartment(
                req.params.id,
                req.user!.organizationId,
                input
            );

            if (!department) {
                throw ApiError.notFound('Department not found');
            }

            res.json({
                success: true,
                data: department,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await organizationService.deleteDepartment(
                req.params.id,
                req.user!.organizationId
            );

            res.json({
                success: true,
                message: 'Department deleted',
            });
        } catch (error: any) {
            if (error.message?.includes('Cannot delete')) {
                return next(ApiError.badRequest(error.message));
            }
            next(error);
        }
    }
}

export const organizationController = new OrganizationController();
