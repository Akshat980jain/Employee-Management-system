import { JoinRequest, User, Role, UserRole, Employee, Organization } from '../../models/index.js';
import { CreateJoinRequestInput } from './join-request.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { emitToOrganization } from '../../config/socket.js';

export class JoinRequestService {
    /**
     * Get all pending join requests for an organization (for HR/Admin)
     */
    async getPendingRequests(organizationId: string, status?: string) {
        const query: any = { organizationId };
        if (status) {
            query.status = status;
        }

        return JoinRequest.find(query)
            .populate('userId', 'firstName lastName email avatar createdAt')
            .populate('organizationId', 'name slug')
            .populate('reviewedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
    }

    /**
     * Get a user's own join requests
     */
    async getMyRequests(userId: string) {
        return JoinRequest.find({ userId })
            .populate('userId', 'firstName lastName email avatar createdAt')
            .populate('organizationId', 'name slug')
            .sort({ createdAt: -1 });
    }

    /**
     * Get a specific join request
     */
    async getRequest(requestId: string) {
        return JoinRequest.findById(requestId)
            .populate('userId', 'firstName lastName email avatar')
            .populate('organizationId', 'name slug')
            .populate('reviewedBy', 'firstName lastName');
    }

    /**
     * Approve a join request - creates the employee record and updates user
     * Works for all roles: Admin, HR Manager, Employee
     */
    async approveRequest(requestId: string, reviewerId: string) {
        const request = await JoinRequest.findById(requestId).populate('userId');

        if (!request) {
            throw ApiError.notFound('Join request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Join request is already processed');
        }

        const user = await User.findById(request.userId);
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const requestedRole = request.requestedRole || 'Employee';

        // Role permissions map
        const rolePermissions: Record<string, string[]> = {
            'Admin': ['*:*'],
            'HR Manager': [
                'employees:create', 'employees:read', 'employees:update', 'employees:delete',
                'leave:create', 'leave:read', 'leave:approve', 'leave:delete',
                'attendance:read', 'attendance:update',
                'roles:read',
                'organization:read',
                'reports:read',
            ],
            'Employee': ['attendance:create', 'attendance:read', 'leave:create', 'leave:read'],
        };

        // Get or create the role for the organization
        let role = await Role.findOne({
            name: requestedRole,
            organizationId: request.organizationId
        });

        if (!role) {
            // Create role if doesn't exist
            role = await Role.create({
                name: requestedRole,
                description: `${requestedRole} role`,
                isSystem: true,
                organizationId: request.organizationId,
                permissions: rolePermissions[requestedRole] || rolePermissions['Employee'],
            });
        }

        // Create Employee record (check if it already exists first)
        const existingEmployee = await Employee.findOne({
            $or: [
                { userId: user._id },
                { email: user.email }
            ]
        });

        const employeeId = existingEmployee?.employeeId || `EMP${Date.now().toString(36).toUpperCase()}`;
        const designation = requestedRole === 'Admin' ? 'Administrator'
            : requestedRole === 'HR Manager' ? 'HR Manager'
                : 'Employee';

        if (existingEmployee) {
            // Update existing employee record
            existingEmployee.organizationId = request.organizationId;
            existingEmployee.status = 'ACTIVE';
            existingEmployee.designation = designation;
            await existingEmployee.save();
        } else {
            await Employee.create({
                userId: user._id,
                organizationId: request.organizationId,
                employeeId,
                firstName: user.firstName,
                lastName: user.lastName || '-',
                email: user.email,
                status: 'ACTIVE',
                joinDate: new Date(),
                designation,
            });
        }

        // Assign role to user (check if already exists first)
        const existingUserRole = await UserRole.findOne({
            userId: user._id,
            roleId: role._id,
        });

        if (!existingUserRole) {
            await UserRole.create({
                userId: user._id,
                roleId: role._id,
            });
        }

        // Update user - set verified and update organizationId
        user.isVerified = true;
        user.organizationId = request.organizationId;
        user.pendingOrganizationId = undefined;
        await user.save();

        // Update request status
        request.status = 'APPROVED';
        request.reviewedBy = reviewerId as any;
        request.reviewedAt = new Date();
        await request.save();

        // Emit real-time event
        emitToOrganization(
            request.organizationId.toString(),
            'joinRequest:approved',
            { requestId: request._id, userId: user._id }
        );

        return request;
    }

    /**
     * Reject a join request
     */
    async rejectRequest(requestId: string, reviewerId: string, reason?: string) {
        const request = await JoinRequest.findById(requestId);

        if (!request) {
            throw ApiError.notFound('Join request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Join request is already processed');
        }

        request.status = 'REJECTED';
        request.reviewedBy = reviewerId as any;
        request.reviewedAt = new Date();
        request.rejectionReason = reason;
        await request.save();

        // Emit real-time event
        emitToOrganization(
            request.organizationId.toString(),
            'joinRequest:rejected',
            { requestId: request._id }
        );

        return request;
    }

    /**
     * Get counts of requests by status for dashboard
     */
    async getRequestCounts(organizationId: string) {
        const [pending, approved, rejected] = await Promise.all([
            JoinRequest.countDocuments({ organizationId, status: 'PENDING' }),
            JoinRequest.countDocuments({ organizationId, status: 'APPROVED' }),
            JoinRequest.countDocuments({ organizationId, status: 'REJECTED' }),
        ]);

        return { pending, approved, rejected, total: pending + approved + rejected };
    }
}

export const joinRequestService = new JoinRequestService();
