import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, Role } from '../models/index.js';
import { ApiError } from './errorHandler.js';

export interface JwtPayload {
    userId: string;
    email: string;
    organizationId: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
    permissions?: string[];
    file?: any;
    files?: any;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access token required');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw ApiError.unauthorized('Access token required');
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET || 'default-secret'
        ) as JwtPayload;

        // Verify user still exists and is active
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw ApiError.unauthorized('User not found or inactive');
        }

        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            throw ApiError.unauthorized('Account is locked');
        }

        // Get user roles and extract permissions
        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
        const permissions = new Set<string>();

        for (const ur of userRoles) {
            const role = ur.roleId as any;
            if (role && role.permissions) {
                role.permissions.forEach((p: string) => permissions.add(p));
            }
        }

        req.user = decoded;
        req.permissions = Array.from(permissions);

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(ApiError.unauthorized('Token expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(ApiError.unauthorized('Invalid token'));
        } else {
            next(error);
        }
    }
};

export const authorize = (...requiredPermissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.permissions) {
            return next(ApiError.forbidden('No permissions found'));
        }

        // Check if user has wildcard admin permission
        if (req.permissions.includes('*:*')) {
            return next();
        }

        const hasPermission = requiredPermissions.every(permission =>
            req.permissions!.includes(permission)
        );

        if (!hasPermission) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }

        next();
    };
};

export const authorizeAny = (...requiredPermissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.permissions) {
            return next(ApiError.forbidden('No permissions found'));
        }

        if (req.permissions.includes('*:*')) {
            return next();
        }

        const hasAnyPermission = requiredPermissions.some(permission =>
            req.permissions!.includes(permission)
        );

        if (!hasAnyPermission) {
            return next(ApiError.forbidden('Insufficient permissions'));
        }

        next();
    };
};
