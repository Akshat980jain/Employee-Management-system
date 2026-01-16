import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
    });

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            ...(err.details && { details: err.details }),
        },
    });
};

export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: any;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, details?: any) {
        return new ApiError(message, 400, 'BAD_REQUEST', details);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(message, 401, 'UNAUTHORIZED');
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(message, 403, 'FORBIDDEN');
    }

    static notFound(message: string = 'Resource not found') {
        return new ApiError(message, 404, 'NOT_FOUND');
    }

    static conflict(message: string, details?: any) {
        return new ApiError(message, 409, 'CONFLICT', details);
    }

    static tooManyRequests(message: string = 'Too many requests') {
        return new ApiError(message, 429, 'TOO_MANY_REQUESTS');
    }

    static internal(message: string = 'Internal server error') {
        return new ApiError(message, 500, 'INTERNAL_ERROR');
    }
}
