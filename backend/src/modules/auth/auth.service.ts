import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { Organization, User, Role, UserRole, Session, LeaveType, Shift, Employee, JoinRequest } from '../../models/index.js';
import { RegisterInput, LoginInput, ResetPasswordInput, GoogleRegisterInput } from './auth.dto.js';
import { sendResetOtpEmail } from '../../utils/mailer.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { emitToOrganization } from '../../config/socket.js';

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30');

// Role permissions map
const ROLE_PERMISSIONS: Record<string, string[]> = {
    'Admin': ['*:*'],
    'HR Manager': [
        'employees:create', 'employees:read', 'employees:update', 'employees:delete',
        'leave:create', 'leave:read', 'leave:approve', 'leave:delete',
        'attendance:read', 'attendance:update',
        'roles:read',
        'organization:read',
        'reports:read',
    ],
    'Employee': ['attendance:create', 'attendance:read', 'leave:create', 'leave:read'],
};

export class AuthService {
    async register(input: RegisterInput) {
        // Check if email already exists
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
            throw ApiError.conflict('Email already registered');
        }

        const selectedRole = input.role || 'Employee';

        // Check if user is joining an existing organization (any role can do this)
        if (input.organizationId) {
            return this.registerJoinRequest(input, selectedRole);
        }

        // Create new organization flow
        return this.registerWithNewOrganization(input, selectedRole);
    }

    /**
     * Register a user who wants to join an existing organization
     * Creates a pending join request that needs existing Admin/HR approval
     * Works for all roles: Admin, HR Manager, Employee
     */
    private async registerJoinRequest(input: RegisterInput, requestedRole: string) {
        // Verify organization exists
        const organization = await Organization.findById(input.organizationId);
        if (!organization) {
            throw ApiError.notFound('Organization not found');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

        // Create user with isVerified = false
        // Use organizationId temporarily, but mark as pending
        const user = await User.create({
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName || '',
            organizationId: organization._id,
            pendingOrganizationId: organization._id,
            isEmailVerified: true,
            isVerified: false, // KEY: Not verified yet - awaiting approval
        });

        // Create join request with the requested role
        const joinRequest = await JoinRequest.create({
            userId: user._id,
            organizationId: organization._id,
            status: 'PENDING',
            requestedRole: requestedRole, // Can be Admin, HR Manager, or Employee
            message: input.message,
        });

        // Emit real-time event for Admin/HR dashboard
        emitToOrganization(
            organization._id.toString(),
            'joinRequest:new',
            {
                requestId: joinRequest._id,
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                requestedRole: requestedRole,
            }
        );

        // Generate tokens (user can still login, but will see pending page)
        const tokens = await this.generateTokens(user._id.toString(), user.email, organization._id.toString());

        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: requestedRole,
                isVerified: false,
            },
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
            },
            pendingVerification: true,
            ...tokens,
        };
    }

    /**
     * Original registration flow - creates new organization
     * Used by Admin and HR Manager roles
     */
    private async registerWithNewOrganization(input: RegisterInput, selectedRole: string) {
        if (!input.organizationName) {
            throw ApiError.badRequest('Organization name is required for Admin/HR Manager registration');
        }

        // Generate organization slug
        const slug = input.organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

        // Create organization
        const organization = await Organization.create({
            name: input.organizationName,
            slug,
            industry: input.industry,
            size: input.size,
            timezone: input.timezone || 'UTC',
        });

        const rolePermissions = ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS['Employee'];

        // Create the selected role if it doesn't exist
        let userRole = await Role.findOne({
            name: selectedRole,
            organizationId: organization._id
        });

        if (!userRole) {
            userRole = await Role.create({
                name: selectedRole,
                description: `${selectedRole} role`,
                isSystem: true,
                organizationId: organization._id,
                permissions: rolePermissions,
            });
        }

        // Also create other standard roles for the organization
        const allRoles = ['Admin', 'HR Manager', 'Employee'];
        for (const roleName of allRoles) {
            if (roleName !== selectedRole) {
                const existingRole = await Role.findOne({
                    name: roleName,
                    organizationId: organization._id
                });
                if (!existingRole) {
                    await Role.create({
                        name: roleName,
                        description: `${roleName} role`,
                        isSystem: true,
                        organizationId: organization._id,
                        permissions: ROLE_PERMISSIONS[roleName] || [],
                    });
                }
            }
        }

        // Create user - Admin/HR are verified by default
        const user = await User.create({
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName || '',
            organizationId: organization._id,
            isEmailVerified: true,
            isVerified: true, // Admin/HR are verified immediately
        });

        // Assign selected role to user
        await UserRole.create({
            userId: user._id,
            roleId: userRole._id,
        });

        // Create employee profile for the user (required for attendance tracking)
        const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;
        await Employee.create({
            userId: user._id,
            organizationId: organization._id,
            employeeId,
            firstName: input.firstName,
            lastName: input.lastName || '',
            email: input.email,
            status: 'ACTIVE',
            joinDate: new Date(),
            designation: selectedRole === 'Admin' ? 'Administrator' : selectedRole === 'HR Manager' ? 'HR Manager' : 'Employee',
        });

        // Create default leave types
        const leaveTypes = [
            { name: 'Annual Leave', code: 'AL', isPaid: true, color: '#4CAF50' },
            { name: 'Sick Leave', code: 'SL', isPaid: true, color: '#F44336' },
            { name: 'Casual Leave', code: 'CL', isPaid: true, color: '#2196F3' },
            { name: 'Unpaid Leave', code: 'UL', isPaid: false, color: '#9E9E9E' },
        ];

        for (const lt of leaveTypes) {
            await LeaveType.create({
                ...lt,
                organizationId: organization._id,
            });
        }

        // Create default shift
        await Shift.create({
            name: 'General Shift',
            organizationId: organization._id,
            startTime: '09:00',
            endTime: '18:00',
            graceMinutes: 15,
            isDefault: true,
        });

        // Generate tokens
        const tokens = await this.generateTokens(user._id.toString(), user.email, organization._id.toString());

        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: selectedRole,
                isVerified: true,
            },
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
            },
            pendingVerification: false,
            ...tokens,
        };
    }

    async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
        const user = await User.findOne({ email: input.email });

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const remainingMinutes = Math.ceil(
                (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
            );
            throw ApiError.unauthorized(
                `Account is locked. Try again in ${remainingMinutes} minutes.`
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

        if (!isValidPassword) {
            // Increment failed attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;

            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION * 60000);
                user.failedLoginAttempts = 0;
                await user.save();
                throw ApiError.unauthorized(
                    `Too many failed attempts. Account locked for ${LOCKOUT_DURATION} minutes.`
                );
            }

            user.failedLoginAttempts = failedAttempts;
            await user.save();

            throw ApiError.unauthorized('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw ApiError.unauthorized('Account is deactivated');
        }

        // Check if user is verified (pending join request approval)
        if (user.isVerified === false) {
            throw ApiError.unauthorized('Your join request is pending approval. Please wait for an administrator to approve your request.');
        }

        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        user.lastLoginIp = ipAddress;
        await user.save();

        // Generate tokens
        const tokens = await this.generateTokens(
            user._id.toString(),
            user.email,
            user.organizationId.toString()
        );

        // Create session
        await Session.create({
            userId: user._id,
            refreshToken: tokens.refreshToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        // Get user roles
        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
        const roles = userRoles.map(ur => (ur.roleId as any)?.name || '');

        // Get organization data
        const organization = await Organization.findById(user.organizationId);

        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: roles[0] || 'Employee',
            },
            organization: organization ? {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
            } : null,
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        const session = await Session.findOne({ refreshToken });

        if (!session) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        if (new Date(session.expiresAt) < new Date()) {
            await Session.deleteOne({ _id: session._id });
            throw ApiError.unauthorized('Refresh token expired');
        }

        const user = await User.findById(session.userId);

        if (!user || !user.isActive) {
            await Session.deleteOne({ _id: session._id });
            throw ApiError.unauthorized('User not found or inactive');
        }

        // Generate new tokens
        const tokens = await this.generateTokens(
            user._id.toString(),
            user.email,
            user.organizationId.toString()
        );

        // Update session with new refresh token
        session.refreshToken = tokens.refreshToken;
        session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await session.save();

        return tokens;
    }

    async logout(refreshToken: string) {
        await Session.deleteOne({ refreshToken });
    }

    async logoutAll(userId: string) {
        await Session.deleteMany({ userId });
    }

    async getSessions(userId: string) {
        return Session.find({ userId }).select('-__v').sort({ createdAt: -1 });
    }

    async terminateSession(userId: string, sessionId: string) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) {
            throw ApiError.notFound('Session not found');
        }
        await Session.findByIdAndDelete(sessionId);
    }

    private async generateTokens(userId: string, email: string, organizationId: string) {
        const accessToken = jwt.sign(
            { userId, email, organizationId },
            process.env.JWT_ACCESS_SECRET || 'default-secret',
            { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
        );

        const refreshToken = uuidv4();

        return { accessToken, refreshToken };
    }

    async forgotPassword(email: string) {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[FORGOT PASSWORD] Requested email not registered: ${email}`);
            return { message: 'Reset code sent if email exists' };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 6);
        user.passwordResetToken = hashedOtp;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        console.log(`[FORGOT PASSWORD] Generated OTP code for ${email}: ${otp}`);

        const sent = await sendResetOtpEmail(user.email, user.firstName, otp);
        if (!sent) {
            console.warn(`[FORGOT PASSWORD FALLBACK] Email failed. Code: ${otp}`);
        }

        return {
            message: 'Verification code sent to your email',
            token: process.env.NODE_ENV !== 'production' ? otp : undefined
        };
    }

    async resetPassword(input: ResetPasswordInput) {
        const user = await User.findOne({ email: input.email });
        if (!user) {
            throw ApiError.notFound('User not found');
        }

        if (!user.passwordResetToken || !user.passwordResetExpires) {
            throw ApiError.badRequest('No password reset requested');
        }

        if (new Date(user.passwordResetExpires) < new Date()) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            throw ApiError.badRequest('Verification code expired');
        }

        const isTokenValid = await bcrypt.compare(input.token, user.passwordResetToken);
        if (!isTokenValid) {
            throw ApiError.unauthorized('Invalid verification code');
        }

        user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.passwordChangedAt = new Date();
        await user.save();

        return { message: 'Password reset successful' };
    }

    async loginWithGoogle(token: string, userAgent?: string, ipAddress?: string) {
        const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        let email: string;

        if (token.split('.').length === 3) {
            // It's a JWT ID Token (from Android or official GoogleLogin component)
            try {
                const audienceList = [
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_ANDROID_CLIENT_ID
                ].filter(Boolean) as string[];

                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    audience: audienceList,
                });
                const payload = ticket.getPayload();
                if (!payload || !payload.email) {
                    throw ApiError.unauthorized('Invalid Google ID token payload');
                }
                email = payload.email;
            } catch (error: any) {
                // If verifyIdToken fails, try the tokeninfo endpoint as fallback
                // This handles cases where SHA-1 fingerprint mismatch causes audience issues
                console.warn('Primary Google ID token verification failed, trying tokeninfo fallback:', error.message);
                try {
                    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
                    if (!tokenInfoResponse.ok) {
                        throw new Error('tokeninfo endpoint returned error');
                    }
                    const tokenInfo = await tokenInfoResponse.json() as any;
                    
                    // Verify the token was issued for our app
                    const validAudiences = [
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_ANDROID_CLIENT_ID
                    ].filter(Boolean);
                    
                    if (!tokenInfo.email) {
                        throw new Error('No email in tokeninfo response');
                    }
                    
                    if (validAudiences.length > 0 && !validAudiences.includes(tokenInfo.aud)) {
                        console.error('Token audience mismatch:', {
                            tokenAud: tokenInfo.aud,
                            expectedAuds: validAudiences.map(a => '***' + (a as string).slice(-10)),
                        });
                        throw new Error('Audience mismatch');
                    }
                    
                    email = tokenInfo.email;
                    console.log('Google token verified via tokeninfo fallback for:', email);
                } catch (fallbackError: any) {
                    console.error('Google ID token verification failed (both methods):', {
                        primaryError: error.message || error,
                        fallbackError: fallbackError.message || fallbackError,
                        configuredClientId: process.env.GOOGLE_CLIENT_ID ? '***' + process.env.GOOGLE_CLIENT_ID.slice(-10) : 'NOT SET',
                        configuredAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ? '***' + process.env.GOOGLE_ANDROID_CLIENT_ID.slice(-10) : 'NOT SET',
                        tokenPreview: token.substring(0, 20) + '...',
                    });
                    throw ApiError.unauthorized('Invalid Google ID token. Please ensure your Google account is properly configured.');
                }
            }
        } else {
            // It's an Access Token (from custom Web OAuth2 button)
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw ApiError.unauthorized('Invalid Google access token');
                }
                const data = await response.json() as any;
                email = data.email;
                if (!email) {
                    throw ApiError.unauthorized('Google access token did not return an email');
                }
            } catch (error: any) {
                throw ApiError.unauthorized('Failed to verify Google access token');
            }
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw ApiError.notFound('No account found matching this Google account. Please contact your administrator.');
        }

        if (!user.isActive) {
            throw ApiError.unauthorized('Account is deactivated');
        }

        if (user.isVerified === false) {
            throw ApiError.unauthorized('Your join request is pending approval. Please wait for an administrator to approve your request.');
        }

        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        user.lastLoginIp = ipAddress;
        await user.save();

        const tokens = await this.generateTokens(
            user._id.toString(),
            user.email,
            user.organizationId.toString()
        );

        await Session.create({
            userId: user._id,
            refreshToken: tokens.refreshToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
        const roles = userRoles.map(ur => (ur.roleId as any)?.name || '');
        const organization = await Organization.findById(user.organizationId);

        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: roles[0] || 'Employee',
            },
            organization: organization ? {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
            } : null,
            ...tokens,
        };
    }
    async registerWithGoogle(input: GoogleRegisterInput, userAgent?: string, ipAddress?: string) {
        const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        let email: string;
        let firstName: string;
        let lastName: string;

        // Verify Google ID token
        try {
            const audienceList = [
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_ANDROID_CLIENT_ID
            ].filter(Boolean) as string[];

            const ticket = await googleClient.verifyIdToken({
                idToken: input.idToken,
                audience: audienceList,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw ApiError.unauthorized('Invalid Google ID token payload');
            }
            email = payload.email;
            firstName = payload.given_name || payload.name?.split(' ')[0] || '';
            lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
        } catch (error: any) {
            if (error instanceof ApiError) throw error;
            // Fallback to tokeninfo endpoint
            console.warn('Primary Google ID token verification failed during registration, trying tokeninfo fallback:', error.message);
            try {
                const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${input.idToken}`);
                if (!tokenInfoResponse.ok) {
                    throw new Error('tokeninfo endpoint returned error');
                }
                const tokenInfo = await tokenInfoResponse.json() as any;
                
                const validAudiences = [
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_ANDROID_CLIENT_ID
                ].filter(Boolean);
                
                if (!tokenInfo.email) {
                    throw new Error('No email in tokeninfo response');
                }
                
                if (validAudiences.length > 0 && !validAudiences.includes(tokenInfo.aud)) {
                    throw new Error('Audience mismatch');
                }
                
                email = tokenInfo.email;
                firstName = tokenInfo.given_name || tokenInfo.name?.split(' ')[0] || '';
                lastName = tokenInfo.family_name || tokenInfo.name?.split(' ').slice(1).join(' ') || '';
                console.log('Google token verified via tokeninfo fallback during registration for:', email);
            } catch (fallbackError: any) {
                console.error('Google ID token verification failed during registration (both methods):', {
                    primaryError: error.message || error,
                    fallbackError: fallbackError.message || fallbackError,
                });
                throw ApiError.unauthorized('Invalid Google ID token. Please ensure your Google account is properly configured.');
            }
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.conflict('Email already registered. Please use Google Login instead.');
        }

        const selectedRole = input.role || 'Employee';

        // Generate a random password hash (user authenticated via Google, no password needed)
        const randomPassword = uuidv4() + 'Aa1!'; // Satisfies password requirements but is never used
        const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

        if (input.organizationId) {
            // Join existing organization flow
            const organization = await Organization.findById(input.organizationId);
            if (!organization) {
                throw ApiError.notFound('Organization not found');
            }

            const user = await User.create({
                email,
                passwordHash,
                firstName,
                lastName,
                organizationId: organization._id,
                pendingOrganizationId: organization._id,
                isEmailVerified: true,
                isVerified: false,
            });

            const joinRequest = await JoinRequest.create({
                userId: user._id,
                organizationId: organization._id,
                status: 'PENDING',
                requestedRole: selectedRole,
                message: input.message,
            });

            emitToOrganization(
                organization._id.toString(),
                'joinRequest:new',
                {
                    requestId: joinRequest._id,
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    requestedRole: selectedRole,
                }
            );

            const tokens = await this.generateTokens(user._id.toString(), user.email, organization._id.toString());

            return {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: selectedRole,
                    isVerified: false,
                },
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                },
                pendingVerification: true,
                ...tokens,
            };
        }

        // Create new organization flow
        if (!input.organizationName) {
            throw ApiError.badRequest('Organization name is required for Admin/HR Manager registration');
        }

        const slug = input.organizationName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

        const organization = await Organization.create({
            name: input.organizationName,
            slug,
            industry: input.industry,
            size: input.size,
            timezone: input.timezone || 'UTC',
        });

        const rolePermissions = ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS['Employee'];

        let userRole = await Role.findOne({
            name: selectedRole,
            organizationId: organization._id
        });

        if (!userRole) {
            userRole = await Role.create({
                name: selectedRole,
                description: `${selectedRole} role`,
                isSystem: true,
                organizationId: organization._id,
                permissions: rolePermissions,
            });
        }

        const allRoles = ['Admin', 'HR Manager', 'Employee'];
        for (const roleName of allRoles) {
            if (roleName !== selectedRole) {
                const existingRole = await Role.findOne({
                    name: roleName,
                    organizationId: organization._id
                });
                if (!existingRole) {
                    await Role.create({
                        name: roleName,
                        description: `${roleName} role`,
                        isSystem: true,
                        organizationId: organization._id,
                        permissions: ROLE_PERMISSIONS[roleName] || [],
                    });
                }
            }
        }

        const user = await User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            organizationId: organization._id,
            isEmailVerified: true,
            isVerified: true,
        });

        await UserRole.create({
            userId: user._id,
            roleId: userRole._id,
        });

        const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;
        await Employee.create({
            userId: user._id,
            organizationId: organization._id,
            employeeId,
            firstName,
            lastName,
            email,
            status: 'ACTIVE',
            joinDate: new Date(),
            designation: selectedRole === 'Admin' ? 'Administrator' : selectedRole === 'HR Manager' ? 'HR Manager' : 'Employee',
        });

        const leaveTypes = [
            { name: 'Annual Leave', code: 'AL', isPaid: true, color: '#4CAF50' },
            { name: 'Sick Leave', code: 'SL', isPaid: true, color: '#F44336' },
            { name: 'Casual Leave', code: 'CL', isPaid: true, color: '#2196F3' },
            { name: 'Unpaid Leave', code: 'UL', isPaid: false, color: '#9E9E9E' },
        ];

        for (const lt of leaveTypes) {
            await LeaveType.create({
                ...lt,
                organizationId: organization._id,
            });
        }

        await Shift.create({
            name: 'General Shift',
            organizationId: organization._id,
            startTime: '09:00',
            endTime: '18:00',
            graceMinutes: 15,
            isDefault: true,
        });

        const tokens = await this.generateTokens(user._id.toString(), user.email, organization._id.toString());

        await Session.create({
            userId: user._id,
            refreshToken: tokens.refreshToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return {
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: selectedRole,
                isVerified: true,
            },
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
            },
            pendingVerification: false,
            ...tokens,
        };
    }
}

export const authService = new AuthService();
