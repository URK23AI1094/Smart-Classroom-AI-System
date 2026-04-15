# 🎓 Smart Classroom AI System

> **An advanced real-time classroom monitoring system that detects student emotions via webcam, broadcasts live mood analytics to faculty dashboards, and provides AI-powered teaching suggestions — all in real-time.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Complete Workflow](#-complete-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Emotion to Mood Mapping](#-emotion-to-mood-mapping)
- [AI Suggestion Engine Rules](#-ai-suggestion-engine-rules)
- [Screenshots](#-screenshots)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Smart Classroom AI System** bridges the gap between students and faculty by providing real-time emotional intelligence in the classroom. Using webcam-based face detection and emotion recognition, the system continuously monitors student engagement levels and presents actionable insights to faculty through a live dashboard.

### 🎯 Problem Statement
Traditional classrooms lack real-time feedback on student engagement. Faculty often can't tell if students are confused, bored, or interested — especially in large classes.

### 💡 Solution
This system uses AI-powered face detection to analyze student emotions in real-time, convert them into meaningful mood metrics, and broadcast them instantly to faculty via WebSockets — enabling data-driven teaching decisions.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Login** | Separate login flows for Students and Faculty with session management |
| 🎥 **Live Webcam Capture** | Automatic webcam activation with real-time video streaming |
| 🧠 **Multi-Face Detection** | Detects multiple faces simultaneously using TensorFlow.js-based AI models |
| 😃 **Emotion Recognition** | Identifies 7 emotions per face: Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral |
| 🔄 **Mood Conversion** | Maps raw emotions to 4 engagement categories: Interested, Confused, Bored, Neutral |
| 📊 **Live Dashboard** | Real-time counters, progress rings, and trend graphs for faculty |
| 📈 **Mood Trend Graph** | Chart.js line graph tracking mood percentages over time |
| 🤖 **AI Suggestion Engine** | Automated teaching suggestions based on mood threshold analysis |
| 📚 **ELI5 Learning Feature** | "Explain Like I'm 5" — students can get simple AI-generated explanations |
| ⚡ **Socket.IO Real-Time** | Zero-delay bidirectional WebSocket communication |
| 🌙 **Premium Dark UI** | Glassmorphism design with animations, gradients, and responsive layout |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SMART CLASSROOM AI                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    WebSocket     ┌──────────────────┐ │
│  │   STUDENT    │ ──────────────── │   NODE.JS SERVER │ │
│  │   BROWSER    │    socket.emit   │   Express +      │ │
│  │              │   ('sendMood')   │   Socket.IO      │ │
│  │  ┌────────┐  │                  │                  │ │
│  │  │Webcam  │  │                  │  ┌────────────┐  │ │
│  │  │  Feed  │  │                  │  │  AI Logic  │  │ │
│  │  └───┬────┘  │                  │  │ Suggestion │  │ │
│  │      │       │                  │  │  Engine    │  │ │
│  │  ┌───▼────┐  │                  │  └─────┬──────┘  │ │
│  │  │face-   │  │                  │        │         │ │
│  │  │api.js  │  │                  │  ┌─────▼──────┐  │ │
│  │  │Detect  │  │                  │  │  Gemini AI │  │ │
│  │  │Faces + │  │                  │  │  (ELI5)    │  │ │
│  │  │Emotion │  │                  │  └────────────┘  │ │
│  │  └───┬────┘  │                  │                  │ │
│  │      │       │                  └────────┬─────────┘ │
│  │  ┌───▼────┐  │                           │           │
│  │  │ Mood   │  │     io.emit              │           │
│  │  │Convert │  │  ('updateDashboard')     │           │
│  │  │  +  %  │  │  ('suggestion')          │           │
│  │  └────────┘  │                  ┌────────▼─────────┐ │
│  └──────────────┘                  │   FACULTY        │ │
│                                    │   DASHBOARD      │ │
│                                    │                  │ │
│                                    │  • Live Counters │ │
│                                    │  • Trend Graph   │ │
│                                    │  • AI Suggestions│ │
│                                    │  • Student List  │ │
│                                    └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow

### Phase-by-Phase Breakdown

```
PHASE 1: LOGIN SYSTEM
    ┌─────────────┐
    │  Login Page  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Select Role │
    └──┬───────┬──┘
       │       │
  Student   Faculty
       │       │
  ┌────▼──┐ ┌──▼─────┐
  │Name   │ │Username│
  │Roll No│ │Password│
  │Class  │ └──┬─────┘
  └──┬────┘    │
     │    API Auth
     │    POST /api/login
     ▼         ▼
  student   faculty
  .html     .html

─────────────────────────────

PHASE 2-5: STUDENT SIDE
  ┌──────────────┐
  │ Webcam Start │ (Auto)
  └──────┬───────┘
         │ Every 2.5 sec
  ┌──────▼───────────┐
  │ face-api.js      │
  │ detectAllFaces() │
  │ + Expressions    │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ For EACH face:   │
  │ Get emotion      │
  │ → Map to mood    │
  │ Happy→Interested │
  │ Sad→Bored        │
  │ Angry→Confused   │
  │ Neutral→Neutral  │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ Calculate %      │
  │ Interested: 40%  │
  │ Confused:   35%  │
  │ Bored:      15%  │
  │ Neutral:    10%  │
  └──────┬───────────┘
         │
  socket.emit('sendMood')
         │
─────────▼───────────────────

PHASE 6: SERVER (REAL-TIME)
  ┌──────────────────┐
  │ Receive Mood Data│
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ io.emit(         │
  │ 'updateDashboard'│
  │  moodData)       │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ Run AI Suggestion│
  │ Logic            │
  └──────┬───────────┘
         │
  io.emit('suggestion')
         │
─────────▼───────────────────

PHASE 7-8: FACULTY DASHBOARD
  ┌──────────────────┐
  │ socket.on(       │
  │ 'updateDashboard'│
  │  data)           │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ Update Live      │
  │ Counters + Rings │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ Update Chart.js  │
  │ Line Graph       │
  │ (Continuous)     │
  └──────┬───────────┘
         │
  ┌──────▼───────────┐
  │ Display AI       │
  │ Suggestions      │
  │ (Real-time)      │
  └──────────────────┘

─────────────────────────────

PHASE 9: ELI5 (PARALLEL)
  Student enters topic
         │
  POST /api/eli5
         │
  ┌──────▼───────────┐
  │ Gemini AI API    │
  │ (or Mock Engine) │
  └──────┬───────────┘
         │
  Simple Explanation
  displayed to student
  with typewriter effect
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | UI structure, styling, and client-side logic |
| **Backend** | Node.js + Express.js | REST API server and static file hosting |
| **Real-Time** | Socket.IO | Bidirectional WebSocket communication for instant data transfer |
| **Face Detection** | face-api.js (TensorFlow.js) | In-browser multi-face detection using TinyFaceDetector model |
| **Emotion Detection** | face-api.js `faceExpressionNet` | Detects 7 facial expressions per face in real-time |
| **Data Visualization** | Chart.js | Interactive line graphs for mood trend tracking |
| **AI / ELI5** | Google Gemini API (Free Tier) | AI-powered simple explanations for student learning |
| **Design** | Custom CSS (Glassmorphism) | Premium dark-mode UI with animations and responsive layout |
| **Typography** | Google Fonts (Inter) | Modern, clean font family |

### 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "socket.io": "^4.7.4",
  "dotenv": "^16.4.1",
  "@google/generative-ai": "latest"
}
```

### 🌐 CDN Libraries (No Install Required)

| Library | Version | Loaded From |
|---|---|---|
| face-api.js | 0.22.2 | jsDelivr CDN |
| Chart.js | 4.4.1 | jsDelivr CDN |
| Socket.IO Client | Auto | Served by Socket.IO server |

---

## 📁 Project Structure

```
Smart Classroom AI/
│
├── server.js                    # 🖥 Main server (Express + Socket.IO + AI Engine)
├── package.json                 # 📦 Dependencies and scripts
├── .env                         # 🔑 Environment variables (API keys, credentials)
├── .gitignore                   # 🚫 Git ignore rules
├── start.bat                    # 🚀 Double-click to start server (Windows)
├── README.md                    # 📖 Project documentation (this file)
│
└── public/                      # 🌐 Static frontend files
    │
    ├── index.html               # 🔐 Login page (Student / Faculty)
    ├── student.html             # 🎥 Student camera + mood stats + ELI5
    ├── faculty.html             # 📊 Faculty live dashboard
    │
    ├── css/
    │   └── styles.css           # 🎨 Complete design system (dark mode, glass, animations)
    │
    └── js/
        ├── login.js             # 🔐 Login logic + role-based routing
        ├── student.js           # 🧠 Webcam, face detection, mood calculation, socket emit
        ├── faculty.js           # 📊 Dashboard, Chart.js, socket listeners, counters
        └── eli5.js              # 🤖 ELI5 client-side logic + typewriter effect
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **Modern Browser** (Chrome/Edge/Firefox) with webcam access
- **Gemini API Key** (optional, for AI-powered ELI5) — [Get Free Key](https://aistudio.google.com/)

### Step-by-Step Setup

```bash
# 1. Clone or navigate to the project
cd "d:\Mini project"

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Edit .env file with your credentials:
#    - FACULTY_USER=your_username
#    - FACULTY_PASS=your_password
#    - GEMINI_API_KEY=your_key (optional)

# 4. Start the server
node server.js

# 5. Open in browser
#    http://localhost:3000
```

### Quick Start (Windows)
Simply **double-click `start.bat`** — it will start the server automatically!

---

## 📖 Usage Guide

### 👨‍🎓 Student Flow
1. Open `http://localhost:3000` in your browser
2. Select **Student** tab
3. Enter your **Name**, **Roll Number**, and **Class**
4. Click **"Enter Classroom"**
5. Allow **camera access** when prompted
6. The system will automatically:
   - Start the webcam
   - Load AI face detection models (~5 seconds first time)
   - Detect faces every 2.5 seconds
   - Show emotion labels and bounding boxes
   - Display mood percentages locally
   - Send mood data to server via Socket.IO
7. Use the **ELI5 section** to get simple explanations for any topic

### 👩‍🏫 Faculty Flow
1. Open `http://localhost:3000` in a **new tab/browser**
2. Select **Faculty** tab
3. Enter **Username** and **Password**
4. Click **"Access Dashboard"**
5. The dashboard shows:
   - **Live Mood Counters** with animated progress rings
   - **Mood Trend Graph** updating in real-time
   - **AI Teaching Suggestions** based on mood patterns
   - **Connected Students** list with names and details

---

## 😃 Emotion to Mood Mapping

| Detected Expression | Mapped Mood | Category Color | Emoji |
|---|---|---|---|
| Happy | ✨ Interested | 🟢 Green `#10b981` | 😊 |
| Surprised | ✨ Interested | 🟢 Green `#10b981` | 😮 |
| Sad | 😴 Bored | 🩷 Pink `#ec4899` | 😢 |
| Disgusted | 😴 Bored | 🩷 Pink `#ec4899` | 🤢 |
| Fearful | 🤔 Confused | 🟠 Orange `#f59e0b` | 😨 |
| Angry | 🤔 Confused | 🟠 Orange `#f59e0b` | 😠 |
| Neutral | 😐 Neutral | 🔵 Cyan `#06b6d4` | 😐 |

### How Percentage is Calculated

```
For each video frame (every 2.5 seconds):
  1. Detect all faces in frame
  2. Get dominant emotion per face
  3. Map each emotion → mood category
  4. Count faces per mood category
  5. Calculate: mood_% = (faces_in_mood / total_faces) × 100

Example with 4 faces detected:
  Face 1: Happy → Interested
  Face 2: Neutral → Neutral
  Face 3: Sad → Bored
  Face 4: Happy → Interested

  Result:
    Interested: 50% (2/4 faces)
    Neutral:    25% (1/4 faces)
    Bored:      25% (1/4 faces)
    Confused:    0% (0/4 faces)
```

---

## 🤖 AI Suggestion Engine Rules

The server continuously monitors incoming mood data and generates teaching suggestions when thresholds are crossed:

| Condition | Suggestion | Type |
|---|---|---|
| Confused > 40% | ⚠️ "Consider revising the current topic or providing additional examples." | Warning |
| Bored > 40% | 💡 "Try making the class more interactive with a quick activity or discussion." | Alert |
| Bored + Confused > 60% | 🔄 "Major attention drop! Consider a short break or hands-on activity." | Critical |
| Interested ≥ 50% | ✅ "Great pace! Students are highly engaged. Continue current approach." | Positive |
| Neutral ≥ 50% | 😐 "Try asking a thought-provoking question to boost engagement." | Info |
| Mixed moods | 📗 Context-aware feedback based on the dominant mood. | Varies |

**Cooldown:** Suggestions are throttled to one every **8 seconds** to avoid spamming, and the same suggestion type won't repeat consecutively.

---

## 🖼 Screenshots

### Login Page
Premium dark-mode login with glassmorphism card, animated gradient orbs, and role-based tabs (Student / Faculty).

### Student Camera Page
- Live webcam feed with face detection bounding boxes
- Colored corner accents per emotion type
- Emotion labels with confidence percentages
- 4 mood stat cards with animated progress bars
- Face detection log showing each detected face
- ELI5 section with typewriter response effect

### Faculty Dashboard
- Live analytics header with student count and face count
- 4 mood counter cards with SVG ring progress indicators
- Chart.js line graph tracking mood trends over time (25 data points)
- AI Teaching Suggestions panel with color-coded cards
- Connected Students sidebar with avatar initials

---

## � Cloud Deployment

### Azure Cloud Deployment (Recommended)

Deploy to **Microsoft Azure** with auto-scaling, monitoring, and global availability:

- **Platform:** Azure App Service (Linux)
- **Auto-Deploy:** GitHub Actions on every push to main
- **Features:** 99.95% uptime SLA, Auto-scaling, Application Insights
- **Pricing:** ~$15/month (B1 tier) or free tier during first 12 months
- **Setup Guide:** [See AZURE-DEPLOYMENT.md](./AZURE-DEPLOYMENT.md)

**Quick Start:**
```bash
# 1. Create Azure resources (via Portal or CLI)
az group create --name smart-classroom-rg --location eastus
az appservice plan create --name smart-classroom-plan --resource-group smart-classroom-rg --sku B1 --is-linux
az webapp create --resource-group smart-classroom-rg --plan smart-classroom-plan --name smart-classroom-ai --runtime "NODE|18-lts"

# 2. Add GitHub secrets (AZURE_CREDENTIALS, AZURE_PUBLISH_PROFILE)
# 3. Push to main → Auto-deploy via GitHub Actions
# 4. Your app is live at: https://smart-classroom-ai.azurewebsites.net
```

### Render Deployment (Alternative)

Deploy to **Render** for a simpler setup (no Azure credentials needed):

- **Platform:** Render Web Service
- **Auto-Deploy:** GitHub Actions
- **Features:** Built-in GitHub integration, automatic SSL
- **Pricing:** Free tier (with cold starts) or Starter $7/month
- **Setup Guide:** [See DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick Start:**
```bash
# 1. Connect GitHub repo to Render
# 2. Add GEMINI_API_KEY and credentials as env vars
# 3. Deploy → Your app is live at: https://smart-classroom-ai.onrender.com
```

---

## �🔑 Configuration

Edit the `.env` file in the project root:

```env
# Server Port
PORT=3000

# Faculty Login Credentials
FACULTY_USER=faculty
FACULTY_PASS=admin123

# Google Gemini API Key (Optional - for AI-powered ELI5 explanations)
# Get a free key at: https://aistudio.google.com/
GEMINI_API_KEY=your_api_key_here
```

> **Note:** If no Gemini API key is provided, the ELI5 feature uses a built-in mock engine with pre-written explanations.

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `node server.js` | Start directly with Node.js |
| `start.bat` | Windows batch file — double-click to start |

---

## 🧪 How It Works — Technical Summary

### 1. Face Detection (Client-Side)
- Uses **face-api.js** (built on TensorFlow.js)
- Runs entirely in the browser — no server-side CV needed
- `TinyFaceDetector` model for fast real-time detection
- `faceExpressionNet` model for 7-emotion classification
- Detection interval: every **2.5 seconds**

### 2. Real-Time Communication
- **Socket.IO** establishes WebSocket connections
- Student emits `sendMood` event with mood data every detection cycle
- Server broadcasts `updateDashboard` to all connected faculty clients
- Server runs AI logic and emits `suggestion` events when thresholds are crossed
- **Zero perceptible delay** — updates appear instantly

### 3. Data Visualization
- **Chart.js** renders a multi-line chart with 4 datasets
- Auto-scrolling X-axis (keeps last 25 data points)
- Smooth tension curves with gradient fills
- Counter animations with smooth number transitions
- SVG ring progress indicators for each mood category

### 4. AI Features
- **Suggestion Engine:** Rule-based logic analyzing mood percentages in real-time
- **ELI5 Feature:** Sends topic to Google Gemini API, returns child-friendly explanation
- Fallback to mock engine if API is unavailable or rate-limited
- Retry logic with exponential backoff for API rate limits

---

## 🌐 Browser Compatibility

| Browser | Status |
|---|---|
| Google Chrome | ✅ Fully Supported |
| Microsoft Edge | ✅ Fully Supported |
| Mozilla Firefox | ✅ Supported |
| Safari | ⚠️ Partial (WebRTC may need permissions) |

> **Requirement:** Browser must support `getUserMedia()` API for webcam access.

---

## 📜 License

This project is developed as an academic mini-project.

---

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) — Browser-based face detection & emotion recognition
- [Socket.IO](https://socket.io/) — Real-time bidirectional event-based communication
- [Chart.js](https://www.chartjs.org/) — Simple yet flexible JavaScript charting
- [Google Gemini](https://ai.google.dev/) — Generative AI for ELI5 explanations
- [Google Fonts](https://fonts.google.com/) — Inter font family

---

<div align="center">

**Built with ❤️ for Smarter Classrooms**

🎓 Smart Classroom AI System © 2026

</div>
#   m i n i p r o j e c t 
 
 