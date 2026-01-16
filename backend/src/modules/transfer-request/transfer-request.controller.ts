import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { transferRequestService } from './transfer-request.service.js';
import { createTransferRequestSchema, reviewTransferRequestSchema } from './transfer-request.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';

export class TransferRequestController {
    /**
     * Create a transfer request with offer letter upload
     */
    async createRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = createTransferRequestSchema.parse(req.body);

            // Check if file was uploaded
            if (!req.file) {
                throw ApiError.badRequest('Offer letter document is required');
            }

            const offerLetterUrl = `/uploads/offer-letters/${req.file.filename}`;

            const request = await transferRequestService.createRequest(
                req.user!.userId,
                req.user!.organizationId,
                input,
                offerLetterUrl
            );

            res.status(201).json({
                success: true,
                message: 'Transfer request submitted successfully',
                data: request,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Get user's own transfer requests
     */
    async getMyRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const requests = await transferRequestService.getMyRequests(req.user!.userId);

            res.json({
                success: true,
                data: requests,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get incoming transfer requests (for HR/Admin)
     */
    async getIncomingRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const requests = await transferRequestService.getIncomingRequests(req.user!.organizationId);

            res.json({
                success: true,
                data: requests,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a specific transfer request
     */
    async getRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const request = await transferRequestService.getRequest(req.params.id);

            if (!request) {
                throw ApiError.notFound('Transfer request not found');
            }

            res.json({
                success: true,
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Preview/download offer letter document
     */
    async getDocument(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const request = await transferRequestService.getRequest(req.params.id);

            if (!request) {
                throw ApiError.notFound('Transfer request not found');
            }

            // Only allow access to HR/Admin of target org or the requester
            const targetOrgId = (request.toOrganizationId as any)._id?.toString() || request.toOrganizationId.toString();
            const requesterId = (request.userId as any)._id?.toString() || request.userId.toString();

            const isTargetOrgAdmin = targetOrgId === req.user!.organizationId;
            const isRequester = requesterId === req.user!.userId;

            if (!isTargetOrgAdmin && !isRequester) {
                throw ApiError.forbidden('You do not have access to this document');
            }

            const filePath = path.join(process.cwd(), request.offerLetterUrl);

            if (!fs.existsSync(filePath)) {
                throw ApiError.notFound('Document not found');
            }

            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve transfer request
     */
    async approveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const request = await transferRequestService.approveRequest(
                req.params.id,
                req.user!.userId
            );

            res.json({
                success: true,
                message: 'Transfer request approved. Employee has been transferred.',
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject transfer request
     */
    async rejectRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { rejectionReason } = reviewTransferRequestSchema.parse(req.body);

            const request = await transferRequestService.rejectRequest(
                req.params.id,
                req.user!.userId,
                rejectionReason
            );

            res.json({
                success: true,
                message: 'Transfer request rejected',
                data: request,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Cancel pending transfer request
     */
    async cancelRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const request = await transferRequestService.cancelRequest(
                req.params.id,
                req.user!.userId
            );

            res.json({
                success: true,
                message: 'Transfer request cancelled',
                data: request,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const transferRequestController = new TransferRequestController();
