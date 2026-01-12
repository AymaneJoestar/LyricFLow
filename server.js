
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
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://lyric_admin:1LKSsXPuNhAUXE8C@lyricflow-cluster.wrlgdwp.mongodb.net/lyricflow_db?appName=LyricFLow-Cluster";

async function connectDB() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log('✅ DATABASE CONNECTED: Successfully linked to LyricFlow-Cluster');
  } catch (err) {
    console.error('❌ DATABASE ERROR:', err.message);
    console.log('👉 ACTION: Check "Network Access" in MongoDB Atlas and whitelist 0.0.0.0/0');
  }
}

connectDB();

// --- SCHEMAS ---
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

const Song = mongoose.model('Song', new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  styleDescription: String,
  structure: [{ type: { type: String }, content: String }],
  recommendations: [{ title: String, artist: String, reason: String }],
  audioUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---

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
    res.status(201).json({ id: user._id, username: user.username });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ id: user._id, username: user.username });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/songs', async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(song);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/songs/:userId', async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) { res.status(500).json({ message: err.message }); }
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
