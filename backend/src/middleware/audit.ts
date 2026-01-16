import prisma from '../config/database.js';
import { AuthRequest } from './auth.js';
import { Response, NextFunction } from 'express';

interface AuditContext {
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
}

export const createAuditLog = async (
    organizationId: string,
    userId: string | undefined,
    context: AuditContext,
    req: AuthRequest
) => {
    try {
        await prisma.auditLog.create({
            data: {
                organizationId,
                userId,
                action: context.action,
                entityType: context.entityType,
                entityId: context.entityId,
                oldValues: context.oldValues,
                newValues: context.newValues,
                metadata: context.metadata,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main operation
    }
};

export const auditMiddleware = (action: string, entityType: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        // Store original send function
        const originalSend = res.send;

        res.send = function (body: any) {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const bodyData = typeof body === 'string' ? JSON.parse(body) : body;

                createAuditLog(
                    req.user.organizationId,
                    req.user.userId,
                    {
                        action,
                        entityType,
                        entityId: bodyData?.data?.id || req.params.id,
                        newValues: req.method !== 'GET' ? req.body : undefined,
                    },
                    req
                );
            }

            return originalSend.call(this, body);
        };

        next();
    };
};
