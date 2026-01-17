import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Define schemas inline for seeding
const organizationSchema = new mongoose.Schema({
    name: String,
    slug: String,
    industry: String,
    size: String,
    timezone: { type: String, default: 'UTC' },
});

const roleSchema = new mongoose.Schema({
    name: String,
    description: String,
    organizationId: mongoose.Schema.Types.ObjectId,
    permissions: [String],
    isSystem: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    passwordHash: String,
    firstName: String,
    lastName: String,
    organizationId: mongoose.Schema.Types.ObjectId,
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
});

const userRoleSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    roleId: mongoose.Schema.Types.ObjectId,
});

const Organization = mongoose.model('Organization', organizationSchema);
const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);
const UserRole = mongoose.model('UserRole', userRoleSchema);

// Role definitions with permissions
const roleDefinitions = [
    {
        name: 'Admin',
        description: 'Full system access',
        permissions: ['*:*'],
    },
    {
        name: 'HR Manager',
        description: 'HR operations and employee management',
        permissions: [
            'employees:create', 'employees:read', 'employees:update', 'employees:delete',
            'leave:create', 'leave:read', 'leave:approve', 'leave:delete',
            'attendance:read', 'attendance:update',
            'roles:read',
            'organization:read',
            'reports:read',
        ],
    },
    {
        name: 'Department Head',
        description: 'Department management and team oversight',
        permissions: [
            'employees:read', 'employees:update',
            'attendance:read', 'attendance:update',
            'leave:read', 'leave:approve',
            'reports:read',
        ],
    },
    {
        name: 'Payroll Admin',
        description: 'Payroll management',
        permissions: [
            'employees:read',
            'payroll:read', 'payroll:update',
            'attendance:read',
            'reports:read',
        ],
    },
    {
        name: 'Recruiter',
        description: 'Hiring and onboarding',
        permissions: [
            'employees:create', 'employees:read', 'employees:update',
        ],
    },
    {
        name: 'Employee',
        description: 'Basic employee access',
        permissions: [
            'attendance:create', 'attendance:read',
            'leave:create', 'leave:read',
        ],
    },
];

// User definitions - email indicates role
const userDefinitions = [
    { email: 'admin@ems.com', firstName: 'Admin', lastName: 'User', role: 'Admin' },
    { email: 'hr@ems.com', firstName: 'HR', lastName: 'Manager', role: 'HR Manager' },
    { email: 'department@ems.com', firstName: 'Department', lastName: 'Head', role: 'Department Head' },
    { email: 'payroll@ems.com', firstName: 'Payroll', lastName: 'Admin', role: 'Payroll Admin' },
    { email: 'recruiter@ems.com', firstName: 'Talent', lastName: 'Recruiter', role: 'Recruiter' },
    { email: 'employee@ems.com', firstName: 'John', lastName: 'Employee', role: 'Employee' },
];

const DEFAULT_PASSWORD = 'Password123!';

async function seed() {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/ems_db';
        await mongoose.connect(dbUrl);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await UserRole.deleteMany({});
        await User.deleteMany({});
        await Role.deleteMany({});
        await Organization.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create organization
        const org = await Organization.create({
            name: 'Demo Company',
            slug: 'demo-company',
            industry: 'Technology',
            size: '50-100',
            timezone: 'UTC',
        });
        console.log('🏢 Created organization:', org.name);

        // Create roles
        const roleMap = new Map<string, any>();
        for (const roleDef of roleDefinitions) {
            const role = await Role.create({
                ...roleDef,
                organizationId: org._id,
                isSystem: true,
            });
            roleMap.set(role.name ?? '', role);
            console.log(`👤 Created role: ${role.name}`);
        }

        // Create users
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

        for (const userDef of userDefinitions) {
            const user = await User.create({
                email: userDef.email,
                passwordHash,
                firstName: userDef.firstName,
                lastName: userDef.lastName,
                organizationId: org._id,
                isActive: true,
                isEmailVerified: true,
            });

            // Assign role
            const role = roleMap.get(userDef.role);
            if (role) {
                await UserRole.create({
                    userId: user._id,
                    roleId: role._id,
                });
            }

            console.log(`✨ Created user: ${userDef.email} (${userDef.role})`);
        }

        console.log('\n🎉 Seed completed successfully!\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('  LOGIN CREDENTIALS');
        console.log('═══════════════════════════════════════════════════');
        console.log('  Password for all users: Password123!');
        console.log('');
        userDefinitions.forEach(u => {
            console.log(`  📧 ${u.email.padEnd(25)} → ${u.role}`);
        });
        console.log('═══════════════════════════════════════════════════\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
