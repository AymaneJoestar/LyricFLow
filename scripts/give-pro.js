
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local in the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI not found in .env.local');
    process.exit(1);
}

// Minimal User Schema for the update
const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    tier: String
}, { strict: false })); // strict: false allows us to update without defining the whole schema

async function upgradeUser() {
    const email = process.argv[2];

    if (!email) {
        console.log('\nUsage: node scripts/give-pro.js <email>');
        console.log('Example: node scripts/give-pro.js test@example.com\n');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to Database');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        if (user.tier === 'pro') {
            console.log(`ℹ️  User ${email} is already PRO.`);
        } else {
            user.tier = 'pro';
            await user.save();
            console.log(`🎉 Success! User ${email} has been upgraded to PRO tier.`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

upgradeUser();
