/**
 * MongoDB Data Import Script
 * Run with: npx tsx scripts/import-data.ts
 * 
 * Imports all JSON files from /backup folder to MongoDB
 */

import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'backup');

// Fields that should be converted to ObjectId
const OBJECT_ID_FIELDS = [
    '_id', 'userId', 'organizationId', 'roleId', 'employeeId', 'shiftId',
    'departmentId', 'pendingOrganizationId', 'targetOrganizationId',
    'sourceOrganizationId', 'leaveTypeId', 'approvedBy', 'rejectedBy',
    'createdBy', 'updatedBy', 'managerId', 'hrId', 'adminId'
];

/**
 * Convert string IDs to ObjectIds in document
 */
function convertToObjectId(doc: any): any {
    if (!doc || typeof doc !== 'object') return doc;

    const converted = Array.isArray(doc) ? [...doc] : { ...doc };

    for (const key of Object.keys(converted)) {
        const value = converted[key];

        // Check if this field should be an ObjectId
        if (OBJECT_ID_FIELDS.includes(key) && typeof value === 'string' && value.length === 24) {
            try {
                converted[key] = new ObjectId(value);
            } catch (e) {
                // Keep as string if not a valid ObjectId
            }
        } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            // Recursively convert nested objects
            converted[key] = convertToObjectId(value);
        } else if (Array.isArray(value)) {
            // Handle arrays
            converted[key] = value.map((item: any) =>
                typeof item === 'object' ? convertToObjectId(item) : item
            );
        }
    }

    return converted;
}

async function importData() {
    console.log('🔄 Starting data import...');

    // Check if backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error('❌ Backup directory not found. Run export-data.ts first.');
        process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }

    // Get all JSON files (except metadata)
    const files = fs.readdirSync(BACKUP_DIR).filter(
        f => f.endsWith('.json') && !f.startsWith('_')
    );

    console.log(`📦 Found ${files.length} backup files\n`);

    const importSummary: Record<string, number> = {};

    for (const file of files) {
        const collectionName = file.replace('.json', '');
        const filePath = path.join(BACKUP_DIR, file);
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (rawData.length === 0) {
            console.log(`  ⏭️  ${collectionName}: skipped (empty)`);
            continue;
        }

        // Convert string IDs to ObjectIds
        const data = rawData.map((doc: any) => convertToObjectId(doc));

        // Drop existing collection and insert new data
        try {
            await db.collection(collectionName).drop();
        } catch (e) {
            // Collection might not exist
        }

        await db.collection(collectionName).insertMany(data);
        importSummary[collectionName] = data.length;
        console.log(`  ✅ ${collectionName}: ${data.length} documents imported`);
    }

    console.log('\n========================================');
    console.log(`✅ Import complete!`);
    console.log(`📊 Total documents: ${Object.values(importSummary).reduce((a, b) => a + b, 0)}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

importData().catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
});
