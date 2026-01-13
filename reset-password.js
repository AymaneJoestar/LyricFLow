import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Define User Schema (Simplified)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tier: { type: String, default: 'free' }
});

const User = mongoose.model('User', UserSchema);

const resetPassword = async (email, newPassword) => {
    if (!process.env.MONGO_URI) {
        console.error('❌ Error: MONGO_URI not found in .env.local');
        process.exit(1);
    }

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            console.log('Existing users in database:');
            const allUsers = await User.find({}, 'email');
            allUsers.forEach(u => console.log(` - ${u.email}`));
        } else {
            user.password = newPassword;
            await user.save();
            console.log(`\n✅ SUCCESS! Password for [${email}] has been reset to: "${newPassword}"`);
            console.log('👉 You can now log in with these credentials.');
        }

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
        process.exit(0);
    }
};

// Usage: node reset-password.js <email> <new_password>
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node reset-password.js <email> <new_password>');
    console.log('Example: node reset-password.js admin@test.com mynewpassword123');
    process.exit(1);
}

resetPassword(email, password);
