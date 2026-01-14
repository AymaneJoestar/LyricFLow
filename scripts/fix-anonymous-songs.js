
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing. Check .env.local');
    process.exit(1);
}

// Schemas (Must match server.js)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tier: { type: String, default: 'free' },
    avatarUrl: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const songSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    authorName: { type: String, default: 'Anonymous' },
    // We only need these fields for the migration
}, { strict: false }); // strict: false allows us to load docs even if schema doesn't match perfectly

const User = mongoose.model('User', userSchema);
const Song = mongoose.model('Song', songSchema);

async function fixSongs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to DB');

        // Find songs that are "Anonymous"
        const songs = await Song.find({ authorName: 'Anonymous' });
        console.log(`found ${songs.length} anonymous songs.`);

        let fixedCount = 0;

        for (const song of songs) {
            if (!song.userId) continue;

            const user = await User.findById(song.userId);
            if (user) {
                console.log(`Fixing "${song.title}" -> Author: ${user.username}`);
                song.authorName = user.username;
                await song.save();
                fixedCount++;
            } else {
                console.log(`Skipping "${song.title}": User ${song.userId} not found.`);
            }
        }

        console.log(`\n🎉 Done! Fixed ${fixedCount} songs.`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
}

fixSongs();
