
/*
  ===================================================================
  🔴 HOW TO START THIS SERVER:
  ===================================================================
  1. Open your terminal.
  2. Run: npm install express mongoose cors body-parser
  3. Run: node server.js
  ===================================================================
*/

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- MONGODB CONFIGURATION ---
// --- MONGODB CONFIGURATION ---
import dotenv from 'dotenv';
// Use absolute path to ensure .env.local is found
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  console.log('DEBUG: MONGO_URI Type:', typeof MONGO_URI);
  console.log('DEBUG: MONGO_URI Length:', MONGO_URI ? MONGO_URI.length : 0);

  if (!MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is missing. Check .env.local');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('✅ DATABASE CONNECTED: Successfully linked to LyricFlow-Cluster');
    console.log('📂 ACTIVE DATABASE:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ DATABASE ERROR:', err.message);
    console.log('👉 ACTION: Check "Network Access" in MongoDB Atlas and whitelist 0.0.0.0/0');
  }
}

connectDB();

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
    set: (v) => v ? v.toLowerCase() : v // Normalize to lowercase
  },
  avatarUrl: { type: String, default: null },  // NEW: Profile picture
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const Song = mongoose.model('Song', new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  styleDescription: String,
  structure: [{ type: { type: String }, content: String }],
  recommendations: [{ title: String, artist: String, reason: String }],
  audioUrl: { type: String, default: null },
  coverArtUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  // Community Features
  isPublic: { type: Boolean, default: false },
  authorName: { type: String, default: 'Anonymous' },
  averageRating: { type: Number, default: 0 },
  ratings: [{
    userId: String,
    score: Number // 1-5
  }],
  comments: [{
    userId: String,
    username: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    parentCommentId: { type: String, default: null },
    avatarUrl: String  // NEW: Store avatar snapshot
  }]
}));

// --- ROUTES ---

// Helper function to get audio limit by tier
function getAudioLimit(tier) {
  return tier === 'pro' ? 10 : 1;
}

// Vital for the frontend to detect the server
app.get('/api/health', (req, res) => {
  res.json({
    server: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/error',
    time: new Date().toISOString()
  });
});



app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ id: user._id, username: user.username, email: user.email, tier: user.tier });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and validate credentials
    const user = await User.findOne({ email, password });
    if (!user) {
      console.log(`❌ Failed login attempt for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ Successful login: ${user.username} (${email})`);
    res.json({ id: user._id, username: user.username, email: user.email, tier: user.tier });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/songs', async (req, res) => {
  try {
    const { userId, audioUrl } = req.body;

    // Get user to set authorName
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // LIMIT CHECK: If saving a song with audio, check limit based on tier
    if (audioUrl) {
      const limit = getAudioLimit(user.tier);
      const audioCount = await Song.countDocuments({ userId, audioUrl: { $ne: null } });

      if (audioCount >= limit) {
        return res.status(403).json({
          message: `Audio generation limit reached (${limit} song${limit > 1 ? 's' : ''} max for ${user.tier} tier).`,
          limit,
          current: audioCount,
          tier: user.tier
        });
      }
    }

    // Add authorName from user
    const songData = { ...req.body, authorName: user.username };
    const song = new Song(songData);
    await song.save();
    res.status(201).json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/songs/:id', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    const songId = req.params.id;

    // LIMIT CHECK: If adding audio to an existing song
    if (audioUrl) {
      const currentSong = await Song.findById(songId);
      if (currentSong && !currentSong.audioUrl) { // Only check if adding NEW audio
        const user = await User.findById(currentSong.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const limit = getAudioLimit(user.tier);
        const audioCount = await Song.countDocuments({ userId: currentSong.userId, audioUrl: { $ne: null } });

        if (audioCount >= limit) {
          return res.status(403).json({
            message: `Audio generation limit reached (${limit} song${limit > 1 ? 's' : ''} max for ${user.tier} tier).`,
            limit,
            current: audioCount,
            tier: user.tier
          });
        }
      }
    }

    const song = await Song.findByIdAndUpdate(songId, req.body, { new: true });
    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/songs/:userId', async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upgrade user tier
// Update user profile (email/password)
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newEmail, newPassword, avatarUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Security check: Verify current password ONLY when changing email/password
    if (newEmail || newPassword) {
      if (!currentPassword || user.password !== currentPassword) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }
    }

    // Update fields
    if (newEmail) {
      // Check if email already taken by ANOTHER user
      const existing = await User.findOne({ email: newEmail });
      if (existing && existing._id.toString() !== userId) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = newEmail;
    }

    if (newPassword) {
      user.password = newPassword;
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl; // Allow null/empty to remove avatar
    }

    await user.save();
    res.json({ id: user._id, username: user.username, email: user.email, tier: user.tier, avatarUrl: user.avatarUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get Public User Profile
app.get('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get stats
    const publicSongs = await Song.countDocuments({ userId, isPublic: true });
    const allUserSongs = await Song.find({ userId });
    const totalComments = allUserSongs.reduce((sum, song) => sum + (song.comments?.length || 0), 0);

    res.json({
      id: user._id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      stats: {
        publicSongs,
        totalComments
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get User's Public Songs
app.get('/api/users/:userId/public-songs', async (req, res) => {
  try {
    const { userId } = req.params;
    const songs = await Song.find({ userId, isPublic: true }).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/users/:userId/upgrade', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tier } = req.body;

    // In a real app, verify payment here
    const user = await User.findByIdAndUpdate(userId, { tier }, { new: true });

    // Update all user's songs limits/permissions if needed
    // For now simplistic

    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- COMMUNITY FEATURES ---

// Get Public Feed
app.get('/api/public/songs', async (req, res) => {
  try {
    const { sort } = req.query; // 'new' or 'top'

    let query = Song.find({ isPublic: true });

    if (sort === 'top') {
      query = query.sort({ averageRating: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const songs = await query.limit(50);
    res.json(songs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle Share Status
app.put('/api/songs/:id/share', async (req, res) => {
  try {
    const { isPublic } = req.body;
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    song.isPublic = isPublic;
    await song.save();
    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add Comment
app.post('/api/songs/:id/comment', async (req, res) => {
  try {
    const { userId, username, content, parentCommentId } = req.body;
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const user = await User.findById(userId); // Fetch user for avatar

    const comment = {
      userId,
      username,
      content,
      createdAt: new Date(),
      parentCommentId: parentCommentId || null,
      avatarUrl: user ? user.avatarUrl : null
    };

    song.comments.push(comment);
    await song.save();
    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Comment
app.delete('/api/songs/:id/comment/:commentId', async (req, res) => {
  try {
    const { userId } = req.body; // Verify ownership
    const { id, commentId } = req.params;

    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Find comment
    const comment = song.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Verify ownership
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove comment
    // using pull to remove subdoc
    song.comments.pull(commentId);
    await song.save();

    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Rate Song
app.post('/api/songs/:id/rate', async (req, res) => {
  try {
    const { userId, score } = req.body; // score 1-5
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Check if user already rated
    const existingIndex = song.ratings.findIndex(r => r.userId === userId);
    if (existingIndex >= 0) {
      song.ratings[existingIndex].score = score;
    } else {
      song.ratings.push({ userId, score });
    }

    // Recalculate Average
    const total = song.ratings.reduce((acc, r) => acc + r.score, 0);
    song.averageRating = total / song.ratings.length;

    await song.save();
    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// --- IMAGE GENERATION VIA HUGGING FACE (FREE TIER) ---
app.post('/api/generate-cover-art', async (req, res) => {
  try {
    const { prompt } = req.body;
    const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    if (!HF_API_TOKEN) {
      return res.status(500).json({
        message: 'Hugging Face API token not configured on server. Please add HUGGINGFACE_API_TOKEN to .env.local'
      });
    }

    // Use Stable Diffusion XL via Hugging Face Inference API
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);

      // Check if model is loading
      if (response.status === 503) {
        return res.status(503).json({
          message: 'Model is loading, please try again in 20-30 seconds'
        });
      }

      return res.status(response.status).json({
        message: `Hugging Face API error: ${errorText}`
      });
    }

    // Response is an image blob
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error('Hugging Face API error:', err);
    res.status(500).json({ message: err.message || 'Failed to generate image' });
  }
});

// --- PRODUCTION: SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 LyricFlow Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50) + '\n');
});
