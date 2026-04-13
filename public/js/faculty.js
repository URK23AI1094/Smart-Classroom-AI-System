/* ═══════════════════════════════════════════════════════════
   Faculty Dashboard — Real-time mood monitoring with Chart.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Auth Check ──────────────────────────────────────
  // Allow direct access for easier testing; auth is validated server-side
  if (!sessionStorage.getItem('facultyAuth')) {
    // Soft check — set auth flag if accessed directly
    console.warn('No faculty auth found. Allowing access — validate credentials server-side.');
  }

  // ─── State ───────────────────────────────────────────
  const socket = io();
  const MAX_DATA_POINTS = 25;
  let chartData = {
    labels: [],
    interested: [],
    confused: [],
    bored: [],
    neutral: []
  };

  // ─── DOM Elements ────────────────────────────────────
  const totalStudentsEl = document.getElementById('totalStudents');
  const totalFacesEl = document.getElementById('totalFaces');
  const lastUpdateEl = document.getElementById('lastUpdate');
  const studentListEl = document.getElementById('studentList');
  const suggestionsListEl = document.getElementById('suggestionsList');

  // Counter elements
  const pctInterested = document.getElementById('pctInterested');
  const pctConfused = document.getElementById('pctConfused');
  const pctBored = document.getElementById('pctBored');
  const pctNeutral = document.getElementById('pctNeutral');
  const countInterested = document.getElementById('countInterested');
  const countConfused = document.getElementById('countConfused');
  const countBored = document.getElementById('countBored');
  const countNeutral = document.getElementById('countNeutral');

  // Ring elements
  const ringInterested = document.getElementById('ringInterested');
  const ringConfused = document.getElementById('ringConfused');
  const ringBored = document.getElementById('ringBored');
  const ringNeutral = document.getElementById('ringNeutral');

  const RING_CIRCUMFERENCE = 220; // 2 * PI * 35

  // ─── Chart.js Setup ──────────────────────────────────
  const chartCtx = document.getElementById('moodChart').getContext('2d');

  // Create gradients
  function createGradient(color, opacity) {
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'));
    gradient.addColorStop(1, color.replace(')', ', 0.01)').replace('rgb', 'rgba'));
    return gradient;
  }

  const moodChart = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Interested',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 6
        },
        {
          label: 'Confused',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 6
        },
        {
          label: 'Bored',
          data: [],
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 6
        },
        {
          label: 'Neutral',
          data: [],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#9191a8',
            font: {
              family: 'Inter',
              size: 12,
              weight: '600'
            },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 13, 26, 0.9)',
          titleColor: '#f0f0f5',
          bodyColor: '#9191a8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: 'Inter', weight: '700' },
          bodyFont: { family: 'Inter' },
          callbacks: {
            label: function (context) {
              return ` ${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255,255,255,0.04)',
            drawBorder: false
          },
          ticks: {
            color: '#5a5a72',
            font: { family: 'Inter', size: 10 },
            maxRotation: 0
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(255,255,255,0.04)',
            drawBorder: false
          },
          ticks: {
            color: '#5a5a72',
            font: { family: 'Inter', size: 11 },
            callback: (val) => val + '%',
            stepSize: 20
          }
        }
      },
      animation: {
        duration: 600,
        easing: 'easeOutQuart'
      }
    }
  });

  // ─── Socket Events ──────────────────────────────────

  // Join as faculty
  socket.emit('facultyJoin');
  console.log('📡 Faculty joining dashboard...');

  socket.on('connect', () => {
    console.log('🔌 Connected to server (socket id:', socket.id, ')');
    socket.emit('facultyJoin');
  });

  // Update dashboard with mood data
  socket.on('updateDashboard', (data) => {
    console.log('📊 Dashboard update received:', JSON.stringify(data.percentages));
    try {
      updateCounters(data);
      updateChart(data);
      updateLastTime();
    } catch (err) {
      console.error('Error updating dashboard:', err);
    }
  });

  // Update student list
  socket.on('studentList', (students) => {
    console.log('👨‍🎓 Student list updated:', students.length, 'students');
    updateStudentList(students);
    totalStudentsEl.textContent = students.length;
  });

  // AI Suggestion
  socket.on('suggestion', (data) => {
    console.log('🤖 AI Suggestion received:', data.message);
    addSuggestion(data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
  });

  // ─── Update Functions ───────────────────────────────

  function updateCounters(data) {
    const pcts = data.percentages || {};
    const counts = data.moodCounts || {};
    const faces = data.faces || 0;

    totalFacesEl.textContent = faces;

    // Animate counters
    animateValue(pctInterested, pcts.interested || 0);
    animateValue(pctConfused, pcts.confused || 0);
    animateValue(pctBored, pcts.bored || 0);
    animateValue(pctNeutral, pcts.neutral || 0);

    // Update counts
    countInterested.textContent = `${counts.interested || 0} face${(counts.interested || 0) !== 1 ? 's' : ''}`;
    countConfused.textContent = `${counts.confused || 0} face${(counts.confused || 0) !== 1 ? 's' : ''}`;
    countBored.textContent = `${counts.bored || 0} face${(counts.bored || 0) !== 1 ? 's' : ''}`;
    countNeutral.textContent = `${counts.neutral || 0} face${(counts.neutral || 0) !== 1 ? 's' : ''}`;

    // Update rings
    updateRing(ringInterested, pcts.interested || 0);
    updateRing(ringConfused, pcts.confused || 0);
    updateRing(ringBored, pcts.bored || 0);
    updateRing(ringNeutral, pcts.neutral || 0);
  }

  function animateValue(el, targetValue) {
    const current = parseInt(el.textContent) || 0;
    const diff = targetValue - current;
    const steps = 20;
    const stepValue = diff / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const val = Math.round(current + stepValue * step);
      el.textContent = `${val}%`;
      if (step >= steps) {
        el.textContent = `${targetValue}%`;
        clearInterval(interval);
      }
    }, 25);
  }

  function updateRing(ringEl, percentage) {
    const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * percentage / 100);
    ringEl.style.strokeDashoffset = offset;
  }

  function updateChart(data) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const pcts = data.percentages || {};

    // Add data points
    moodChart.data.labels.push(timeLabel);
    moodChart.data.datasets[0].data.push(pcts.interested || 0);
    moodChart.data.datasets[1].data.push(pcts.confused || 0);
    moodChart.data.datasets[2].data.push(pcts.bored || 0);
    moodChart.data.datasets[3].data.push(pcts.neutral || 0);

    // Trim to max data points
    if (moodChart.data.labels.length > MAX_DATA_POINTS) {
      moodChart.data.labels.shift();
      moodChart.data.datasets.forEach(ds => ds.data.shift());
    }

    // Single update call to prevent rendering conflicts
    moodChart.update();
  }

  function updateStudentList(students) {
    if (students.length === 0) {
      studentListEl.innerHTML = '<div class="no-students">No students connected yet...</div>';
      return;
    }

    studentListEl.innerHTML = students.map(s => {
      const initials = (s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return `
        <div class="student-item">
          <div class="student-avatar">${initials}</div>
          <div class="student-item-info">
            <div class="student-name">${escapeHtml(s.name || 'Unknown')}</div>
            <div class="student-class">${escapeHtml(s.rollNo || '')} | ${escapeHtml(s.className || '')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function addSuggestion(data) {
    // Remove "no suggestions" placeholder
    const placeholder = suggestionsListEl.querySelector('.no-suggestions');
    if (placeholder) placeholder.remove();

    const time = new Date(data.timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });

    const card = document.createElement('div');
    card.className = `suggestion-card ${data.type || 'info'}`;
    card.innerHTML = `
      ${escapeHtml(data.message)}
      <span class="suggestion-time">${time}</span>
    `;

    // Add to top
    suggestionsListEl.prepend(card);

    // Keep max 10 suggestions
    while (suggestionsListEl.children.length > 10) {
      suggestionsListEl.removeChild(suggestionsListEl.lastChild);
    }
  }

  function updateLastTime() {
    const now = new Date();
    lastUpdateEl.textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
