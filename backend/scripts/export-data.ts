/**
 * MongoDB Data Export Script
 * Run with: npx tsx scripts/export-data.ts
 * 
 * Exports all collections to JSON files in the /backup folder
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'backup');

async function exportData() {
    console.log('🔄 Starting data export...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established');
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections\n`);

    const exportSummary: Record<string, number> = {};

    for (const collection of collections) {
        const collectionName = collection.name;
        const data = await db.collection(collectionName).find({}).toArray();

        const filePath = path.join(BACKUP_DIR, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        exportSummary[collectionName] = data.length;
        console.log(`  ✅ ${collectionName}: ${data.length} documents`);
    }

    // Create export metadata
    const metadata = {
        exportDate: new Date().toISOString(),
        mongoUri: mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
        collections: exportSummary,
        totalDocuments: Object.values(exportSummary).reduce((a, b) => a + b, 0),
    };

    fs.writeFileSync(
        path.join(BACKUP_DIR, '_metadata.json'),
        JSON.stringify(metadata, null, 2)
    );

    console.log('\n========================================');
    console.log(`✅ Export complete!`);
    console.log(`📁 Files saved to: ${BACKUP_DIR}`);
    console.log(`📊 Total documents: ${metadata.totalDocuments}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

exportData().catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
});
