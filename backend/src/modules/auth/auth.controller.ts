import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.dto.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { User, Role, UserRole, Organization } from '../../models/index.js';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const input = registerSchema.parse(req.body);
            const result = await authService.register(input);

            res.status(201).json({
                success: true,
                message: 'Organization registered successfully',
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const input = loginSchema.parse(req.body);
            const result = await authService.login(
                input,
                req.ip,
                req.headers['user-agent']
            );

            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = refreshTokenSchema.parse(req.body);
            const tokens = await authService.refreshToken(refreshToken);

            res.json({
                success: true,
                data: tokens,
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return next(ApiError.badRequest('Validation failed', error.errors));
            }
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await authService.logoutAll(req.user!.userId);

            res.json({
                success: true,
                message: 'Logged out from all devices',
            });
        } catch (error) {
            next(error);
        }
    }

    async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const sessions = await authService.getSessions(req.user!.userId);

            res.json({
                success: true,
                data: sessions,
            });
        } catch (error) {
            next(error);
        }
    }

    async terminateSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await authService.terminateSession(req.user!.userId, req.params.sessionId);

            res.json({
                success: true,
                message: 'Session terminated',
            });
        } catch (error) {
            next(error);
        }
    }

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.user!;

            const user = await User.findById(userId).select('-passwordHash');
            if (!user) {
                throw ApiError.notFound('User not found');
            }

            const organization = await Organization.findById(user.organizationId);

            // Get user roles and permissions
            const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
            const permissions = new Set<string>();
            const roles: any[] = [];

            for (const ur of userRoles) {
                const role = ur.roleId as any;
                if (role) {
                    roles.push({ id: role._id, name: role.name });
                    if (role.permissions) {
                        role.permissions.forEach((p: string) => permissions.add(p));
                    }
                }
            }

            res.json({
                success: true,
                data: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    isActive: user.isActive,
                    organization: organization ? {
                        id: organization._id,
                        name: organization.name,
                        slug: organization.slug,
                        timezone: organization.timezone,
                    } : null,
                    roles,
                    permissions: Array.from(permissions),
                },
            });
        } catch (error) {
            next(error);
        }
    }
    async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw ApiError.badRequest('No file uploaded');
            }

            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            const userId = req.user!.userId;

            await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

            res.json({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatar: avatarUrl
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
