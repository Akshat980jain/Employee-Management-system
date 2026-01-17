import { Response, NextFunction } from 'express';
import { employeeService } from './employee.service.js';
import { createEmployeeSchema, updateEmployeeSchema, updateEmployeeStatusSchema, employeeFilterSchema } from './employee.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class EmployeeController {
    async createEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createEmployeeSchema.parse(req.body);
            const employee = await employeeService.createEmployee(
                req.user!.organizationId,
                input
            );

            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: employee,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getEmployees(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = employeeFilterSchema.parse(req.query);
            const result = await employeeService.getEmployees(req.user!.organizationId, filters);

            res.json({
                success: true,
                data: {
                    employees: result.employees,
                    pagination: result.pagination,
                },
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await employeeService.getEmployee(req.params.id, req.user!.organizationId);

            res.json({
                success: true,
                data: employee,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateEmployeeSchema.parse(req.body);
            const employee = await employeeService.updateEmployee(
                req.params.id,
                req.user!.organizationId,
                input
            );

            res.json({
                success: true,
                message: 'Employee updated successfully',
                data: employee,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async updateEmployeeStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = updateEmployeeStatusSchema.parse(req.body);
            const employee = await employeeService.updateStatus(
                req.params.id,
                req.user!.organizationId,
                input
            );

            res.json({
                success: true,
                message: 'Employee status updated successfully',
                data: employee,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async getEmployeeStatusHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const history = await employeeService.getHistory(
                req.params.id,
                req.user!.organizationId
            );

            res.json({
                success: true,
                data: history,
            });
        } catch (error) {
            next(error);
        }
    }

    async getReportingTree(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employeeId = req.query.employeeId as string;
            if (!employeeId) {
                throw new Error('employeeId query parameter is required');
            }
            const tree = await employeeService.getReportingTree(
                employeeId,
                req.user!.organizationId
            );

            res.json({
                success: true,
                data: tree,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await employeeService.deleteEmployee(req.params.id, req.user!.organizationId);

            res.json({
                success: true,
                message: 'Employee deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const employeeController = new EmployeeController();
