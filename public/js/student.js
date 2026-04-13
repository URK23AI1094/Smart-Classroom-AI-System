/* ═══════════════════════════════════════════════════════════
   Student Page — Webcam, Face Detection, Mood Emission
   Uses face-api.js for in-browser face + emotion detection
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────
  const socket = io();
  let studentInfo = {};
  let isDetecting = false;
  let detectionInterval = null;

  // ─── DOM Elements ────────────────────────────────────
  const video = document.getElementById('webcamVideo');
  const canvas = document.getElementById('overlayCanvas');
  const ctx = canvas.getContext('2d');
  const webcamStatus = document.getElementById('webcamStatus');
  const faceCountBadge = document.getElementById('faceCountBadge');
  const faceLog = document.getElementById('faceLog');

  // Stat elements
  const statInterested = document.getElementById('statInterested');
  const statConfused = document.getElementById('statConfused');
  const statBored = document.getElementById('statBored');
  const statNeutral = document.getElementById('statNeutral');
  const barInterested = document.getElementById('barInterested');
  const barConfused = document.getElementById('barConfused');
  const barBored = document.getElementById('barBored');
  const barNeutral = document.getElementById('barNeutral');

  // ─── Emotion → Mood Mapping ──────────────────────────
  const emotionToMood = {
    happy: 'interested',
    surprised: 'interested',
    sad: 'bored',
    disgusted: 'bored',
    fearful: 'confused',
    angry: 'confused',
    neutral: 'neutral'
  };

  const emotionEmojis = {
    happy: '😊',
    surprised: '😮',
    sad: '😢',
    disgusted: '🤢',
    fearful: '😨',
    angry: '😠',
    neutral: '😐'
  };

  // ─── Initialize ──────────────────────────────────────
  async function init() {
    // Check for student info
    const stored = sessionStorage.getItem('studentInfo');
    if (!stored) {
      window.location.href = '/';
      return;
    }
    studentInfo = JSON.parse(stored);

    // Display student info
    document.getElementById('displayName').textContent = studentInfo.name;
    document.getElementById('displayClass').textContent = `| ${studentInfo.className}`;

    // Emit student join
    socket.emit('studentJoin', studentInfo);

    // Load face-api models
    updateStatus('Loading AI models...', false);
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL)
      ]);
      console.log('✅ Face-api models loaded');
      updateStatus('Models loaded. Starting camera...', false);
    } catch (err) {
      console.error('❌ Model loading failed:', err);
      updateStatus('Model loading failed!', false);
      return;
    }

    // Start webcam
    await startWebcam();
  }

  // ─── Webcam ──────────────────────────────────────────
  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      video.srcObject = stream;
      video.addEventListener('loadeddata', () => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        updateStatus('LIVE — Detecting faces', true);
        startDetection();
      });
    } catch (err) {
      console.error('❌ Webcam error:', err);
      updateStatus('Camera access denied!', false);
    }
  }

  // ─── Face Detection Loop ─────────────────────────────
  function startDetection() {
    if (isDetecting) return;
    isDetecting = true;

    // Run detection every 2.5 seconds
    detectionInterval = setInterval(detectFaces, 2500);
    // Run immediately once
    detectFaces();
  }

  async function detectFaces() {
    if (!video || video.paused || video.ended) return;

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks(true)
        .withFaceExpressions();

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale detections to display size
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
      };

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Update face count
      faceCountBadge.textContent = `${detections.length} face${detections.length !== 1 ? 's' : ''}`;

      if (detections.length === 0) {
        updateFaceLog([]);
        return;
      }

      // Process each face
      const faceData = [];
      resizedDetections.forEach((detection, index) => {
        const box = detection.detection.box;
        const expressions = detection.expressions;

        // Get dominant emotion
        const dominantEmotion = getDominantEmotion(expressions);
        const mood = emotionToMood[dominantEmotion] || 'neutral';
        const confidence = (expressions[dominantEmotion] * 100).toFixed(0);

        faceData.push({
          id: index + 1,
          emotion: dominantEmotion,
          mood: mood,
          confidence: confidence,
          expressions: expressions
        });

        // Draw bounding box
        drawFaceBox(box, dominantEmotion, index + 1, confidence);
      });

      // Update face log
      updateFaceLog(faceData);

      // Calculate mood percentages
      const moodCounts = { interested: 0, confused: 0, bored: 0, neutral: 0 };
      faceData.forEach(face => {
        moodCounts[face.mood] = (moodCounts[face.mood] || 0) + 1;
      });

      const totalFaces = faceData.length;
      const percentages = {
        interested: Math.round((moodCounts.interested / totalFaces) * 100) || 0,
        confused: Math.round((moodCounts.confused / totalFaces) * 100) || 0,
        bored: Math.round((moodCounts.bored / totalFaces) * 100) || 0,
        neutral: Math.round((moodCounts.neutral / totalFaces) * 100) || 0
      };

      // Update local stats display
      updateLocalStats(percentages);

      // Emit to server
      socket.emit('sendMood', {
        faces: faceData.length,
        moodCounts,
        percentages,
        faceDetails: faceData.map(f => ({
          emotion: f.emotion,
          mood: f.mood,
          confidence: f.confidence
        }))
      });

    } catch (err) {
      console.error('Detection error:', err);
    }
  }

  // ─── Drawing ─────────────────────────────────────────
  function drawFaceBox(box, emotion, faceNum, confidence) {
    const colors = {
      happy: '#10b981',
      surprised: '#10b981',
      sad: '#ec4899',
      disgusted: '#ec4899',
      fearful: '#f59e0b',
      angry: '#f59e0b',
      neutral: '#06b6d4'
    };

    const color = colors[emotion] || '#7c3aed';

    // Draw box
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Draw corner accents
    const cornerLen = 15;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + cornerLen);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + cornerLen, box.y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLen, box.y);
    ctx.lineTo(box.x + box.width, box.y);
    ctx.lineTo(box.x + box.width, box.y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + box.height - cornerLen);
    ctx.lineTo(box.x, box.y + box.height);
    ctx.lineTo(box.x + cornerLen, box.y + box.height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height);
    ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
    ctx.stroke();

    // Draw label background
    const emoji = emotionEmojis[emotion] || '😐';
    const label = `${emoji} Face ${faceNum}: ${emotion} (${confidence}%)`;
    ctx.font = 'bold 13px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;
    const labelHeight = 26;
    const labelY = box.y - labelHeight - 4;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    roundRect(ctx, box.x, labelY, textWidth + 16, labelHeight, 6);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw label text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, box.x + 8, labelY + 17);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ─── Helpers ─────────────────────────────────────────
  function getDominantEmotion(expressions) {
    let maxVal = 0;
    let maxKey = 'neutral';
    for (const [key, val] of Object.entries(expressions)) {
      if (val > maxVal) {
        maxVal = val;
        maxKey = key;
      }
    }
    return maxKey;
  }

  function updateLocalStats(percentages) {
    statInterested.textContent = `${percentages.interested}%`;
    statConfused.textContent = `${percentages.confused}%`;
    statBored.textContent = `${percentages.bored}%`;
    statNeutral.textContent = `${percentages.neutral}%`;

    barInterested.style.width = `${percentages.interested}%`;
    barConfused.style.width = `${percentages.confused}%`;
    barBored.style.width = `${percentages.bored}%`;
    barNeutral.style.width = `${percentages.neutral}%`;
  }

  function updateFaceLog(faces) {
    if (faces.length === 0) {
      faceLog.innerHTML = '<div class="eli5-placeholder">No faces detected in current frame</div>';
      return;
    }

    faceLog.innerHTML = faces.map(face => `
      <div class="face-log-item">
        <span class="face-id">${emotionEmojis[face.emotion]} Face ${face.id}</span>
        <span class="face-emotion emotion-${face.emotion}">
          ${face.emotion} (${face.confidence}%)
        </span>
      </div>
    `).join('');
  }

  function updateStatus(text, isActive) {
    const statusEl = webcamStatus;
    statusEl.querySelector('span').textContent = text;
    statusEl.classList.toggle('active', isActive);
  }

  // ─── Socket Events ──────────────────────────────────
  socket.on('connect', () => {
    console.log('🔌 Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
    updateStatus('Disconnected', false);
  });

  // ─── Start ──────────────────────────────────────────
  init();

})();
