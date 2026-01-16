import { Warning, Employee } from '../../models/index.js';
import { CreateWarningInput, UpdateWarningInput, WarningFilterInput } from './warning.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class WarningService {
    // Create warnings for one or multiple employees
    async createWarnings(organizationId: string, issuedBy: string, input: CreateWarningInput) {
        const { employeeIds, message, severity } = input;

        // Verify all employees exist and belong to the organization
        const employees = await Employee.find({
            _id: { $in: employeeIds },
            organizationId,
        });

        if (employees.length !== employeeIds.length) {
            throw ApiError.badRequest('One or more employees not found in your organization');
        }

        // Create warnings for each employee
        const warnings = await Warning.insertMany(
            employeeIds.map(employeeId => ({
                employeeId,
                organizationId,
                issuedBy,
                message,
                severity,
            }))
        );

        return warnings;
    }

    // Get all warnings for an organization (Admin/HR view)
    async getWarnings(organizationId: string, filters?: WarningFilterInput) {
        const query: any = { organizationId };

        if (filters?.employeeId) {
            query.employeeId = filters.employeeId;
        }
        if (filters?.severity) {
            query.severity = filters.severity;
        }
        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }
        if (filters?.isRead !== undefined) {
            query.isRead = filters.isRead;
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [warnings, total] = await Promise.all([
            Warning.find(query)
                .populate('employeeId', 'firstName lastName employeeId email')
                .populate('issuedBy', 'firstName lastName')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Warning.countDocuments(query),
        ]);

        return {
            warnings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get warnings for a specific employee (Employee view)
    async getMyWarnings(employeeId: string) {
        const warnings = await Warning.find({
            employeeId,
            isActive: true,
        })
            .populate('issuedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        const unreadCount = warnings.filter(w => !w.isRead).length;

        return {
            warnings,
            unreadCount,
        };
    }

    // Mark a warning as read
    async markAsRead(warningId: string, employeeId: string) {
        const warning = await Warning.findOne({
            _id: warningId,
            employeeId,
        });

        if (!warning) {
            throw ApiError.notFound('Warning not found');
        }

        warning.isRead = true;
        warning.readAt = new Date();
        await warning.save();

        return warning;
    }

    // Dismiss/deactivate a warning (Admin/HR only)
    async dismissWarning(warningId: string, organizationId: string) {
        const warning = await Warning.findOne({
            _id: warningId,
            organizationId,
        });

        if (!warning) {
            throw ApiError.notFound('Warning not found');
        }

        warning.isActive = false;
        await warning.save();

        return warning;
    }

    // Update a warning (Admin/HR only)
    async updateWarning(warningId: string, organizationId: string, input: UpdateWarningInput) {
        const warning = await Warning.findOneAndUpdate(
            { _id: warningId, organizationId },
            input,
            { new: true }
        );

        if (!warning) {
            throw ApiError.notFound('Warning not found');
        }

        return warning;
    }

    // Get warning counts for dashboard
    async getWarningCounts(employeeId: string) {
        const [total, unread] = await Promise.all([
            Warning.countDocuments({ employeeId, isActive: true }),
            Warning.countDocuments({ employeeId, isActive: true, isRead: false }),
        ]);

        return { total, unread };
    }
}

export const warningService = new WarningService();
