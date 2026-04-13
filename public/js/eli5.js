/* ═══════════════════════════════════════════════════════════
   ELI5 — Explain Like I'm 5 Feature
   Sends topic to server, displays simple explanation
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const eli5Input = document.getElementById('eli5Input');
  const eli5Btn = document.getElementById('eli5Btn');
  const eli5Response = document.getElementById('eli5Response');

  // ─── Submit Handler ──────────────────────────────────
  eli5Btn.addEventListener('click', fetchExplanation);
  eli5Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchExplanation();
  });

  async function fetchExplanation() {
    const topic = eli5Input.value.trim();
    if (!topic) {
      eli5Input.focus();
      return;
    }

    // Show loading
    eli5Btn.disabled = true;
    eli5Btn.textContent = '⏳';
    eli5Response.innerHTML = `
      <div class="loading-dots" style="justify-content: center; padding: 20px;">
        <span></span><span></span><span></span>
      </div>
    `;
    eli5Response.classList.add('loading');

    try {
      const response = await fetch('/api/eli5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();

      if (data.success) {
        // Typewriter effect
        eli5Response.classList.remove('loading');
        typewriterEffect(eli5Response, data.explanation);
      } else {
        eli5Response.classList.remove('loading');
        eli5Response.textContent = '❌ ' + (data.message || 'Something went wrong');
      }
    } catch (err) {
      eli5Response.classList.remove('loading');
      eli5Response.textContent = '❌ Connection error. Please try again.';
    }

    eli5Btn.disabled = false;
    eli5Btn.textContent = 'Explain';
  }

  // ─── Typewriter Effect ──────────────────────────────
  function typewriterEffect(element, text) {
    element.textContent = '';
    let index = 0;
    const speed = 15; // ms per character

    function type() {
      if (index < text.length) {
        // Add characters in chunks for performance
        const chunkSize = 3;
        const chunk = text.slice(index, index + chunkSize);
        element.textContent += chunk;
        index += chunkSize;

        // Auto scroll
        element.scrollTop = element.scrollHeight;

        setTimeout(type, speed);
      }
    }

    type();
  }

})();
