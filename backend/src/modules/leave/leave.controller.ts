import { Response, NextFunction } from 'express';
import { leaveService } from './leave.service.js';
import { createLeaveRequestSchema, approveLeaveSchema, leaveFilterSchema, createLeaveTypeSchema, createLeavePolicySchema } from './leave.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Employee } from '../../models/index.js';

export class LeaveController {
    // Leave Types
    async getLeaveTypes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const types = await leaveService.getLeaveTypes(req.user!.organizationId);

            res.json({
                success: true,
                data: types,
            });
        } catch (error) {
            next(error);
        }
    }

    async createLeaveType(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createLeaveTypeSchema.parse(req.body);
            const leaveType = await leaveService.createLeaveType(req.user!.organizationId, input);

            res.status(201).json({
                success: true,
                message: 'Leave type created successfully',
                data: leaveType,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    // Leave Policies
    async getLeavePolicies(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const policies = await leaveService.getLeavePolicies(req.user!.organizationId);

            res.json({
                success: true,
                data: policies,
            });
        } catch (error) {
            next(error);
        }
    }

    async createLeavePolicy(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createLeavePolicySchema.parse(req.body);
            const policy = await leaveService.createLeavePolicy(req.user!.organizationId, input);

            res.status(201).json({
                success: true,
                message: 'Leave policy created successfully',
                data: policy,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async updateLeavePolicy(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createLeavePolicySchema.partial().parse(req.body);
            const policy = await leaveService.updateLeavePolicy(
                req.user!.organizationId,
                req.params.id,
                input
            );

            res.json({
                success: true,
                message: 'Leave policy updated successfully',
                data: policy,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    // Leave Requests
    async createLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createLeaveRequestSchema.parse(req.body);

            let employee = await Employee.findOne({ userId: req.user!.userId });

            // If no employee profile exists, create one for HR/Admin users
            if (!employee) {
                const User = (await import('../../models/index.js')).User;
                const user = await User.findById(req.user!.userId);

                if (!user) {
                    throw ApiError.badRequest('User not found');
                }

                // Auto-create employee profile for the user
                employee = await Employee.create({
                    userId: req.user!.userId,
                    organizationId: req.user!.organizationId,
                    firstName: user.firstName,
                    lastName: user.lastName || '',
                    email: user.email,
                    employeeId: `EMP${Date.now().toString().slice(-8)}`,
                    status: 'ACTIVE',
                    joinDate: new Date(),
                });
            }

            const request = await leaveService.createLeaveRequest(
                employee._id.toString(),
                input
            );

            res.status(201).json({
                success: true,
                message: request.status === 'AUTO_APPROVED' ? 'Leave auto-approved' : 'Leave request submitted',
                data: request,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getLeaveRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = leaveFilterSchema.parse(req.query);
            const result = await leaveService.getLeaveRequests(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: result.requests,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getMyLeaveRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const filters = leaveFilterSchema.parse({
                ...req.query,
                employeeId: employee._id.toString(),
            });

            const result = await leaveService.getLeaveRequests(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: result.requests,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const request = await leaveService.getLeaveRequest(req.user!.organizationId, req.params.id);

            res.json({
                success: true,
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }

    async approveLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = approveLeaveSchema.parse(req.body);
            const request = await leaveService.approveLeaveRequest(
                req.user!.organizationId,
                req.params.id,
                input,
                req.user!.userId
            );

            res.json({
                success: true,
                message: `Leave request ${input.status.toLowerCase()}`,
                data: request,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async cancelLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            await leaveService.cancelLeaveRequest(req.user!.organizationId, req.params.id, employee._id.toString());

            res.json({
                success: true,
                message: 'Leave request cancelled',
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyBalances(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await Employee.findOne({ userId: req.user!.userId });

            if (!employee) {
                throw ApiError.badRequest('No employee profile linked to your account');
            }

            const balances = await leaveService.getLeaveBalances(req.user!.organizationId, employee._id.toString());

            res.json({
                success: true,
                data: balances,
            });
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeBalances(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const balances = await leaveService.getLeaveBalances(req.user!.organizationId, req.params.employeeId);

            res.json({
                success: true,
                data: balances,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPendingApprovals(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = leaveFilterSchema.parse({
                ...req.query,
                status: 'PENDING',
            });

            const result = await leaveService.getLeaveRequests(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: result.requests,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }
}

export const leaveController = new LeaveController();
