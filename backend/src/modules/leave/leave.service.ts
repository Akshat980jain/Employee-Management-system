import { LeaveType, LeaveRequest, Employee } from '../../models/index.js';
import {
    CreateLeaveTypeInput,
    UpdateLeaveTypeInput,
    CreateLeaveRequestInput,
    LeaveRequestFilterInput,
    ApproveRejectInput
} from './leave.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { blockchainService } from '../blockchain/blockchain.service.js';

export class LeaveService {
    // Leave Types
    async getLeaveTypes(organizationId: string) {
        return LeaveType.find({ organizationId }).select('-__v').sort({ name: 1 });
    }

    async createLeaveType(organizationId: string, input: CreateLeaveTypeInput) {
        const existing = await LeaveType.findOne({ code: input.code, organizationId });
        if (existing) {
            throw ApiError.conflict('Leave type with this code already exists');
        }

        return LeaveType.create({
            ...input,
            organizationId,
        });
    }

    async updateLeaveType(leaveTypeId: string, organizationId: string, input: UpdateLeaveTypeInput) {
        return LeaveType.findOneAndUpdate(
            { _id: leaveTypeId, organizationId },
            input,
            { new: true }
        ).select('-__v');
    }

    async deleteLeaveType(leaveTypeId: string, organizationId: string) {
        const hasRequests = await LeaveRequest.countDocuments({ leaveTypeId });
        if (hasRequests > 0) {
            throw ApiError.badRequest('Cannot delete leave type with existing requests');
        }

        await LeaveType.findOneAndDelete({ _id: leaveTypeId, organizationId });
    }

    // Leave Requests
    async getLeaveRequests(organizationId: string, filters?: LeaveRequestFilterInput) {
        const query: any = {};

        if (filters?.employeeId) {
            query.employeeId = filters.employeeId;
        } else {
            const employees = await Employee.find({ organizationId }).select('_id');
            query.employeeId = { $in: employees.map(e => e._id) };
        }

        if (filters?.status) {
            query.status = filters.status;
        }
        if (filters?.leaveTypeId) {
            query.leaveTypeId = filters.leaveTypeId;
        }
        if (filters?.startDate && filters?.endDate) {
            query.startDate = { $gte: new Date(filters.startDate) };
            query.endDate = { $lte: new Date(filters.endDate) };
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const [requests, total] = await Promise.all([
            LeaveRequest.find(query)
                .populate('employeeId', 'firstName lastName employeeId')
                .populate('leaveTypeId', 'name code color')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .select('-__v'),
            LeaveRequest.countDocuments(query),
        ]);

        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createLeaveRequest(employeeId: string, input: CreateLeaveRequestInput) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const leaveType = await LeaveType.findById(input.leaveTypeId);
        if (!leaveType) {
            throw ApiError.notFound('Leave type not found');
        }

        // Calculate days
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Check for overlapping requests
        const overlapping = await LeaveRequest.findOne({
            employeeId,
            status: { $in: ['PENDING', 'APPROVED'] },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            ],
        });

        if (overlapping) {
            throw ApiError.badRequest('Overlapping leave request exists');
        }

        const leaveRequest = await LeaveRequest.create({
            employeeId,
            leaveTypeId: input.leaveTypeId,
            startDate,
            endDate,
            days,
            reason: input.reason,
            attachments: input.attachments,
        });

        // Auto-anchor to blockchain (async, non-blocking)
        this.anchorLeaveToBlockchain(leaveRequest._id.toString(), employee.organizationId.toString());

        return leaveRequest;
    }

    /**
     * Anchor leave request to blockchain asynchronously
     */
    private async anchorLeaveToBlockchain(leaveRequestId: string, organizationId: string): Promise<void> {
        try {
            await blockchainService.anchorLeave(leaveRequestId, organizationId);
            console.log(`[Blockchain] Leave request ${leaveRequestId} anchored successfully`);
        } catch (error) {
            // Log but don't fail the main operation
            console.error(`[Blockchain] Failed to anchor leave request ${leaveRequestId}:`, error);
        }
    }

    async approveRequest(requestId: string, approverId: string, input?: ApproveRejectInput) {
        const request = await LeaveRequest.findById(requestId);
        if (!request) {
            throw ApiError.notFound('Leave request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Request is not pending');
        }

        request.status = 'APPROVED';
        request.approvedBy = approverId;
        request.approvedAt = new Date();
        await request.save();

        // Update employee status if currently on leave
        await Employee.findByIdAndUpdate(request.employeeId, { status: 'ON_LEAVE' });

        // Re-anchor to blockchain with updated status
        const employee = await Employee.findById(request.employeeId);
        if (employee) {
            this.anchorLeaveToBlockchain(request._id.toString(), employee.organizationId.toString());
        }

        return request;
    }

    async rejectRequest(requestId: string, approverId: string, input: ApproveRejectInput) {
        const request = await LeaveRequest.findById(requestId);
        if (!request) {
            throw ApiError.notFound('Leave request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Request is not pending');
        }

        request.status = 'REJECTED';
        request.approvedBy = approverId;
        request.approvedAt = new Date();
        request.rejectionReason = input?.reason;
        await request.save();

        return request;
    }

    async cancelRequest(requestId: string, employeeId: string) {
        const request = await LeaveRequest.findOne({ _id: requestId, employeeId });
        if (!request) {
            throw ApiError.notFound('Leave request not found');
        }

        if (!['PENDING', 'APPROVED'].includes(request.status)) {
            throw ApiError.badRequest('Cannot cancel this request');
        }

        request.status = 'CANCELLED';
        await request.save();

        return request;
    }

    async getBalances(employeeId: string, organizationId: string) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw ApiError.notFound('Employee not found');
        }

        const leaveTypes = await LeaveType.find({ organizationId });
        const currentYear = new Date().getFullYear();

        const balances = await Promise.all(leaveTypes.map(async (lt) => {
            const usedDays = await LeaveRequest.aggregate([
                {
                    $match: {
                        employeeId: employee._id,
                        leaveTypeId: lt._id,
                        status: 'APPROVED',
                        startDate: { $gte: new Date(currentYear, 0, 1) },
                    },
                },
                { $group: { _id: null, total: { $sum: '$days' } } },
            ]);

            const quota = lt.code === 'AL' ? 20 : lt.code === 'SL' ? 10 : 5;
            const used = usedDays[0]?.total || 0;

            return {
                leaveType: { id: lt._id, name: lt.name, code: lt.code },
                quota,
                used,
                remaining: quota - used,
            };
        }));

        return balances;
    }
}

export const leaveService = new LeaveService();
