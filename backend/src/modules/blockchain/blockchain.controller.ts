import { Response, NextFunction } from 'express';
import { blockchainService } from './blockchain.service.js';
import {
    anchorRecordSchema,
    batchAnchorSchema,
    verifyRecordSchema,
    transactionFilterSchema,
    certificateSchema,
    type RecordType
} from './blockchain.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

/**
 * Blockchain Controller
 * Handles API requests for blockchain operations
 */
export class BlockchainController {
    /**
     * Anchor a record to the blockchain
     * POST /api/blockchain/anchor
     */
    async anchorRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = anchorRecordSchema.parse(req.body);

            const result = await blockchainService.anchorRecord(
                input.recordType,
                input.recordId,
                req.user!.organizationId
            );

            res.status(201).json({
                success: true,
                message: 'Record anchored to blockchain successfully',
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Batch anchor multiple records
     * POST /api/blockchain/batch-anchor
     */
    async batchAnchor(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = batchAnchorSchema.parse(req.body);

            const result = await blockchainService.batchAnchor(
                input.recordType,
                input.recordIds,
                req.user!.organizationId
            );

            res.status(201).json({
                success: true,
                message: `${input.recordIds.length} records anchored to blockchain`,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Verify a record against blockchain
     * GET /api/blockchain/verify/:type/:id
     */
    async verifyRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { type, id } = req.params;

            const input = verifyRecordSchema.parse({
                recordType: type.toUpperCase(),
                recordId: id,
            });

            const result = await blockchainService.verifyRecord(
                input.recordType,
                input.recordId
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Get list of blockchain transactions
     * GET /api/blockchain/transactions
     */
    async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const filters = transactionFilterSchema.parse(req.query);

            const result = await blockchainService.getTransactions(
                req.user!.organizationId,
                filters
            );

            res.json({
                success: true,
                data: result.transactions,
                pagination: result.pagination,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Get a single transaction
     * GET /api/blockchain/transactions/:id
     */
    async getTransaction(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const transaction = await blockchainService.getTransaction(
                req.params.id,
                req.user!.organizationId
            );

            res.json({
                success: true,
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate verification certificate
     * POST /api/blockchain/certificate
     */
    async generateCertificate(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const input = certificateSchema.parse(req.body);

            const certificate = await blockchainService.generateCertificate(
                input.transactionId,
                req.user!.organizationId,
                input.expiresInHours
            );

            res.status(201).json({
                success: true,
                message: 'Verification certificate generated',
                data: certificate,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    /**
     * Get blockchain statistics
     * GET /api/blockchain/stats
     */
    async getStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const stats = await blockchainService.getStats(req.user!.organizationId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const blockchainController = new BlockchainController();
