import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { joinRequestService } from './join-request.service.js';
import { ReviewJoinRequestInput } from './join-request.dto.js';

export class JoinRequestController {
    /**
     * Get all join requests for the organization
     */
    async getRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const organizationId = req.user!.organizationId;
            const { status } = req.query;

            const requests = await joinRequestService.getPendingRequests(
                organizationId,
                status as string
            );

            res.json({
                success: true,
                data: requests,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get request counts for dashboard
     */
    async getRequestCounts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const organizationId = req.user!.organizationId;
            const counts = await joinRequestService.getRequestCounts(organizationId);

            res.json({
                success: true,
                data: counts,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's own join requests
     */
    async getMyRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const requests = await joinRequestService.getMyRequests(userId);

            res.json({
                success: true,
                data: requests,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve a join request
     */
    async approveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const reviewerId = req.user!.userId;

            const request = await joinRequestService.approveRequest(id, reviewerId);

            res.json({
                success: true,
                message: 'Join request approved successfully',
                data: request,
            });
        } catch (error: any) {
            console.error('❌ Error approving join request:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });
            next(error);
        }
    }

    /**
     * Reject a join request
     */
    async rejectRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const reviewerId = req.user!.userId;
            const { rejectionReason } = req.body as ReviewJoinRequestInput;

            const request = await joinRequestService.rejectRequest(id, reviewerId, rejectionReason);

            res.json({
                success: true,
                message: 'Join request rejected',
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const joinRequestController = new JoinRequestController();
