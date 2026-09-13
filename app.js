document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const STORAGE_KEY = 'taskflow-tasks';
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || getSampleTasks();
  
  let userName = localStorage.getItem('taskflow-username') || 'Rifat';
  let aiApiKey = localStorage.getItem('taskflow-ai-key') || '';

  let currentFilters = {
    status: 'all', // all, active, completed, high, medium, low
    category: 'all', // all, Work, Personal, Study, Shopping, Other
    search: '',
    sort: 'newest'
  };

  let theme = localStorage.getItem('taskflow-theme') || 'light';
  let soundEnabled = localStorage.getItem('taskflow-sound') !== 'false';
  let selectedDate = getTodayStr(); // YYYY-MM-DD
  let currentWeekStart = getMonday(new Date());

  // Subtask builders state
  let addSubtasks = [];
  let editSubtasks = [];

  // Edit State
  let editingTaskId = null;
  let confirmCallback = null;
  let audioCtx = null;

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  // Navigation & Drawer
  const menuBtn = document.getElementById('menu-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawer-close');

  // Profile Modal
  const profileBtn = document.getElementById('profile-btn');
  const profileModal = document.getElementById('profile-modal');
  const profileCloseBtn = document.getElementById('profile-close-btn');
  const profileSaveBtn = document.getElementById('profile-save-btn');
  const profileNameInput = document.getElementById('profile-name-input');
  const headerUserName = document.getElementById('header-user-name');
  const pTotal = document.getElementById('p-total');
  const pDone = document.getElementById('p-done');
  const pRate = document.getElementById('p-rate');

  // Greeting & Stats
  const greetingText = document.getElementById('greeting-text');
  const taskCountHighlight = document.getElementById('task-count-highlight');
  const valTotal = document.getElementById('val-total');
  const valActive = document.getElementById('val-active');
  const valCompleted = document.getElementById('val-completed');
  const valRate = document.getElementById('val-rate');

  // Today Cards Carousel
  const todayCardsScroll = document.getElementById('today-cards-scroll');
  const todayEmpty = document.getElementById('today-empty');
  const seeAllBtn = document.getElementById('see-all-btn');

  // Theme & Sound
  const themeToggle = document.getElementById('theme-toggle-input');
  const soundToggle = document.getElementById('sound-toggle');
  
  // Filters & Controls
  const statusFilterBtns = document.querySelectorAll('#status-filters button');
  const categoryFilterBtns = document.querySelectorAll('#category-filters button');
  const statCircleCards = document.querySelectorAll('.cat-circle-card, .cat-circle');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const searchActionBtn = document.getElementById('search-action-btn');
  const sortSelect = document.getElementById('sort-select');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Lists & States
  const tasksList = document.getElementById('tasks-list');
  const emptyStateInitial = document.getElementById('empty-state-initial');
  const emptyStateSearch = document.getElementById('empty-state-search');

  // Add Task Form
  const addTaskForm = document.getElementById('add-task-form');
  const taskTitleInput = document.getElementById('task-title-input');
  const taskCategorySelect = document.getElementById('task-category-select');
  const taskPrioritySelect = document.getElementById('task-priority-select');
  const taskDateInput = document.getElementById('task-date-input');
  const titleError = document.getElementById('title-error');
  const toggleAdvancedBtn = document.getElementById('toggle-advanced-btn');
  const advancedFields = document.getElementById('advanced-fields');
  const taskDescInput = document.getElementById('task-desc-input');
  const subtaskBuilderInput = document.getElementById('subtask-builder-input');
  const btnAddSubtask = document.getElementById('btn-add-subtask');
  const subtaskBuilderList = document.getElementById('subtask-builder-list');

  // Edit Modal
  const editModal = document.getElementById('edit-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editTitleInput = document.getElementById('edit-title-input');
  const editCategorySelect = document.getElementById('edit-category-select');
  const editPrioritySelect = document.getElementById('edit-priority-select');
  const editDateInput = document.getElementById('edit-date-input');
  const editDescInput = document.getElementById('edit-desc-input');
  const editSubtaskBuilderInput = document.getElementById('edit-subtask-builder-input');
  const editBtnAddSubtask = document.getElementById('edit-btn-add-subtask');
  const editSubtaskBuilderList = document.getElementById('edit-subtask-builder-list');
  const editTitleError = document.getElementById('edit-title-error');
  const editCloseBtn = document.getElementById('edit-close-btn');
  const editCancelBtn = document.getElementById('edit-cancel-btn');

  // Confirm Modal
  const confirmModal = document.getElementById('confirm-modal');
  const confirmCloseBtn = document.getElementById('confirm-close-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
  const confirmActionBtn = document.getElementById('confirm-action-btn');
  const confirmMessage = document.getElementById('confirm-message');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Google Calendar Auth & Timeline
  const gcalConnectBtn = document.getElementById('gcal-connect-btn');
  const gcalConnectedInfo = document.getElementById('gcal-connected-info');
  const gcalUserEmail = document.getElementById('gcal-user-email');
  const gcalDisconnectBtn = document.getElementById('gcal-disconnect-btn');
  const gcalSettingsBtn = document.getElementById('gcal-settings-btn');
  const importEventsBtn = document.getElementById('import-events-btn');

  // GCal Config Modal Elements
  const gcalConfigModal = document.getElementById('gcal-config-modal');
  const gcalConfigCloseBtn = document.getElementById('gcal-config-close-btn');
  const gcalClientIdInput = document.getElementById('gcal-client-id-input');
  const gcalApiKeyInput = document.getElementById('gcal-api-key-input');
  const gcalSaveConfigBtn = document.getElementById('gcal-save-config-btn');
  const gcalDemoModeBtn = document.getElementById('gcal-demo-mode-btn');

  const weekPrevBtn = document.getElementById('week-prev-btn');
  const weekNextBtn = document.getElementById('week-next-btn');
  const weekDaysContainer = document.getElementById('week-days');
  const timelineEmpty = document.getElementById('timeline-empty');
  const timelineEvents = document.getElementById('timeline-events');

  // Weekly Chart
  const weeklyBarsContainer = document.getElementById('weekly-bars-container');
  const weeklyTotalText = document.getElementById('weekly-total-text');

  // AI Chatbot Widget Elements
  const aiTriggerBtn = document.getElementById('ai-trigger-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  const aiChatClose = document.getElementById('ai-chat-close');
  const aiSettingsBtn = document.getElementById('ai-settings-btn');
  const aiApiPanel = document.getElementById('ai-api-panel');
  const aiApiKeyInput = document.getElementById('ai-api-key-input');
  const aiSaveKeyBtn = document.getElementById('ai-save-key-btn');
  const aiChatMessages = document.getElementById('ai-chat-messages');
  const aiInput = document.getElementById('ai-input');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiMicBtn = document.getElementById('ai-mic-btn');
  const aiTtsToggle = document.getElementById('ai-tts-toggle');
  const aiClearChat = document.getElementById('ai-clear-chat');
  const aiListeningBanner = document.getElementById('ai-listening-banner');

  // ==========================================
  // INITIALIZATION
  // ==========================================
  init3DBackground();
  initTheme();
  initSound();
  updateGreeting();
  setupEventListeners();
  setupAiChatbot();
  renderTodayCards();
  renderTasks();
  updateStats();
  updateWeeklyChart();
  initWeekPicker();

  // Init Google Calendar if available
  if (window.GoogleCalendarAPI) {
    window.GoogleCalendarAPI.init(onGCalAuthChange);
  }

  // ==========================================
  // 3D ANIMATED CANVAS BACKGROUND (THREE.JS)
  // ==========================================
  function init3DBackground() {
    const canvas = document.getElementById('bg-canvas-3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const shapes = [];
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true })
    ];

    const geometries = [
      new THREE.OctahedronGeometry(3),
      new THREE.IcosahedronGeometry(2.5),
      new THREE.TorusGeometry(3, 0.8, 12, 24),
      new THREE.TetrahedronGeometry(3.2)
    ];

    for (let i = 0; i < 12; i++) {
      const geom = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geom, mat);

      mesh.position.x = (Math.random() - 0.5) * 60;
      mesh.position.y = (Math.random() - 0.5) * 60;
      mesh.position.z = (Math.random() - 0.5) * 40;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeed: (Math.random() * 0.008) + 0.004,
        initialY: mesh.position.y
      };

      scene.add(mesh);
      shapes.push(mesh);
    }

    const particlesCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.6,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    });

    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotSpeedX;
        shape.rotation.y += shape.userData.rotSpeedY;
        shape.position.y = shape.userData.initialY + Math.sin(elapsedTime * 1.5 + shape.position.x) * 1.5;
      });

      particleSystem.rotation.y = elapsedTime * 0.02;

      camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ==========================================
  // GREETING & PROFILE LOGIC
  // ==========================================
  function updateGreeting() {
    const hour = new Date().getHours();
    let timeGreeting = "Good Morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
    else if (hour >= 17) timeGreeting = "Good Evening";
    
    if (greetingText) greetingText.textContent = `${timeGreeting}, ${userName}!`;
    if (headerUserName) headerUserName.textContent = userName;
  }

  function openDrawer() {
    if (drawer) drawer.classList.add('active');
    if (drawerOverlay) drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('active');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
  }

  function openProfileModal() {
    if (!profileModal) return;
    if (profileNameInput) profileNameInput.value = userName;
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (pTotal) pTotal.textContent = total;
    if (pDone) pDone.textContent = completed;
    if (pRate) pRate.textContent = `${rate}%`;

    profileModal.setAttribute('aria-hidden', 'false');
  }

  function closeProfileModal() {
    if (profileModal) profileModal.setAttribute('aria-hidden', 'true');
  }

  // ==========================================
  // AI CHATBOT COPILOT ENGINE
  // ==========================================
  // ==========================================
  // TASKFLOW AI INTELLIGENT ASSISTANT ENGINE
  // ==========================================
  let ttsEnabled = localStorage.getItem('taskflow-tts') !== 'false';
  let isListening = false;
  let speechRecognition = null;
  const pendingAiActions = {};

  function speakAiResponse(text) {
    if (!soundEnabled || !ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`~]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch(e) {
      console.error("TTS Error", e);
    }
  }

  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (aiMicBtn) {
        aiMicBtn.addEventListener('click', () => {
          showToast("Voice commands aren't supported in this browser. You can still use text commands.", 'warning');
          appendAiChatMessage("⚠️ Voice commands aren't supported in this browser. You can still use text commands!", 'bot');
        });
      }
      return;
    }

    try {
      speechRecognition = new SpeechRec();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onstart = () => {
        isListening = true;
        if (aiMicBtn) aiMicBtn.classList.add('listening');
        if (aiListeningBanner) aiListeningBanner.style.display = 'flex';
      };

      speechRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (aiInput) aiInput.value = transcript;
        handleAiSubmit();
      };

      speechRecognition.onerror = (e) => {
        console.warn("Speech error", e.error);
        stopListening();
      };

      speechRecognition.onend = () => {
        stopListening();
      };

      if (aiMicBtn) {
        aiMicBtn.addEventListener('click', () => {
          if (isListening) {
            speechRecognition.stop();
          } else {
            try {
              speechRecognition.start();
            } catch(err) {
              stopListening();
            }
          }
        });
      }
    } catch(e) {
      console.error("Speech Rec Init Error", e);
    }
  }

  function stopListening() {
    isListening = false;
    if (aiMicBtn) aiMicBtn.classList.remove('listening');
    if (aiListeningBanner) aiListeningBanner.style.display = 'none';
  }

  function setupAiChatbot() {
    if (!aiTriggerBtn || !aiChatWindow) return;

    if (aiApiKeyInput) aiApiKeyInput.value = aiApiKey;

    aiTriggerBtn.addEventListener('click', () => {
      const isVisible = aiChatWindow.style.display === 'flex';
      aiChatWindow.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && aiInput) aiInput.focus();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const isVisible = aiChatWindow.style.display === 'flex';
        aiChatWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible && aiInput) aiInput.focus();
      }
    });

    if (aiChatClose) {
      aiChatClose.addEventListener('click', () => {
        aiChatWindow.style.display = 'none';
      });
    }

    if (aiSettingsBtn && aiApiPanel) {
      aiSettingsBtn.addEventListener('click', () => {
        const isHidden = aiApiPanel.style.display === 'none';
        aiApiPanel.style.display = isHidden ? 'flex' : 'none';
      });
    }

    if (aiSaveKeyBtn && aiApiKeyInput) {
      aiSaveKeyBtn.addEventListener('click', () => {
        aiApiKey = aiApiKeyInput.value.trim();
        localStorage.setItem('taskflow-ai-key', aiApiKey);
        showToast('AI API Key saved!', 'success');
        if (aiApiPanel) aiApiPanel.style.display = 'none';
      });
    }

    if (aiTtsToggle) {
      aiTtsToggle.textContent = ttsEnabled ? '🔊' : '🔇';
      aiTtsToggle.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        localStorage.setItem('taskflow-tts', ttsEnabled);
        aiTtsToggle.textContent = ttsEnabled ? '🔊' : '🔇';
        showToast(`Voice responses ${ttsEnabled ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    if (aiClearChat && aiChatMessages) {
      aiClearChat.addEventListener('click', () => {
        aiChatMessages.innerHTML = `
          <div class="chat-msg bot-msg">
            <div class="chat-avatar">🤖</div>
            <div class="chat-text">
              Conversation cleared. How can I help you today?
              <div class="prompt-chips">
                <button class="chip-btn" data-prompt="Add a high priority study task to revise JavaScript tomorrow">✨ Add study task</button>
                <button class="chip-btn" data-prompt="Show high priority tasks">🔥 High priority</button>
                <button class="chip-btn" data-prompt="Turn dark mode on">🌙 Dark mode</button>
                <button class="chip-btn" data-prompt="What are my statistics?">📊 Task stats</button>
              </div>
            </div>
          </div>
        `;
        setupPromptChips();
        showToast('Chat history cleared', 'info');
      });
    }

    if (aiSendBtn && aiInput) {
      aiSendBtn.addEventListener('click', handleAiSubmit);
      aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAiSubmit();
      });
    }

    setupPromptChips();
    setupSpeechRecognition();

    if (aiChatMessages) {
      aiChatMessages.addEventListener('click', (e) => {
        const chipBtn = e.target.closest('.chip-btn');
        if (chipBtn) {
          const text = chipBtn.dataset.prompt;
          if (text) {
            if (aiInput) aiInput.value = text;
            handleAiSubmit();
          }
          return;
        }

        const btn = e.target.closest('.ai-confirm-btn');
        if (!btn) return;

        const actionId = btn.dataset.actionId;
        const act = btn.dataset.act;
        const card = btn.closest('.ai-confirm-card');

        if (act === 'cancel') {
          if (card) card.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted);">Action cancelled.</div>';
          if (actionId) delete pendingAiActions[actionId];
          speakAiResponse("Action cancelled.");
          return;
        }

        const pending = pendingAiActions[actionId];
        if (!pending) return;

        if (act === 'confirm-create') {
          const { title, category, priority, dueDate } = pending.data;
          const newTask = {
            id: generateId(),
            title: title,
            description: 'Created via TaskFlow AI',
            category: category,
            priority: priority,
            dueDate: dueDate || getTodayStr(),
            completed: false,
            subtasks: [],
            createdAt: Date.now()
          };
          tasks.unshift(newTask);
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          playChime();
          speakAiResponse(`Done! Task ${title} created.`);
          showToast(`Task "${title}" created!`, 'success');
          if (card) card.innerHTML = `<div style="font-size:0.82rem; color:var(--color-success); font-weight:700;">🚀 Task "${escapeHtml(title)}" created successfully!</div>`;
        } else if (act === 'confirm-complete') {
          const { taskId, target } = pending.data;
          let completedTitle = '';
          tasks.forEach(t => {
            if (taskId ? t.id === taskId : (!t.completed && (!target || t.title.toLowerCase().includes(target.toLowerCase())))) {
              t.completed = true;
              completedTitle = t.title;
            }
          });
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          playChime();
          speakAiResponse(`Done! Marked task as completed.`);
          showToast(`Task completed!`, 'success');
          if (card) card.innerHTML = `<div style="font-size:0.82rem; color:var(--color-success); font-weight:700;">✅ Task "${escapeHtml(completedTitle || 'Selected')}" marked as completed!</div>`;
        } else if (act === 'confirm-delete') {
          const { taskId, taskTitle } = pending.data;
          tasks = tasks.filter(t => t.id !== taskId);
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          showToast(`Task deleted`, 'info');
          speakAiResponse(`Task deleted.`);
          if (card) card.innerHTML = `<div style="font-size:0.82rem; color:var(--color-danger); font-weight:700;">🧹 Task "${escapeHtml(taskTitle)}" deleted!</div>`;
        } else if (act === 'confirm-clear-completed') {
          const initialCount = tasks.length;
          tasks = tasks.filter(t => !t.completed);
          const clearedCount = initialCount - tasks.length;
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          showToast(`Cleared ${clearedCount} completed tasks`, 'info');
          speakAiResponse(`Cleared ${clearedCount} completed tasks.`);
          if (card) card.innerHTML = `<div style="font-size:0.82rem; color:var(--primary); font-weight:700;">✨ Cleared ${clearedCount} completed task(s)!</div>`;
        }

        delete pendingAiActions[actionId];
      });
    }
  }

  function setupPromptChips() {
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.prompt;
        if (text) {
          if (aiInput) aiInput.value = text;
          handleAiSubmit();
        }
      });
    });
  }

  async function handleAiSubmit() {
    const inputEl = aiInput || document.getElementById('ai-input');
    if (!inputEl) return;

    const prompt = inputEl.value.trim();
    if (!prompt) return;

    appendAiChatMessage(prompt, 'user');
    inputEl.value = '';

    const typingMsg = appendAiChatMessage('', 'bot');
    if (!typingMsg) return;
    const textEl = typingMsg.querySelector('.chat-text');

    if (textEl) {
      textEl.innerHTML = `
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
    }

    // Parse intent locally
    const action = parseAiIntent(prompt);
    
    // For all known local intents (Create, Delete, Complete, Edit, Nav, Theme, Sound, Filter, Stats, Greeting, etc.)
    if (action.intent !== 'UNKNOWN') {
      const response = processAiCommand(prompt);
      if (textEl) textEl.innerHTML = response;
      if (aiChatMessages) aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      return;
    }

    // Securely query server-side Gemini API route POST /api/chat for general queries
    const apiEndpoint = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000'))
      ? 'http://localhost:5000/api/chat'
      : '/api/chat';

    try {
      const apiRes = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tasks })
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success && data.text) {
          if (textEl) textEl.innerHTML = formatMarkdownResponse(data.text);
          if (aiChatMessages) aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
          speakAiResponse(data.text);
          return;
        }
      }
    } catch(err) {
      console.warn("Backend Gemini API route unavailable. Using local NLP engine.", err);
    }

    // Fallback response
    const response = processAiCommand(prompt);
    if (textEl) textEl.innerHTML = response;
    if (aiChatMessages) aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  function formatMarkdownResponse(text) {
    if (!text) return '';
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function appendAiChatMessage(text, sender) {
    if (!aiChatMessages) return null;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    msg.innerHTML = `
      <div class="chat-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
      <div class="chat-text">${escapeHtml(text)}</div>
    `;

    aiChatMessages.appendChild(msg);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    return msg;
  }

  function getNextDayOfWeekStr(dayIndex) {
    const d = new Date();
    const currentDay = d.getDay();
    let distance = dayIndex - currentDay;
    if (distance <= 0) distance += 7;
    d.setDate(d.getDate() + distance);
    return d.toISOString().split('T')[0];
  }

  function parseCreateIntent(rawPrompt) {
    const p = rawPrompt.toLowerCase();
    
    let priority = 'medium';
    if (p.includes('high priority') || p.includes('high') || p.includes('urgent') || p.includes('important')) priority = 'high';
    else if (p.includes('low priority') || p.includes('low')) priority = 'low';

    let category = 'Other';
    if (p.includes('work') || p.includes('job') || p.includes('project') || p.includes('client') || p.includes('presentation')) category = 'Work';
    else if (p.includes('study') || p.includes('exam') || p.includes('homework') || p.includes('course') || p.includes('javascript') || p.includes('assignment') || p.includes('revise') || p.includes('learn')) category = 'Study';
    else if (p.includes('shop') || p.includes('buy') || p.includes('store') || p.includes('groceries')) category = 'Shopping';
    else if (p.includes('personal') || p.includes('home') || p.includes('life')) category = 'Personal';

    let dueDate = '';
    if (p.includes('tomorrow')) {
      const d = new Date(); d.setDate(d.getDate() + 1); dueDate = d.toISOString().split('T')[0];
    } else if (p.includes('today')) {
      dueDate = new Date().toISOString().split('T')[0];
    } else if (p.includes('friday')) {
      dueDate = getNextDayOfWeekStr(5);
    } else if (p.includes('monday')) {
      dueDate = getNextDayOfWeekStr(1);
    }

    let title = rawPrompt
      .replace(/add\s+(a\s+)?(high|medium|low)?\s*(priority)?\s*(work|study|shopping|personal|other)?\s*(task\s+)?(to\s+)?/gi, '')
      .replace(/create\s+(a\s+)?(high|medium|low)?\s*(priority)?\s*(work|study|shopping|personal|other)?\s*(task\s+)?/gi, '')
      .replace(/new\s+task\s+/gi, '')
      .replace(/remind\s+me\s+to\s+/gi, '')
      .replace(/at\s+\d+\s*(pm|am)?/gi, '')
      .replace(/by\s+tomorrow/gi, '')
      .replace(/tomorrow/gi, '')
      .replace(/today/gi, '')
      .replace(/high\s+priority/gi, '')
      .replace(/low\s+priority/gi, '')
      .replace(/medium\s+priority/gi, '')
      .replace(/work\s+task/gi, '')
      .replace(/study\s+task/gi, '')
      .replace(/shopping\s+task/gi, '')
      .replace(/personal\s+task/gi, '')
      .trim();

    if (!title || title.length < 2) {
      title = rawPrompt.replace(/add|create|task|new/gi, '').trim() || 'New Task';
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
      intent: 'CREATE_TASK',
      title: title,
      category: category,
      priority: priority,
      dueDate: dueDate
    };
  }

  function parseEditIntent(rawPrompt) {
    const p = rawPrompt.toLowerCase();
    let target = '';
    let updates = {};

    if (p.includes('priority')) {
      if (p.includes('high')) updates.priority = 'high';
      else if (p.includes('low')) updates.priority = 'low';
      else if (p.includes('medium')) updates.priority = 'medium';
    }
    if (p.includes('category')) {
      if (p.includes('work')) updates.category = 'Work';
      else if (p.includes('study')) updates.category = 'Study';
      else if (p.includes('shopping')) updates.category = 'Shopping';
      else if (p.includes('personal')) updates.category = 'Personal';
    }
    if (p.includes('due date') || p.includes('deadline') || p.includes('move')) {
      if (p.includes('tomorrow')) {
        const d = new Date(); d.setDate(d.getDate() + 1); updates.dueDate = d.toISOString().split('T')[0];
      } else if (p.includes('friday')) {
        updates.dueDate = getNextDayOfWeekStr(5);
      }
    }

    target = rawPrompt
      .replace(/change\s+(the\s+)?(priority|category|due\s+date|deadline)\s+of\s+(my\s+|the\s+)?/gi, '')
      .replace(/change\s+(my\s+|the\s+)?/gi, '')
      .replace(/move\s+(my\s+|the\s+)?/gi, '')
      .replace(/rename\s+(my\s+|the\s+)?/gi, '')
      .replace(/to\s+.*$/gi, '')
      .replace(/\s*task\s*/gi, '')
      .trim();

    return {
      intent: 'EDIT_TASK',
      target: target,
      updates: updates
    };
  }

  function parseAiIntent(rawPrompt) {
    const prompt = rawPrompt.toLowerCase().trim();

    // 0. GREETINGS & CONVERSATIONAL HELP
    if (prompt === 'hi' || prompt === 'hello' || prompt === 'hey' || prompt.includes('how are you') || prompt.includes('who are you') || prompt.includes('what can you do') || prompt.includes('help')) {
      return { intent: 'GREETING' };
    }

    // 1. NAVIGATION
    if (prompt.includes('go to dashboard') || prompt.includes('open dashboard') || prompt.includes('show dashboard')) {
      return { intent: 'NAVIGATE', target: 'dashboard' };
    }
    if (prompt.includes('go to task') || prompt.includes('open task list') || prompt.includes('show my task') || prompt.includes('scroll to task')) {
      return { intent: 'NAVIGATE', target: 'tasks' };
    }
    if (prompt.includes('go to calendar') || prompt.includes('open calendar') || prompt.includes('show calendar')) {
      return { intent: 'NAVIGATE', target: 'calendar' };
    }
    if (prompt.includes('open settings') || prompt.includes('open profile') || prompt.includes('user settings')) {
      return { intent: 'NAVIGATE', target: 'settings' };
    }
    if (prompt.includes('open assistant') || prompt.includes('open ai') || prompt.includes('show assistant')) {
      return { intent: 'OPEN_ASSISTANT' };
    }
    if (prompt.includes('close assistant') || prompt.includes('minimize assistant') || prompt.includes('hide ai')) {
      return { intent: 'CLOSE_ASSISTANT' };
    }

    // 2. THEME
    if (prompt.includes('dark mode on') || prompt.includes('enable dark mode') || prompt.includes('turn dark mode on') || prompt.includes('switch to dark')) {
      return { intent: 'CHANGE_THEME', theme: 'dark' };
    }
    if (prompt.includes('dark mode off') || prompt.includes('disable dark mode') || prompt.includes('turn dark mode off') || prompt.includes('switch to light mode') || prompt.includes('light mode on')) {
      return { intent: 'CHANGE_THEME', theme: 'light' };
    }

    // 3. SOUND
    if (prompt.includes('disable sound') || prompt.includes('turn sound off') || prompt.includes('mute sound') || prompt.includes('sound off')) {
      return { intent: 'TOGGLE_SOUND', state: 'off' };
    }
    if (prompt.includes('enable sound') || prompt.includes('turn sound on') || prompt.includes('unmute sound') || prompt.includes('sound on')) {
      return { intent: 'TOGGLE_SOUND', state: 'on' };
    }

    // 4. CLEAR COMPLETED
    if (prompt.includes('clear completed') || prompt.includes('delete completed') || prompt.includes('remove completed')) {
      return { intent: 'CLEAR_COMPLETED' };
    }

    // 5. FILTERS / SHOW TASKS
    if (prompt.includes('show completed') || prompt.includes('open completed') || prompt.includes('view completed')) {
      return { intent: 'FILTER_TASKS', status: 'completed' };
    }
    if (prompt.includes('show active') || prompt.includes('open active') || prompt.includes('view active')) {
      return { intent: 'FILTER_TASKS', status: 'active' };
    }
    if (prompt.includes('show high priority') || prompt.includes('high priority tasks') || prompt.includes('urgent tasks')) {
      return { intent: 'FILTER_TASKS', priority: 'high' };
    }
    if (prompt.includes('show all tasks') || prompt.includes('reset filter') || prompt.includes('all tasks')) {
      return { intent: 'FILTER_TASKS', status: 'all', priority: 'all', category: 'all' };
    }

    // 6. SEARCH
    if (prompt.startsWith('search for') || prompt.startsWith('search ') || prompt.startsWith('find task') || prompt.startsWith('find ')) {
      let query = prompt.replace(/^search\s+(for\s+)?/i, '').replace(/^find\s+(task\s+)?/i, '').trim();
      return { intent: 'SEARCH_TASK', query: query };
    }

    // 7. STATISTICS & INSIGHTS
    if (prompt.includes('how many task') || prompt.includes('task stats') || prompt.includes('statistics') || prompt.includes('completion rate') || prompt.includes('progress summary')) {
      return { intent: 'GET_STATISTICS' };
    }
    if (prompt.includes('what should i work on') || prompt.includes('recommendation') || prompt.includes('insight') || prompt.includes('what to do first') || prompt.includes('productivity tip')) {
      return { intent: 'GET_PRODUCTIVITY_INSIGHT' };
    }

    // 8. COMPLETE TASK
    if (prompt.includes('complete') || prompt.includes('mark as complete') || prompt.includes('finish') || prompt.includes('check off')) {
      let target = rawPrompt
        .replace(/mark\s+(my\s+|the\s+)?/gi, '')
        .replace(/\s+as\s+(complete|completed|done)/gi, '')
        .replace(/complete\s+(the\s+|my\s+)?/gi, '')
        .replace(/finish\s+(the\s+|my\s+)?/gi, '')
        .replace(/check\s+off\s+(the\s+|my\s+)?/gi, '')
        .replace(/\s*task\s*/gi, '')
        .trim();
      return { intent: 'COMPLETE_TASK', target: target };
    }

    // 9. DELETE TASK
    if (prompt.includes('delete') || prompt.includes('remove') || prompt.includes('erase')) {
      let target = rawPrompt
        .replace(/delete\s+(my\s+|the\s+)?/gi, '')
        .replace(/remove\s+(my\s+|the\s+)?/gi, '')
        .replace(/\s*task\s*/gi, '')
        .trim();
      return { intent: 'DELETE_TASK', target: target };
    }

    // 10. EDIT TASK
    if (prompt.includes('change') || prompt.includes('edit') || prompt.includes('rename') || prompt.includes('move')) {
      return parseEditIntent(rawPrompt);
    }

    // 11. CREATE TASK
    if (prompt.includes('add') || prompt.includes('create') || prompt.includes('new task') || prompt.includes('remind me')) {
      return parseCreateIntent(rawPrompt);
    }

    // Fallback: Only create task if prompt has explicit creation action verbs
    const hasCreateVerb = /add|create|new|remind|task|todo|schedule|set/i.test(prompt);
    if (hasCreateVerb) {
      return parseCreateIntent(rawPrompt);
    }

    return { intent: 'UNKNOWN' };
  }

  function processAiCommand(rawPrompt) {
    const action = parseAiIntent(rawPrompt);
    const actionId = 'act_' + Date.now();

    // 0. GREETING
    if (action.intent === 'GREETING') {
      const greetingHtml = `👋 Hello! I am <strong>TaskFlow AI</strong>, your intelligent productivity companion.<br><br>Here are some commands you can try:<br>• ➕ <em>"Add a high priority study task for tomorrow"</em><br>• ✅ <em>"Mark my project task as completed"</em><br>• 🧹 <em>"Delete my shopping task"</em><br>• 🔍 <em>"Show high priority tasks"</em><br>• 🎨 <em>"Turn dark mode on"</em><br>• 📊 <em>"What are my statistics?"</em>`;
      speakAiResponse("Hello! I am TaskFlow AI, your intelligent productivity companion. How can I help you today?");
      return greetingHtml;
    }

    if (action.intent === 'UNKNOWN') {
      const activeCount = tasks.filter(t => !t.completed).length;
      const text = `💡 <strong>TaskFlow AI Assistant</strong>:<br>I received: <em>"${escapeHtml(rawPrompt)}"</em>.<br><br>You currently have <strong>${activeCount} active task(s)</strong>. Try asking me to:<br>• ➕ <em>"Add a study task for tomorrow"</em><br>• 🔥 <em>"Show high priority tasks"</em><br>• 🌙 <em>"Turn dark mode on"</em><br>• 📊 <em>"What are my task stats?"</em>`;
      speakAiResponse(`I received your request. You have ${activeCount} active tasks.`);
      return text;
    }

    // 1. CREATE TASK (INSTANT EXECUTION)
    if (action.intent === 'CREATE_TASK') {
      const newTask = {
        id: generateId(),
        title: action.title,
        description: 'Created via TaskFlow AI',
        category: action.category || 'Other',
        priority: (action.priority || 'medium').toLowerCase(),
        dueDate: action.dueDate || getTodayStr(),
        completed: false,
        subtasks: [],
        createdAt: Date.now()
      };
      tasks.unshift(newTask);
      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();
      loadTimelineForSelectedDate();
      playChime();
      showToast(`Task "${action.title}" created! 🚀`, 'success');
      speakAiResponse(`Created task ${action.title}.`);

      return `🚀 **Task Created Successfully!**<br>• **Title**: "${escapeHtml(action.title)}"<br>• **Category**: ${action.category}<br>• **Priority**: ${action.priority.toUpperCase()}<br>• **Due Date**: ${action.dueDate || 'Today'}`;
    }

    // 2. COMPLETE TASK (INSTANT EXECUTION)
    if (action.intent === 'COMPLETE_TASK') {
      let matches = tasks.filter(t => !t.completed && (action.target ? t.title.toLowerCase().includes(action.target.toLowerCase()) : true));
      if (matches.length === 0) {
        speakAiResponse("No active matching tasks found to complete.");
        return "ℹ️ No active matching tasks found to complete!";
      }

      const match = matches[0];
      match.completed = true;
      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();
      loadTimelineForSelectedDate();
      playChime();
      showToast(`Task "${match.title}" completed! 🎉`, 'success');
      speakAiResponse(`Marked task ${match.title} as completed.`);

      return `✅ **Task Completed!**<br>Marked <strong>"${escapeHtml(match.title)}"</strong> as done.`;
    }

    // 3. DELETE TASK (INSTANT EXECUTION)
    if (action.intent === 'DELETE_TASK') {
      let matches = tasks.filter(t => action.target ? t.title.toLowerCase().includes(action.target.toLowerCase()) : true);
      if (matches.length === 0) {
        speakAiResponse("No matching task found to delete.");
        return "ℹ️ No matching task found to delete!";
      }

      const match = matches[0];
      tasks = tasks.filter(t => t.id !== match.id);
      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();
      loadTimelineForSelectedDate();
      showToast(`Task "${match.title}" deleted`, 'danger');
      speakAiResponse(`Deleted task ${match.title}.`);

      return `🧹 **Task Deleted!**<br>Removed <strong>"${escapeHtml(match.title)}"</strong>.`;
    }

    // 4. CLEAR COMPLETED (INSTANT EXECUTION)
    if (action.intent === 'CLEAR_COMPLETED') {
      const initialCount = tasks.length;
      tasks = tasks.filter(t => !t.completed);
      const clearedCount = initialCount - tasks.length;

      if (clearedCount === 0) {
        speakAiResponse("You have no completed tasks to clear.");
        return "ℹ️ You have no completed tasks to clear!";
      }

      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();
      loadTimelineForSelectedDate();
      showToast(`Cleared ${clearedCount} completed tasks`, 'info');
      speakAiResponse(`Cleared ${clearedCount} completed tasks.`);

      return `✨ **Cleared ${clearedCount} completed task(s)!**`;
    }

    // 5. EDIT TASK
    if (action.intent === 'EDIT_TASK') {
      let matches = tasks.filter(t => action.target ? t.title.toLowerCase().includes(action.target.toLowerCase()) : true);
      if (matches.length === 0) {
        speakAiResponse("No task found matching your edit request.");
        return "ℹ️ No matching task found to edit!";
      }

      const match = matches[0];
      Object.assign(match, action.updates);
      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();

      speakAiResponse(`Updated task ${match.title}.`);
      return `✏️ **Task Updated!**<br>• **Title**: "${escapeHtml(match.title)}"<br>• **Category**: ${match.category}<br>• **Priority**: ${match.priority.toUpperCase()}`;
    }

    // 6. NAVIGATION
    if (action.intent === 'NAVIGATE') {
      if (action.target === 'dashboard') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action.target === 'tasks') {
        const el = document.querySelector('.tasks-list-section') || document.getElementById('tasks-list');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (action.target === 'calendar') {
        const el = document.getElementById('calendar-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (action.target === 'settings') {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.style.display = 'flex';
      }
      speakAiResponse(`Navigated to ${action.target}.`);
      return `🧭 Navigated to **${action.target}**!`;
    }

    if (action.intent === 'OPEN_ASSISTANT') {
      if (aiChatWindow) aiChatWindow.style.display = 'flex';
      return `✨ TaskFlow AI is open and active!`;
    }

    if (action.intent === 'CLOSE_ASSISTANT') {
      if (aiChatWindow) aiChatWindow.style.display = 'none';
      return `👋 Minimizing assistant. Click the float button anytime!`;
    }

    // 7. THEME
    if (action.intent === 'CHANGE_THEME') {
      const isDark = action.theme === 'dark';
      document.body.setAttribute('data-theme', action.theme);
      if (themeToggle) themeToggle.checked = isDark;
      localStorage.setItem('taskflow-theme', action.theme);
      speakAiResponse(`Switched to ${action.theme} mode.`);
      return `🎨 Switched to **${action.theme.toUpperCase()} Mode**!`;
    }

    // 8. SOUND
    if (action.intent === 'TOGGLE_SOUND') {
      soundEnabled = action.state === 'on';
      localStorage.setItem('taskflow-sound', soundEnabled);
      updateSoundUI();
      if (soundEnabled) playToggleSound(true);
      speakAiResponse(`Sound effects ${action.state}.`);
      return `🔊 Sound effects **${action.state.toUpperCase()}**!`;
    }

    // 9. FILTERS
    if (action.intent === 'FILTER_TASKS') {
      if (action.status) {
        statusFilterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.status === action.status);
        });
      }
      renderTasks();
      speakAiResponse(`Filtered tasks by ${action.status || action.priority}.`);
      return `🔍 Applied filter for **${action.status || action.priority}** tasks!`;
    }

    // 10. SEARCH
    if (action.intent === 'SEARCH_TASK') {
      if (searchInput) {
        searchInput.value = action.query;
        const el = document.querySelector('.tasks-list-section') || document.getElementById('tasks-list');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        renderTasks();
      }
      speakAiResponse(`Searching for ${action.query}.`);
      return `🔍 Searching for **"${escapeHtml(action.query)}"**...`;
    }

    // 11. STATISTICS
    if (action.intent === 'GET_STATISTICS') {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      const active = total - completed;
      const highCount = tasks.filter(t => !t.completed && t.priority === 'high').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const summary = `You have ${total} total tasks, with ${active} active and ${completed} completed. Your completion rate is ${rate}%.`;
      speakAiResponse(summary);

      return `📊 **Your Productivity Summary**:<br>• **Total Tasks**: ${total}<br>• **Active Tasks**: ${active}<br>• **Completed Tasks**: ${completed}<br>• **High Priority**: ${highCount}<br>• **Completion Rate**: **${rate}%**`;
    }

    // 12. PRODUCTIVITY INSIGHT
    if (action.intent === 'GET_PRODUCTIVITY_INSIGHT') {
      const activeHigh = tasks.filter(t => !t.completed && t.priority === 'high');
      const activeCount = tasks.filter(t => !t.completed).length;
      let text = '';

      if (activeHigh.length > 0) {
        text = `You have <strong>${activeHigh.length} high-priority task(s)</strong> remaining. Your top priority is <em>"${escapeHtml(activeHigh[0].title)}"</em> — that's the best place to focus first!`;
      } else if (activeCount > 0) {
        text = `You have <strong>${activeCount} active task(s)</strong>. All urgent items are completed, so you're in great shape to tackle medium/low priority goals!`;
      } else {
        text = `🎉 All your tasks are completed! Enjoy your free time or add your next goal.`;
      }

      speakAiResponse(text.replace(/<[^>]*>?/gm, ''));
      return `💡 **AI Productivity Insight**:<br>${text}`;
    }

    // Default Fallback
    return `✨ I am ready to manage your tasks! You can say:<br>• *"Add a high priority study task for tomorrow"*<br>• *"Mark my project task as completed"*<br>• *"Show my productivity statistics"*<br>• *"Turn dark mode on"*`;
  }

  // ==========================================
  // GOOGLE CALENDAR INTEGRATION
  // ==========================================
  function onGCalAuthChange() {
    if (!window.GoogleCalendarAPI) return;
    
    if (window.GoogleCalendarAPI.isSignedIn()) {
      if (gcalConnectBtn) gcalConnectBtn.style.display = 'none';
      if (gcalConnectedInfo) gcalConnectedInfo.style.display = 'flex';
      if (gcalUserEmail) gcalUserEmail.textContent = window.GoogleCalendarAPI.getUserEmail() || 'Connected';
      loadTimelineForSelectedDate();
    } else {
      if (gcalConnectBtn) gcalConnectBtn.style.display = 'inline-flex';
      if (gcalConnectedInfo) gcalConnectedInfo.style.display = 'none';
      if (gcalUserEmail) gcalUserEmail.textContent = '';
      showTimelineEmpty();
    }
  }

  if (gcalConnectBtn) {
    gcalConnectBtn.addEventListener('click', () => {
      if (window.GoogleCalendarAPI) window.GoogleCalendarAPI.signIn();
    });
  }

  if (gcalDisconnectBtn) {
    gcalDisconnectBtn.addEventListener('click', () => {
      if (window.GoogleCalendarAPI) window.GoogleCalendarAPI.signOut();
    });
  }

  if (gcalSettingsBtn) {
    gcalSettingsBtn.addEventListener('click', () => {
      if (gcalConfigModal) {
        if (gcalClientIdInput) gcalClientIdInput.value = localStorage.getItem('taskflow-gcal-clientid') || '';
        if (gcalApiKeyInput) gcalApiKeyInput.value = localStorage.getItem('taskflow-gcal-apikey') || '';
        gcalConfigModal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  if (gcalConfigCloseBtn && gcalConfigModal) {
    gcalConfigCloseBtn.addEventListener('click', () => {
      gcalConfigModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (gcalDemoModeBtn && window.GoogleCalendarAPI) {
    gcalDemoModeBtn.addEventListener('click', () => {
      window.GoogleCalendarAPI.enableDemoMode();
      if (gcalConfigModal) gcalConfigModal.setAttribute('aria-hidden', 'true');
      showToast('Google Calendar Demo Sync enabled! ✨', 'success');
      loadTimelineForSelectedDate();
    });
  }

  if (gcalSaveConfigBtn && window.GoogleCalendarAPI) {
    gcalSaveConfigBtn.addEventListener('click', () => {
      const clientId = gcalClientIdInput ? gcalClientIdInput.value.trim() : '';
      const apiKey = gcalApiKeyInput ? gcalApiKeyInput.value.trim() : '';

      if (clientId && apiKey) {
        window.GoogleCalendarAPI.setCredentials(clientId, apiKey);
        if (gcalConfigModal) gcalConfigModal.setAttribute('aria-hidden', 'true');
        showToast('Google API Credentials saved!', 'success');
      } else {
        showToast('Please enter both Client ID and API Key, or click Demo Sync', 'warning');
      }
    });
  }

  if (importEventsBtn) {
    importEventsBtn.addEventListener('click', async () => {
      if (!window.GoogleCalendarAPI || !window.GoogleCalendarAPI.isSignedIn()) {
        if (window.GoogleCalendarAPI) window.GoogleCalendarAPI.enableDemoMode();
      }
      try {
        const events = await window.GoogleCalendarAPI.fetchUpcomingEvents(7);
        if (!events || events.length === 0) {
          showToast('No upcoming events found in Calendar', 'info');
          return;
        }
        let imported = 0;
        events.forEach(ev => {
          if (!tasks.find(t => t.title === ev.summary)) {
            const newTask = {
              id: generateId(),
              title: ev.summary,
              description: ev.description || '',
              category: 'Other',
              priority: 'medium',
              dueDate: ev.start ? (ev.start.date || (ev.start.dateTime ? ev.start.dateTime.split('T')[0] : '')) : '',
              completed: false,
              subtasks: [],
              createdAt: Date.now(),
              calendarEventId: ev.id
            };
            tasks.push(newTask);
            imported++;
          }
        });
        if (imported > 0) {
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          loadTimelineForSelectedDate();
          showToast(`Imported ${imported} events into TaskFlow`, 'success');
        } else {
          showToast('All calendar events already imported', 'info');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to import events', 'danger');
      }
    });
  }

  // ==========================================
  // WEEK PICKER & TIMELINE LOGIC
  // ==========================================
  function initWeekPicker() {
    renderWeekPicker();
    if (weekPrevBtn) weekPrevBtn.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      renderWeekPicker();
    });
    if (weekNextBtn) weekNextBtn.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      renderWeekPicker();
    });
  }

  function renderWeekPicker() {
    if (!weekDaysContainer) return;
    weekDaysContainer.innerHTML = '';
    const todayStr = getTodayStr();
    
    let loopDate = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const dateStr = formatDate(loopDate);
      const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = loopDate.getDate();
      
      const btn = document.createElement('div');
      btn.className = 'week-day-item';
      if (dateStr === selectedDate) btn.classList.add('active');
      btn.dataset.date = dateStr;
      
      btn.innerHTML = `<span class="week-day-name">${dayName}</span><span class="week-day-num">${dayNum}</span>`;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.week-day-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        selectedDate = dateStr;
        loadTimelineForSelectedDate();
      });
      
      weekDaysContainer.appendChild(btn);
      loopDate.setDate(loopDate.getDate() + 1);
    }
    loadTimelineForSelectedDate();
  }

  async function loadTimelineForSelectedDate() {
    if (!timelineEvents || !timelineEmpty) return;
    
    let calendarEvents = [];
    if (window.GoogleCalendarAPI) {
      try {
        calendarEvents = await window.GoogleCalendarAPI.fetchEventsForDate(selectedDate);
      } catch(e) {
        console.error("Timeline fetch error", e);
      }
    }

    const todayStr = getTodayStr();
    const isTodaySelected = (selectedDate === todayStr);
    
    let dayTasks = tasks.filter(t => t.dueDate === selectedDate);
    if (dayTasks.length === 0 && isTodaySelected) {
      dayTasks = tasks.filter(t => !t.completed);
    }
    
    timelineEmpty.style.display = 'none';
    timelineEvents.style.display = 'flex';
    timelineEvents.innerHTML = '';

    if (calendarEvents.length === 0 && dayTasks.length === 0) {
      const defaultScheduleItems = [
        { title: 'Morning Focus & Planning Session', desc: 'Review daily goals & top priorities', time: '09:00 AM', completed: false },
        { title: 'Deep Work & Task Execution', desc: 'Execute active tasks and project deliverables', time: '11:30 AM', completed: false },
        { title: 'Daily Review & Progress Check', desc: 'Wrap up completed tasks and sync stats', time: '04:30 PM', completed: false }
      ];

      defaultScheduleItems.forEach(item => {
        timelineEvents.appendChild(createTimelineItem(item));
      });
      return;
    }
    
    dayTasks.forEach(task => {
      timelineEvents.appendChild(createTimelineItem({
        title: task.title,
        desc: task.description || `${task.category} Task`,
        time: task.dueDate ? `Due ${task.dueDate}` : 'Due Today',
        completed: task.completed
      }));
    });

    calendarEvents.forEach(ev => {
      const timeStr = ev.start.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All Day';
      timelineEvents.appendChild(createTimelineItem({
        title: ev.summary,
        desc: ev.description || 'Google Calendar Event',
        time: timeStr,
        completed: false
      }));
    });
  }

  function showTimelineEmpty() {
    if (timelineEmpty) timelineEmpty.style.display = 'block';
    if (timelineEvents) timelineEvents.style.display = 'none';
  }

  function createTimelineItem(item) {
    const wrap = document.createElement('div');
    wrap.className = 'timeline-item';
    wrap.innerHTML = `
      <span class="timeline-time">${item.time}</span>
      <div class="timeline-card" style="${item.completed ? 'opacity:0.6; text-decoration:line-through;' : ''}">
        <div>
          <div class="timeline-card-title">${escapeHtml(item.title)}</div>
          <div class="timeline-card-sub">${escapeHtml(item.desc)}</div>
        </div>
      </div>
    `;
    return wrap;
  }

  // ==========================================
  // RENDER TODAY'S TASKS CAROUSEL CARDS
  // ==========================================
  function renderTodayCards() {
    if (!todayCardsScroll) return;
    todayCardsScroll.innerHTML = '';

    let activeTasks = tasks.filter(t => !t.completed);

    if (currentFilters.search.trim() !== '') {
      const q = currentFilters.search.toLowerCase().trim();
      activeTasks = activeTasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.priority && t.priority.toLowerCase().includes(q)) ||
        (t.dueDate && t.dueDate.toLowerCase().includes(q))
      );
    }

    if (activeTasks.length === 0) {
      todayCardsScroll.appendChild(todayEmpty);
      todayEmpty.style.display = 'block';
      return;
    }

    todayEmpty.style.display = 'none';
    const displayTasks = activeTasks.slice(0, 6);

    displayTasks.forEach((task, index) => {
      const gradClass = `grad-${index % 5}`;
      const card = document.createElement('div');
      card.className = `today-card ${gradClass}`;
      
      const subtaskText = task.subtasks && task.subtasks.length > 0 
        ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} Subtasks` 
        : (task.dueDate ? `Due ${task.dueDate}` : 'No Due Date');

      card.innerHTML = `
        <div class="today-card-top">
          <span class="today-card-tag">${escapeHtml(task.category)}</span>
          <button class="today-card-action" title="Mark Done" data-id="${task.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
        <div class="today-card-title">${escapeHtml(task.title)}</div>
        <div class="today-card-bottom">
          <span>${subtaskText}</span>
          <span style="font-weight:700;">${task.priority.toUpperCase()}</span>
        </div>
      `;

      const actionBtn = card.querySelector('.today-card-action');
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskComplete(task.id);
      });

      card.addEventListener('click', () => {
        openEditModal(task.id);
      });

      todayCardsScroll.appendChild(card);
    });
  }

  // ==========================================
  // MAIN RENDER TASKS & STATS
  // ==========================================
  function renderTasks() {
    if (!tasksList) return;
    tasksList.innerHTML = '';

    let filtered = filterTasks(tasks);

    if (filtered.length === 0) {
      if (currentFilters.search !== '' || currentFilters.status !== 'all' || currentFilters.category !== 'all') {
        if (emptyStateSearch) emptyStateSearch.style.display = 'block';
        if (emptyStateInitial) emptyStateInitial.style.display = 'none';
      } else {
        if (emptyStateInitial) emptyStateInitial.style.display = 'block';
        if (emptyStateSearch) emptyStateSearch.style.display = 'none';
      }
    } else {
      if (emptyStateInitial) emptyStateInitial.style.display = 'none';
      if (emptyStateSearch) emptyStateSearch.style.display = 'none';

      filtered.forEach(task => {
        const taskEl = createTaskElement(task);
        tasksList.appendChild(taskEl);
      });
    }
  }

  function filterTasks(allTasks) {
    let result = [...allTasks];

    if (currentFilters.status === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentFilters.status === 'completed') {
      result = result.filter(t => t.completed);
    } else if (['high', 'medium', 'low'].includes(currentFilters.status.toLowerCase())) {
      result = result.filter(t => (t.priority || 'medium').toLowerCase() === currentFilters.status.toLowerCase());
    }

    if (currentFilters.category !== 'all') {
      result = result.filter(t => (t.category || 'other').toLowerCase() === currentFilters.category.toLowerCase());
    }

    if (currentFilters.search.trim() !== '') {
      const q = currentFilters.search.toLowerCase().trim();
      result = result.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.priority && t.priority.toLowerCase().includes(q)) ||
        (t.dueDate && t.dueDate.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (currentFilters.sort === 'newest') return b.createdAt - a.createdAt;
      if (currentFilters.sort === 'oldest') return a.createdAt - b.createdAt;
      if (currentFilters.sort === 'priority-desc') {
        const weights = { high: 3, medium: 2, low: 1 };
        const weightB = weights[(b.priority || 'medium').toLowerCase()] || 2;
        const weightA = weights[(a.priority || 'medium').toLowerCase()] || 2;
        return weightB - weightA;
      }
      if (currentFilters.sort === 'due-date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (currentFilters.sort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }

  function createTaskElement(task) {
    const item = document.createElement('div');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.dataset.id = task.id;

    const catClass = task.category.toLowerCase();
    const prioClass = task.priority.toLowerCase();

    item.innerHTML = `
      <div class="task-main-row">
        <div class="custom-checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}">
          ${task.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-tags">
            <span class="tag-badge ${catClass}">${escapeHtml(task.category)}</span>
            <span class="tag-badge ${prioClass}">${escapeHtml(task.priority.toUpperCase())}</span>
            ${task.dueDate ? `<span class="tag-badge due">📅 ${task.dueDate}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-icon-btn edit-btn" title="Edit Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-icon-btn delete-btn delete" title="Delete Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;

    if (task.subtasks && task.subtasks.length > 0) {
      const subContainer = document.createElement('div');
      subContainer.className = 'subtasks-container';

      task.subtasks.forEach(sub => {
        const subItem = document.createElement('div');
        subItem.className = `subtask-item ${sub.completed ? 'completed' : ''}`;
        subItem.innerHTML = `
          <input type="checkbox" ${sub.completed ? 'checked' : ''}>
          <span>${escapeHtml(sub.title)}</span>
        `;
        subItem.querySelector('input').addEventListener('change', () => {
          sub.completed = !sub.completed;
          saveTasks();
          renderTasks();
          renderTodayCards();
          updateStats();
        });
        subContainer.appendChild(subItem);
      });

      item.appendChild(subContainer);
    }

    item.querySelector('.custom-checkbox').addEventListener('click', () => {
      toggleTaskComplete(task.id);
    });

    item.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(task.id);
    });

    item.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteTask(task.id);
    });

    return item;
  }

  function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
      playChime();
      showToast('Task marked as completed! 🎉', 'success');
    }
    
    saveTasks();
    renderTodayCards();
    renderTasks();
    updateStats();
    updateWeeklyChart();
    loadTimelineForSelectedDate();
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (valTotal) valTotal.textContent = `${total} tasks`;
    if (valActive) valActive.textContent = active;
    if (valCompleted) valCompleted.textContent = completed;
    if (valRate) valRate.textContent = `${rate}%`;

    if (taskCountHighlight) {
      taskCountHighlight.textContent = `${active} tasks`;
    }
  }

  function updateWeeklyChart() {
    if (!weeklyBarsContainer) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    tasks.forEach(t => {
      if (t.completed) {
        const d = new Date(t.createdAt);
        const dayStr = days[(d.getDay() + 6) % 7];
        counts[dayStr] = (counts[dayStr] || 0) + 1;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    let totalDone = 0;

    days.forEach(day => {
      const cnt = counts[day];
      totalDone += cnt;
      const barFill = document.getElementById(`bar-${day}`);
      const countEl = document.getElementById(`count-${day}`);

      if (barFill) {
        const pct = Math.max(Math.round((cnt / maxCount) * 100), 10);
        barFill.style.height = `${pct}%`;
      }
      if (countEl) countEl.textContent = cnt;
    });

    if (weeklyTotalText) weeklyTotalText.textContent = `${totalDone} Completed`;
  }

  // ==========================================
  // EVENT LISTENERS SETUP
  // ==========================================
  function setupEventListeners() {
    // Menu Drawer
    if (menuBtn) menuBtn.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // Profile Modal
    if (profileBtn) profileBtn.addEventListener('click', openProfileModal);
    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeProfileModal);
    if (profileSaveBtn) {
      profileSaveBtn.addEventListener('click', () => {
        const newName = profileNameInput.value.trim();
        if (newName) {
          userName = newName;
          localStorage.setItem('taskflow-username', userName);
          updateGreeting();
          closeProfileModal();
          showToast(`Profile name updated to ${userName}`, 'success');
        }
      });
    }

    if (seeAllBtn) {
      seeAllBtn.addEventListener('click', () => {
        const tasksSection = document.querySelector('.tasks-list-section');
        if (tasksSection) tasksSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    statCircleCards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.cat;
        if (cat === 'todo') {
          currentFilters.status = 'active';
        } else if (cat === 'done') {
          currentFilters.status = 'completed';
        } else if (cat === 'progress') {
          const rateVal = valRate ? valRate.textContent : '0%';
          showToast(`Total task completion rate: ${rateVal}`, 'info');
          return;
        }
        
        statusFilterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.status === currentFilters.status);
        });

        renderTasks();
        const tasksSection = document.querySelector('.tasks-list-section');
        if (tasksSection) tasksSection.scrollIntoView({ behavior: 'smooth' });
      });
    });

    statusFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        statusFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.status = btn.dataset.status;
        renderTasks();
        closeDrawer();
      });
    });

    categoryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.category = btn.dataset.category;
        renderTasks();
        closeDrawer();
      });
    });

    // SEARCH INPUT EVENT LISTENERS
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        if (clearSearchBtn) clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
        renderTodayCards();
        renderTasks();
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          currentFilters.search = searchInput.value;
          renderTodayCards();
          renderTasks();
          const tasksSection = document.querySelector('.tasks-list-section');
          if (tasksSection) tasksSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentFilters.search = '';
        clearSearchBtn.style.display = 'none';
        renderTodayCards();
        renderTasks();
      });
    }

    if (searchActionBtn) {
      searchActionBtn.addEventListener('click', () => {
        if (searchInput) currentFilters.search = searchInput.value;
        renderTodayCards();
        renderTasks();
        const tasksSection = document.querySelector('.tasks-list-section');
        if (tasksSection) tasksSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        renderTasks();
      });
    }

    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
          showToast('No completed tasks to clear', 'info');
          return;
        }
        openConfirmModal(`Clear ${completedCount} completed tasks?`, () => {
          tasks = tasks.filter(t => !t.completed);
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          loadTimelineForSelectedDate();
          showToast(`Cleared ${completedCount} completed tasks`, 'success');
        });
      });
    }

    if (toggleAdvancedBtn && advancedFields) {
      toggleAdvancedBtn.addEventListener('click', () => {
        const isHidden = advancedFields.style.display === 'none';
        advancedFields.style.display = isHidden ? 'flex' : 'none';
        toggleAdvancedBtn.querySelector('.arrow-icon').style.transform = isHidden ? 'rotate(180deg)' : 'none';
      });
    }

    if (btnAddSubtask && subtaskBuilderInput) {
      btnAddSubtask.addEventListener('click', () => {
        const text = subtaskBuilderInput.value.trim();
        if (text) {
          addSubtasks.push({ title: text, completed: false });
          subtaskBuilderInput.value = '';
          renderSubtaskBuilderList(subtaskBuilderList, addSubtasks);
        }
      });
    }

    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();

        if (!title) {
          if (titleError) titleError.parentElement.classList.add('error');
          return;
        }
        if (titleError) titleError.parentElement.classList.remove('error');

        const newTask = {
          id: generateId(),
          title: title,
          description: taskDescInput ? taskDescInput.value.trim() : '',
          category: taskCategorySelect ? taskCategorySelect.value : 'Other',
          priority: taskPrioritySelect ? taskPrioritySelect.value.toLowerCase() : 'medium',
          dueDate: taskDateInput ? taskDateInput.value : '',
          completed: false,
          subtasks: [...addSubtasks],
          createdAt: Date.now()
        };

        tasks.unshift(newTask);
        saveTasks();

        taskTitleInput.value = '';
        if (taskDescInput) taskDescInput.value = '';
        if (taskDateInput) taskDateInput.value = '';
        addSubtasks = [];
        if (subtaskBuilderList) subtaskBuilderList.innerHTML = '';
        if (advancedFields) advancedFields.style.display = 'none';

        renderTodayCards();
        renderTasks();
        updateStats();
        updateWeeklyChart();
        loadTimelineForSelectedDate();
        showToast('New task created! 🚀', 'success');
      });
    }

    if (editBtnAddSubtask && editSubtaskBuilderInput) {
      editBtnAddSubtask.addEventListener('click', () => {
        const text = editSubtaskBuilderInput.value.trim();
        if (text) {
          editSubtasks.push({ title: text, completed: false });
          editSubtaskBuilderInput.value = '';
          renderSubtaskBuilderList(editSubtaskBuilderList, editSubtasks);
        }
      });
    }

    if (editCloseBtn) editCloseBtn.addEventListener('click', closeEditModal);
    if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditModal);

    if (editTaskForm) {
      editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = editTitleInput.value.trim();
        if (!title) {
          if (editTitleError) editTitleError.parentElement.classList.add('error');
          return;
        }

        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
          task.title = title;
          task.category = editCategorySelect.value;
          task.priority = editPrioritySelect.value.toLowerCase();
          task.dueDate = editDateInput.value;
          task.description = editDescInput.value.trim();
          task.subtasks = [...editSubtasks];

          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          loadTimelineForSelectedDate();
          closeEditModal();
          showToast('Task updated successfully', 'success');
        }
      });
    }

    if (confirmCloseBtn) confirmCloseBtn.addEventListener('click', closeConfirmModal);
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', closeConfirmModal);
    if (confirmActionBtn) {
      confirmActionBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
      });
    }
  }

  // ==========================================
  // HELPERS & PERSISTENCE
  // ==========================================
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !editModal) return;

    editingTaskId = taskId;
    editTaskId.value = task.id;
    editTitleInput.value = task.title;
    editCategorySelect.value = task.category;
    const p = (task.priority || 'medium').toLowerCase();
    editPrioritySelect.value = p.charAt(0).toUpperCase() + p.slice(1);
    editDateInput.value = task.dueDate || '';
    editDescInput.value = task.description || '';
    editSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];

    renderSubtaskBuilderList(editSubtaskBuilderList, editSubtasks);

    editModal.setAttribute('aria-hidden', 'false');
  }

  function closeEditModal() {
    if (editModal) editModal.setAttribute('aria-hidden', 'true');
    editingTaskId = null;
  }

  function openConfirmModal(msg, callback) {
    if (confirmMessage) confirmMessage.textContent = msg;
    confirmCallback = callback;
    if (confirmModal) confirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeConfirmModal() {
    if (confirmModal) confirmModal.setAttribute('aria-hidden', 'true');
    confirmCallback = null;
  }

  function confirmDeleteTask(taskId) {
    openConfirmModal('Are you sure you want to delete this task?', () => {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTodayCards();
      renderTasks();
      updateStats();
      updateWeeklyChart();
      loadTimelineForSelectedDate();
      showToast('Task deleted', 'danger');
    });
  }

  function renderSubtaskBuilderList(container, list) {
    if (!container) return;
    container.innerHTML = '';
    list.forEach((sub, idx) => {
      const li = document.createElement('li');
      li.className = 'subtask-builder-item';
      li.innerHTML = `
        <span>${escapeHtml(sub.title)}</span>
        <button type="button">✕</button>
      `;
      li.querySelector('button').addEventListener('click', () => {
        list.splice(idx, 1);
        renderSubtaskBuilderList(container, list);
      });
      container.appendChild(li);
    });
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function initTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.checked = (theme === 'dark');
      themeToggle.addEventListener('change', (e) => {
        theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskflow-theme', theme);
      });
    }
  }

  function updateSoundUI() {
    if (!soundToggle) return;
    const soundOnIcon = soundToggle.querySelector('.icon-sound-on');
    const soundOffIcon = soundToggle.querySelector('.icon-sound-off');
    if (soundOnIcon && soundOffIcon) {
      soundOnIcon.style.display = soundEnabled ? 'inline-flex' : 'none';
      soundOffIcon.style.display = soundEnabled ? 'none' : 'inline-flex';
    }
    soundToggle.setAttribute('aria-pressed', soundEnabled);
    soundToggle.title = soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Disabled';
    soundToggle.classList.toggle('active', soundEnabled);
  }

  function initSound() {
    updateSoundUI();
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('taskflow-sound', soundEnabled);
        updateSoundUI();
        playToggleSound(soundEnabled);
        showToast(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`, 'info');
      });
    }
  }

  function playToggleSound(enabled) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const now = audioCtx.currentTime;
      
      if (enabled) {
        // High double-tone ascending chime for ON
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(523.25, now);       // C5
        osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.12);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.35);
      } else {
        // Soft double-tone descending sound for OFF
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(659.25, now);       // E5
        osc2.frequency.setValueAtTime(440.00, now + 0.08); // A4
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.1);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.3);
      }
    } catch(e) {
      console.error("Audio error", e);
    }
  }

  function playChime() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) { console.error("Audio error", e); }
  }

  function showToast(msg, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function generateId() {
    return 'task_' + Math.random().toString(36).substr(2, 9);
  }

  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return map[match];
    });
  }

  function getSampleTasks() {
    const today = getTodayStr();
    return [
      {
        id: 'sample_1',
        title: 'Design Mobile App Homepage Mockup',
        description: 'Create high-fidelity wireframes and interactive prototypes for TaskFlow UI',
        category: 'Work',
        priority: 'high',
        dueDate: today,
        completed: false,
        subtasks: [
          { title: 'Header & Search component', completed: true },
          { title: 'Gradient task cards carousel', completed: true },
          { title: 'Timeline & schedule section', completed: false }
        ],
        createdAt: Date.now() - 3600000 * 5
      },
      {
        id: 'sample_2',
        title: 'Google Calendar API Integration',
        description: 'Connect OAuth 2.0 and sync events with local schedule timeline',
        category: 'Study',
        priority: 'high',
        dueDate: today,
        completed: false,
        subtasks: [
          { title: 'Initialize GIS & GAPI libraries', completed: true },
          { title: 'Fetch calendar events for day view', completed: false }
        ],
        createdAt: Date.now() - 3600000 * 3
      },
      {
        id: 'sample_3',
        title: 'Weekly Internship Project Review',
        description: 'Prepare documentation and demo presentation for evaluation',
        category: 'Personal',
        priority: 'medium',
        dueDate: today,
        completed: true,
        subtasks: [],
        createdAt: Date.now() - 3600000 * 24
      }
    ];
  }
});
