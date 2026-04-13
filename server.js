require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── State ───────────────────────────────────────────────
let connectedStudents = {};
let moodHistory = [];
let latestMoodData = null;

// ─── REST API ────────────────────────────────────────────

// Faculty login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.FACULTY_USER || 'faculty';
  const validPass = process.env.FACULTY_PASS || 'admin123';

  if (username === validUser && password === validPass) {
    return res.json({ success: true, message: 'Login successful' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// ELI5 explanation endpoint
app.post('/api/eli5', async (req, res) => {
  const { topic } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ success: false, message: 'Topic is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`📝 ELI5 request for topic: "${topic}" | API Key present: ${!!(apiKey && apiKey.trim())}`);

  if (apiKey && apiKey.trim() !== '') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Explain the following topic in a very simple way, as if explaining to a 5-year-old child. Use simple analogies, short sentences, and make it fun and engaging. Keep it under 150 words.\n\nTopic: ${topic}`;

      // Retry logic for rate limiting (429 errors)
      const MAX_RETRIES = 3;
      let lastError = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`🤖 Gemini attempt ${attempt}/${MAX_RETRIES}...`);
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          console.log(`✅ Gemini responded successfully on attempt ${attempt}`);
          return res.json({ success: true, explanation: text, source: 'gemini' });
        } catch (err) {
          lastError = err;
          console.error(`❌ Attempt ${attempt} failed: ${err.message}`);

          // If rate limited (429), wait and retry
          if (err.message && err.message.includes('429') && attempt < MAX_RETRIES) {
            const waitMs = attempt * 5000; // 5s, 10s, 15s
            console.log(`⏳ Rate limited. Waiting ${waitMs / 1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
          } else if (attempt >= MAX_RETRIES) {
            break;
          }
        }
      }

      console.error('❌ All Gemini attempts failed:', lastError?.message);
      return res.json({
        success: true,
        explanation: `⚠️ The AI is temporarily rate-limited. Here's a basic explanation:\n\n${generateMockExplanation(topic)}`,
        source: 'mock-ratelimited'
      });
    } catch (err) {
      console.error('❌ Gemini API critical error:', err.message);
      return res.json({ success: true, explanation: generateMockExplanation(topic), source: 'mock-error' });
    }
  } else {
    console.log('ℹ️ No Gemini API key — using mock explanation');
    return res.json({ success: true, explanation: generateMockExplanation(topic), source: 'mock' });
  }
});

function generateMockExplanation(topic) {
  const explanations = {
    default: `Okay, let me explain "${topic}" in a super simple way! 🌟\n\nImagine you have a big box of LEGOs. Each LEGO piece is like a tiny bit of information about "${topic}". When you put all the pieces together the right way, you build something amazing!\n\nThe key idea is that ${topic} works by breaking big problems into smaller, easier pieces — just like how you eat a pizza one slice at a time, not the whole thing at once! 🍕\n\nThe cool part? Once you understand the small pieces, the big picture makes total sense!\n\n💡 Think of it like this: ${topic} is like a recipe. You follow the steps one by one, and at the end, you get something wonderful!`,
    
    'photosynthesis': `Plants are like little chefs! ☀️🌱\n\nThey take sunlight (like turning on a stove), water (from the ground), and air (CO₂) and cook them together to make their own food — sugar!\n\nAnd guess what? While they're cooking, they breathe out oxygen — the air WE need to breathe! So plants feed themselves AND help us breathe. Pretty cool, right? 🌿`,
    
    'gravity': `You know how when you throw a ball up, it always comes back down? 🏀\n\nThat's gravity! It's like the Earth is a giant magnet that pulls everything toward it. The bigger something is, the more it pulls.\n\nThat's why we stay on the ground instead of floating away into space! The Earth is SO big that it pulls us gently toward it all the time. 🌍`,
    
    'electricity': `Imagine tiny invisible balls running super fast through wires — like water flowing through a hose! 💡\n\nThese tiny balls are called electrons. When they run through wires, they carry energy. That energy can light up bulbs, power your TV, and charge your phone!\n\nA battery is like a pump that pushes these tiny balls through the wire. No pump = no flow = no power! ⚡`
  };

  const lowerTopic = topic.toLowerCase().trim();
  return explanations[lowerTopic] || explanations.default;
}

// ─── Socket.IO ───────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Student joins
  socket.on('studentJoin', (studentInfo) => {
    connectedStudents[socket.id] = {
      ...studentInfo,
      joinedAt: new Date().toISOString()
    };
    console.log(`👨‍🎓 Student joined: ${studentInfo.name} (${studentInfo.rollNo})`);
    io.emit('studentList', Object.values(connectedStudents));
  });

  // Faculty joins
  socket.on('facultyJoin', () => {
    socket.join('faculty');
    console.log('👩‍🏫 Faculty joined dashboard');
    // Send current state
    socket.emit('studentList', Object.values(connectedStudents));
    if (latestMoodData) {
      socket.emit('updateDashboard', latestMoodData);
    }
  });

  // Receive mood data from student
  socket.on('sendMood', (data) => {
    console.log(`📊 Mood data received — Faces: ${data.faces}, Percentages:`, data.percentages);

    const moodData = {
      ...data,
      timestamp: new Date().toISOString(),
      studentId: socket.id,
      studentInfo: connectedStudents[socket.id] || {}
    };

    latestMoodData = moodData;
    moodHistory.push(moodData);

    // Keep only last 100 entries
    if (moodHistory.length > 100) {
      moodHistory = moodHistory.slice(-100);
    }

    // Broadcast to ALL connected clients (faculty dashboards)
    io.emit('updateDashboard', moodData);
    console.log(`📡 Broadcasting updateDashboard to all clients`);

    // AI Suggestion logic
    const suggestion = generateSuggestion(data);
    if (suggestion) {
      console.log(`🤖 AI Suggestion: ${suggestion.message}`);
      io.emit('suggestion', {
        message: suggestion.message,
        type: suggestion.type,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (connectedStudents[socket.id]) {
      console.log(`👋 Student disconnected: ${connectedStudents[socket.id].name}`);
      delete connectedStudents[socket.id];
      io.emit('studentList', Object.values(connectedStudents));
    }
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── AI Suggestion Engine ────────────────────────────────

let lastSuggestionTime = 0;
const SUGGESTION_COOLDOWN = 8000; // 8 seconds between suggestions
let lastSuggestionType = '';

function generateSuggestion(moodData) {
  const now = Date.now();
  if (now - lastSuggestionTime < SUGGESTION_COOLDOWN) return null;

  const pcts = moodData.percentages || {};
  const interested = pcts.interested || 0;
  const confused = pcts.confused || 0;
  const bored = pcts.bored || 0;
  const neutral = pcts.neutral || 0;

  let suggestion = null;

  if (confused > 40) {
    suggestion = {
      message: '⚠️ Over 40% of students seem confused. Consider revising the current topic or providing additional examples.',
      type: 'warning'
    };
  } else if (bored > 40) {
    suggestion = {
      message: '💡 Engagement is dropping — over 40% appear bored. Try making the class more interactive with a quick activity or discussion.',
      type: 'alert'
    };
  } else if (bored + confused > 60) {
    suggestion = {
      message: '🔄 Major attention drop detected! Consider taking a short break or switching to a hands-on activity.',
      type: 'critical'
    };
  } else if (interested >= 50) {
    suggestion = {
      message: '✅ Great pace! Students are highly engaged. Continue your current teaching approach.',
      type: 'positive'
    };
  } else if (neutral >= 50) {
    suggestion = {
      message: '😐 Most students appear neutral. Try asking a thought-provoking question to boost engagement.',
      type: 'info'
    };
  } else if (interested > 0 || confused > 0 || bored > 0 || neutral > 0) {
    // Mixed moods — provide general feedback
    const dominant = Object.entries({ interested, confused, bored, neutral })
      .sort((a, b) => b[1] - a[1])[0];
    const messages = {
      interested: '📗 Students showing interest! Good momentum — keep it up.',
      confused: '📙 Some confusion detected. Consider pausing for a quick recap.',
      bored: '📕 Signs of disengagement. A quick poll or group activity might help.',
      neutral: '📘 Class mood is neutral. Try an engaging example or story to liven things up.'
    };
    suggestion = {
      message: messages[dominant[0]],
      type: dominant[0] === 'interested' ? 'positive' : dominant[0] === 'confused' ? 'warning' : dominant[0] === 'bored' ? 'alert' : 'info'
    };
  }

  // Don't repeat the exact same suggestion type consecutively
  if (suggestion && suggestion.type === lastSuggestionType) {
    return null;
  }

  if (suggestion) {
    lastSuggestionTime = now;
    lastSuggestionType = suggestion.type;
  }

  return suggestion;
}

// ─── Start Server ────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🎓 Smart Classroom AI System Running      ║
  ║   📡 http://localhost:${PORT}                  ║
  ║                                              ║
  ║   Roles:                                     ║
  ║   👨‍🎓 Student  → /student.html               ║
  ║   👩‍🏫 Faculty  → /faculty.html               ║
  ╚══════════════════════════════════════════════╝
  `);
});
