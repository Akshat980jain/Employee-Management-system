import { Employee, Department, User } from '../../models/index.js';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilterInput, UpdateEmployeeStatusInput } from './employee.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class EmployeeService {
    async getEmployees(organizationId: string, filters?: EmployeeFilterInput) {
        const query: any = { organizationId };

        if (filters?.status) {
            query.status = filters.status;
        }
        if (filters?.departmentId) {
            query.departmentId = filters.departmentId;
        }
        if (filters?.employmentType) {
            query.employmentType = filters.employmentType;
        }
        if (filters?.search) {
            query.$or = [
                { firstName: { $regex: filters.search, $options: 'i' } },
                { lastName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { employeeId: { $regex: filters.search, $options: 'i' } },
            ];
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            Employee.find(query)
                .populate('departmentId', 'name')
                .populate('managerId', 'firstName lastName')
                .populate('userId', 'avatar')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .select('-__v'),
            Employee.countDocuments(query),
        ]);

        return {
            employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getEmployee(employeeId: string, organizationId: string) {
        return Employee.findOne({ _id: employeeId, organizationId })
            .populate('departmentId', 'name')
            .populate('managerId', 'firstName lastName email')
            .select('-__v');
    }

    async createEmployee(organizationId: string, input: CreateEmployeeInput) {
        // Generate employee ID
        const count = await Employee.countDocuments({ organizationId });
        const empId = `EMP${String(count + 1).padStart(5, '0')}`;

        // Check for duplicate email
        const existing = await Employee.findOne({ email: input.email });
        if (existing) {
            throw ApiError.conflict('Email already exists');
        }

        return Employee.create({
            ...input,
            employeeId: empId,
            organizationId,
            joinDate: input.joinDate || new Date(),
        });
    }

    async updateEmployee(employeeId: string, organizationId: string, input: UpdateEmployeeInput) {
        return Employee.findOneAndUpdate(
            { _id: employeeId, organizationId },
            input,
            { new: true }
        ).select('-__v');
    }

    async updateStatus(employeeId: string, organizationId: string, input: UpdateEmployeeStatusInput) {
        const employee = await Employee.findOne({ _id: employeeId, organizationId });
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const updateData: any = { status: input.status };

        if (input.status === 'RESIGNED') {
            updateData.resignationDate = input.effectiveDate || new Date();
        } else if (input.status === 'TERMINATED') {
            updateData.lastWorkingDate = input.effectiveDate || new Date();
        } else if (input.status === 'ACTIVE' && employee.status === 'ON_PROBATION') {
            updateData.confirmationDate = input.effectiveDate || new Date();
        }

        return Employee.findByIdAndUpdate(employeeId, updateData, { new: true }).select('-__v');
    }

    async getHistory(employeeId: string, organizationId: string) {
        const employee = await Employee.findOne({ _id: employeeId, organizationId });
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        // Return basic history (could be expanded with audit logs)
        return {
            employee,
            history: [],
        };
    }

    async getReportingTree(employeeId: string, organizationId: string) {
        const employee = await Employee.findOne({ _id: employeeId, organizationId });
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const directReports = await Employee.find({ managerId: employeeId, organizationId })
            .select('_id firstName lastName email designation');

        return {
            employee,
            directReports,
        };
    }

    async deleteEmployee(employeeId: string, organizationId: string) {
        const employee = await Employee.findOne({ _id: employeeId, organizationId });
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        // Check if has direct reports
        const hasReports = await Employee.countDocuments({ managerId: employeeId });
        if (hasReports > 0) {
            throw ApiError.badRequest('Cannot delete employee with direct reports');
        }

        await Employee.findByIdAndDelete(employeeId);
    }
}

export const employeeService = new EmployeeService();
