import { OrganizationTransferRequest, User, Role, UserRole, Employee, Organization } from '../../models/index.js';
import { CreateTransferRequestInput } from './transfer-request.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { emitToOrganization } from '../../config/socket.js';

const EXPIRY_DAYS = 30;

export class TransferRequestService {
    /**
     * Create a transfer request with offer letter
     */
    async createRequest(
        userId: string,
        fromOrganizationId: string,
        input: CreateTransferRequestInput,
        offerLetterUrl: string
    ) {
        // Verify target organization exists
        const targetOrg = await Organization.findById(input.toOrganizationId);
        if (!targetOrg) {
            throw ApiError.notFound('Target organization not found');
        }

        // Check for existing pending request
        const existingRequest = await OrganizationTransferRequest.findOne({
            userId,
            toOrganizationId: input.toOrganizationId,
            status: 'PENDING',
        });

        if (existingRequest) {
            throw ApiError.badRequest('You already have a pending transfer request to this organization');
        }

        // Calculate expiry date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

        const request = await OrganizationTransferRequest.create({
            userId,
            fromOrganizationId,
            toOrganizationId: input.toOrganizationId,
            offerLetterUrl,
            requestedRole: input.requestedRole || 'Employee',
            message: input.message,
            expiresAt,
            status: 'PENDING',
        });

        // Emit real-time event to target organization
        emitToOrganization(
            input.toOrganizationId,
            'transferRequest:new',
            { requestId: request._id }
        );

        return request;
    }

    /**
     * Get user's own transfer requests
     */
    async getMyRequests(userId: string) {
        return OrganizationTransferRequest.find({ userId })
            .populate('fromOrganizationId', 'name slug')
            .populate('toOrganizationId', 'name slug')
            .sort({ createdAt: -1 });
    }

    /**
     * Get incoming transfer requests for an organization (for HR/Admin)
     */
    async getIncomingRequests(organizationId: string) {
        // First, expire any old requests
        await this.expireOldRequests();

        return OrganizationTransferRequest.find({
            toOrganizationId: organizationId,
            status: 'PENDING',
        })
            .populate('userId', 'firstName lastName email avatar')
            .populate('fromOrganizationId', 'name slug')
            .sort({ createdAt: -1 });
    }

    /**
     * Get a specific transfer request
     */
    async getRequest(requestId: string) {
        return OrganizationTransferRequest.findById(requestId)
            .populate('userId', 'firstName lastName email avatar')
            .populate('fromOrganizationId', 'name slug')
            .populate('toOrganizationId', 'name slug')
            .populate('verifiedBy', 'firstName lastName');
    }

    /**
     * Approve transfer request - transfers employee to new organization
     */
    async approveRequest(requestId: string, verifierId: string) {
        const request = await OrganizationTransferRequest.findById(requestId).populate('userId');

        if (!request) {
            throw ApiError.notFound('Transfer request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Transfer request is already processed');
        }

        // Check if expired
        if (new Date() > request.expiresAt) {
            request.status = 'EXPIRED';
            await request.save();
            throw ApiError.badRequest('Transfer request has expired');
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
                'roles:read', 'organization:read', 'reports:read',
            ],
            'Employee': ['attendance:create', 'attendance:read', 'leave:create', 'leave:read'],
        };

        // Get or create role in new organization
        let role = await Role.findOne({
            name: requestedRole,
            organizationId: request.toOrganizationId,
        });

        if (!role) {
            role = await Role.create({
                name: requestedRole,
                description: `${requestedRole} role`,
                isSystem: true,
                organizationId: request.toOrganizationId,
                permissions: rolePermissions[requestedRole] || rolePermissions['Employee'],
            });
        }

        // Deactivate old employee record (if exists)
        await Employee.updateMany(
            { userId: user._id, organizationId: request.fromOrganizationId },
            { status: 'RESIGNED' }
        );

        // Remove old UserRoles for the old organization
        const oldRoles = await Role.find({ organizationId: request.fromOrganizationId });
        const oldRoleIds = oldRoles.map(r => r._id);
        await UserRole.deleteMany({ userId: user._id, roleId: { $in: oldRoleIds } });

        // Create new Employee record (fresh start)
        const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;
        const designation = requestedRole === 'Admin' ? 'Administrator'
            : requestedRole === 'HR Manager' ? 'HR Manager'
                : 'Employee';

        await Employee.create({
            userId: user._id,
            organizationId: request.toOrganizationId,
            employeeId,
            firstName: user.firstName,
            lastName: user.lastName || '',
            email: user.email,
            status: 'ACTIVE',
            joinDate: new Date(),
            designation,
        });

        // Assign new role
        await UserRole.create({
            userId: user._id,
            roleId: role._id,
        });

        // Update user's organizationId
        user.organizationId = request.toOrganizationId;
        await user.save();

        // Update request status
        request.status = 'APPROVED';
        request.verifiedBy = verifierId as any;
        request.verifiedAt = new Date();
        await request.save();

        // Emit events
        emitToOrganization(
            request.toOrganizationId.toString(),
            'transferRequest:approved',
            { requestId: request._id, userId: user._id }
        );

        return request;
    }

    /**
     * Reject transfer request
     */
    async rejectRequest(requestId: string, verifierId: string, reason?: string) {
        const request = await OrganizationTransferRequest.findById(requestId);

        if (!request) {
            throw ApiError.notFound('Transfer request not found');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Transfer request is already processed');
        }

        request.status = 'REJECTED';
        request.verifiedBy = verifierId as any;
        request.verifiedAt = new Date();
        request.rejectionReason = reason;
        await request.save();

        emitToOrganization(
            request.toOrganizationId.toString(),
            'transferRequest:rejected',
            { requestId: request._id }
        );

        return request;
    }

    /**
     * Cancel a pending transfer request (by the requester)
     */
    async cancelRequest(requestId: string, userId: string) {
        const request = await OrganizationTransferRequest.findById(requestId);

        if (!request) {
            throw ApiError.notFound('Transfer request not found');
        }

        if (request.userId.toString() !== userId) {
            throw ApiError.forbidden('You can only cancel your own requests');
        }

        if (request.status !== 'PENDING') {
            throw ApiError.badRequest('Only pending requests can be cancelled');
        }

        request.status = 'CANCELLED';
        await request.save();

        return request;
    }

    /**
     * Expire old requests (called periodically)
     */
    async expireOldRequests() {
        await OrganizationTransferRequest.updateMany(
            {
                status: 'PENDING',
                expiresAt: { $lt: new Date() },
            },
            { status: 'EXPIRED' }
        );
    }
}

export const transferRequestService = new TransferRequestService();
