/* ═══════════════════════════════════════════════════════════
   Login Page Logic — Role-based routing
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const tabStudent = document.getElementById('tabStudent');
  const tabFaculty = document.getElementById('tabFaculty');
  const studentForm = document.getElementById('studentForm');
  const facultyForm = document.getElementById('facultyForm');
  const loginError = document.getElementById('loginError');

  // ─── Role Tab Switching ────────────────────────────────
  tabStudent.addEventListener('click', () => switchRole('student'));
  tabFaculty.addEventListener('click', () => switchRole('faculty'));

  function switchRole(role) {
    // Update tabs
    tabStudent.classList.toggle('active', role === 'student');
    tabFaculty.classList.toggle('active', role === 'faculty');

    // Update forms
    studentForm.classList.toggle('active', role === 'student');
    facultyForm.classList.toggle('active', role === 'faculty');

    // Clear error
    hideError();
  }

  // ─── Student Login ─────────────────────────────────────
  document.getElementById('studentLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('studentName').value.trim();
    const rollNo = document.getElementById('studentRoll').value.trim();
    const className = document.getElementById('studentClass').value.trim();

    if (!name || !rollNo || !className) {
      showError('Please fill in all fields');
      return;
    }

    // Store student info in sessionStorage
    sessionStorage.setItem('studentInfo', JSON.stringify({
      name,
      rollNo,
      className
    }));

    // Redirect to student page
    window.location.href = '/student.html';
  });

  // ─── Faculty Login ─────────────────────────────────────
  document.getElementById('facultyLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('facultyUser').value.trim();
    const password = document.getElementById('facultyPass').value.trim();

    if (!username || !password) {
      showError('Please enter username and password');
      return;
    }

    const btn = document.getElementById('btnFacultyLogin');
    btn.textContent = '🔄 Authenticating...';
    btn.disabled = true;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('facultyAuth', 'true');
        window.location.href = '/faculty.html';
      } else {
        showError(data.message || 'Invalid credentials');
        btn.textContent = '🔐 Access Dashboard';
        btn.disabled = false;
      }
    } catch (err) {
      showError('Connection error. Please try again.');
      btn.textContent = '🔐 Access Dashboard';
      btn.disabled = false;
    }
  });

  // ─── Error Handling ────────────────────────────────────
  function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
  }

  function hideError() {
    loginError.style.display = 'none';
    loginError.textContent = '';
  }

  // Clear errors on input
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', hideError);
  });
});
