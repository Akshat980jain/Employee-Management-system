/**
 * Audit Logging Middleware
 * 
 * This middleware creates audit logs for API operations.
 * Note: Audit logs are stored in the audit_logs collection.
 */

import mongoose from 'mongoose';
import { AuthRequest } from './auth.js';
import { Response, NextFunction } from 'express';

// Define a simple audit log schema for this middleware
const AuditLogSchema = new mongoose.Schema({
    organizationId: { type: String, required: true },
    userId: String,
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: String,
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

// Create or get the model
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

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
        await AuditLog.create({
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
