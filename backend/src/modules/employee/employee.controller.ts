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
                input,
                req.user!.userId
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
            const employee = await employeeService.getEmployee(req.user!.organizationId, req.params.id);

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
                req.user!.organizationId,
                req.params.id,
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
            const employee = await employeeService.updateEmployeeStatus(
                req.user!.organizationId,
                req.params.id,
                input,
                req.user!.userId
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
            const history = await employeeService.getEmployeeStatusHistory(
                req.user!.organizationId,
                req.params.id
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
            const tree = await employeeService.getReportingTree(
                req.user!.organizationId,
                req.query.employeeId as string | undefined
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
            await employeeService.deleteEmployee(req.user!.organizationId, req.params.id);

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
