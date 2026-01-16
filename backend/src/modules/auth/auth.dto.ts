import { z } from 'zod';

export const registerSchema = z.object({
    // Organization details - for creating new organization
    organizationName: z.string().min(2).max(100).optional(),
    industry: z.string().optional(),
    size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
    timezone: z.string().default('UTC'),

    // For joining an existing organization (available to all roles)
    organizationId: z.string().optional(),

    // User details
    email: z.string().email(),
    password: z.string().min(8).max(100)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(1).max(50),
    lastName: z.string().max(50).default(''),

    // Role selection (optional, defaults to Employee)
    role: z.enum(['Admin', 'HR Manager', 'Employee']).optional().default('Employee'),

    // Optional message for join request
    message: z.string().max(500).optional(),
}).refine((data) => {
    // User must provide either organizationId (to join existing) OR organizationName (to create new)
    // At least one must be provided
    if (!data.organizationId && !data.organizationName) {
        return false;
    }
    // Cannot provide both - must choose one path
    if (data.organizationId && data.organizationName) {
        return false;
    }
    // Employees cannot create new organizations - they must join existing ones
    if (data.role === 'Employee' && data.organizationName) {
        return false;
    }
    return true;
}, {
    message: 'Employees must join an existing organization. Only Admin or HR Manager can create new organizations.',
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    deviceInfo: z.string().optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
