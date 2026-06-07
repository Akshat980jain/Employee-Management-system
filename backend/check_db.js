import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const JoinRequestSchema = new mongoose.Schema({}, { strict: false });
const JoinRequest = mongoose.model('JoinRequest', JoinRequestSchema, 'joinrequests');

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

const OrganizationSchema = new mongoose.Schema({}, { strict: false });
const Organization = mongoose.model('Organization', OrganizationSchema, 'organizations');

async function check() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const orgId = new mongoose.Types.ObjectId('6963824dad4e1a32f365be7b'); // Manoj's Organization
    const pendingRequests = await JoinRequest.find({ organizationId: orgId, status: 'PENDING' })
        .populate('userId', 'firstName lastName email avatar createdAt')
        .lean();
    
    console.log('Populated Pending Requests for Manoj Org:');
    console.log(JSON.stringify(pendingRequests, null, 2));

    await mongoose.disconnect();
}

check().catch(console.error);
