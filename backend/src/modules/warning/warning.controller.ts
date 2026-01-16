import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { warningService } from './warning.service.js';
import { createWarningSchema, updateWarningSchema, warningFilterSchema } from './warning.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { Employee } from '../../models/index.js';

export class WarningController {
    // Create warning(s) for employee(s) - Admin/HR only
    async createWarning(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createWarningSchema.parse(req.body);
            const organizationId = req.user!.organizationId;
            const issuedBy = req.user!.userId;

            const warnings = await warningService.createWarnings(organizationId, issuedBy, input);

            res.status(201).json({
                success: true,
                message: `Warning issued to ${warnings.length} employee(s)`,
                data: warnings,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all warnings in organization - Admin/HR only
    async getWarnings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = warningFilterSchema.parse(req.query);
            const organizationId = req.user!.organizationId;

            const result = await warningService.getWarnings(organizationId, filters);

            res.json({
                success: true,
                data: result.warnings,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get my warnings - Employee view
    async getMyWarnings(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;

            // Find employee by userId
            const employee = await Employee.findOne({ userId });
            if (!employee) {
                throw ApiError.notFound('Employee profile not found');
            }

            const result = await warningService.getMyWarnings(employee._id.toString());

            res.json({
                success: true,
                data: result.warnings,
                unreadCount: result.unreadCount,
            });
        } catch (error) {
            next(error);
        }
    }

    // Mark warning as read - Employee only
    async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            // Find employee by userId
            const employee = await Employee.findOne({ userId });
            if (!employee) {
                throw ApiError.notFound('Employee profile not found');
            }

            const warning = await warningService.markAsRead(id, employee._id.toString());

            res.json({
                success: true,
                message: 'Warning marked as read',
                data: warning,
            });
        } catch (error) {
            next(error);
        }
    }

    // Dismiss warning - Admin/HR only
    async dismissWarning(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const organizationId = req.user!.organizationId;

            const warning = await warningService.dismissWarning(id, organizationId);

            res.json({
                success: true,
                message: 'Warning dismissed',
                data: warning,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update warning - Admin/HR only
    async updateWarning(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const input = updateWarningSchema.parse(req.body);
            const organizationId = req.user!.organizationId;

            const warning = await warningService.updateWarning(id, organizationId, input);

            res.json({
                success: true,
                message: 'Warning updated',
                data: warning,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get warning counts for current employee
    async getWarningCounts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;

            const employee = await Employee.findOne({ userId });
            if (!employee) {
                throw ApiError.notFound('Employee profile not found');
            }

            const counts = await warningService.getWarningCounts(employee._id.toString());

            res.json({
                success: true,
                data: counts,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const warningController = new WarningController();
