// Script to create Employee profiles for users who don't have one
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Employee, UserRole } from './models/index.js';

dotenv.config();

async function createMissingEmployeeProfiles() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems');
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let created = 0;
        let skipped = 0;

        for (const user of users) {
            // Check if employee profile already exists
            const existingEmployee = await Employee.findOne({ userId: user._id });

            if (existingEmployee) {
                console.log(`⏭️  Skipping ${user.email} - already has employee profile`);
                skipped++;
                continue;
            }

            // Get user's role
            const userRole = await UserRole.findOne({ userId: user._id }).populate('roleId');
            const roleName = (userRole?.roleId as any)?.name || 'Employee';

            // Determine designation based on role
            let designation = 'Employee';
            if (roleName.toLowerCase().includes('admin')) {
                designation = 'Administrator';
            } else if (roleName.toLowerCase().includes('hr')) {
                designation = 'HR Manager';
            }

            // Create employee profile with correct field names matching IEmployee interface
            const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;
            await Employee.create({
                userId: user._id,
                organizationId: user.organizationId,
                employeeId, // Correct field name (not employeeCode)
                firstName: user.firstName,
                lastName: user.lastName || '',
                email: user.email,
                status: 'ACTIVE',
                joinDate: user.createdAt || new Date(), // Correct field name (not hireDate)
                designation, // Correct field name (not position)
            });

            console.log(`✅ Created employee profile for ${user.email} (${designation})`);
            created++;
        }

        console.log('\n========================================');
        console.log(`Created: ${created} employee profiles`);
        console.log(`Skipped: ${skipped} (already had profiles)`);
        console.log('========================================');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

createMissingEmployeeProfiles();
