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
      else if (p.includes('medium')) updates.priority = 'medium';
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
      }
    ];
  }

  // ==========================================
  // TASKFLOW AI CHATBOT COPILOT MODULE
  // ==========================================
  function setupAiChatbot() {
    const aiTriggerBtn = document.getElementById('ai-trigger-btn');
    const headerAiBtn = document.getElementById('header-ai-btn');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiCloseBtn = document.getElementById('ai-close-btn');
    const aiChatMessages = document.getElementById('ai-chat-messages');
    const aiChatForm = document.getElementById('ai-chat-form');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiKeyInput = document.getElementById('ai-key-input');
    const aiKeySaveBtn = document.getElementById('ai-key-save-btn');
    const aiMicBtn = document.getElementById('ai-mic-btn');
    const aiStopMicBtn = document.getElementById('ai-stop-mic-btn');
    const aiListeningBanner = document.getElementById('ai-listening-banner');
    const aiTtsToggle = document.getElementById('ai-tts-toggle');
    const aiStopSpeechBtn = document.getElementById('ai-stop-speech-btn');
    const aiClearChat = document.getElementById('ai-clear-chat');

    let ttsEnabled = localStorage.getItem('taskflow-tts') !== 'false';
    let isRecording = false;
    let recognition = null;

    if (aiKeyInput) {
      aiKeyInput.value = aiApiKey || '';
    }

    if (aiKeySaveBtn && aiKeyInput) {
      aiKeySaveBtn.addEventListener('click', () => {
        const key = aiKeyInput.value.trim();
        aiApiKey = key;
        localStorage.setItem('taskflow-ai-key', key);
        showToast(key ? 'Gemini API Key saved!' : 'Cleared API Key. Using built-in AI.', 'info');
      });
    }

    if (aiStopSpeechBtn) {
      aiStopSpeechBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        showToast('AI stopped speaking', 'info');
      });
    }

    if (aiTtsToggle) {
      aiTtsToggle.style.opacity = ttsEnabled ? '1' : '0.5';
      aiTtsToggle.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        localStorage.setItem('taskflow-tts', ttsEnabled);
        aiTtsToggle.style.opacity = ttsEnabled ? '1' : '0.5';
        showToast(`Voice responses ${ttsEnabled ? 'enabled 🔊' : 'muted 🔇'}`, 'info');
        if (!ttsEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    if (aiClearChat && aiChatMessages) {
      aiClearChat.addEventListener('click', () => {
        aiChatMessages.innerHTML = `
          <div class="chat-msg bot-msg">
            <div class="chat-avatar">🤖</div>
            <div class="chat-text">
              Chat history cleared! Ask me anything or speak a command like <em>"add task Buy groceries"</em>!
              <div class="prompt-chips">
                <button type="button" class="chip-btn" data-prompt="Add task Finish project report">➕ Add Task</button>
                <button type="button" class="chip-btn" data-prompt="Turn dark mode on">🌙 Dark Mode</button>
                <button type="button" class="chip-btn" data-prompt="What are my top priorities for today?">🎯 Top Priorities</button>
              </div>
            </div>
          </div>
        `;
        showToast('Chat history cleared', 'info');
      });
    }

    function toggleAiChat() {
      if (!aiChatWindow) return;
      const isHidden = aiChatWindow.style.display === 'none' || !aiChatWindow.style.display;
      aiChatWindow.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && aiChatInput) {
        setTimeout(() => aiChatInput.focus(), 100);
      }
    }

    if (aiTriggerBtn) aiTriggerBtn.addEventListener('click', toggleAiChat);
    if (headerAiBtn) headerAiBtn.addEventListener('click', toggleAiChat);
    if (aiCloseBtn) aiCloseBtn.addEventListener('click', toggleAiChat);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleAiChat();
      }
    });

    // Voice Audio Recording (Web Speech API)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isRecording = true;
          if (aiMicBtn) aiMicBtn.classList.add('listening');
          if (aiListeningBanner) aiListeningBanner.style.display = 'flex';
          // Stop AI from talking when user starts speaking
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        };

        recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          if (aiChatInput) {
            // Append to existing text with a space if there's already text
            const currentVal = aiChatInput.value.trim();
            aiChatInput.value = currentVal ? currentVal + ' ' + transcript : transcript;
            aiChatInput.focus();
            showToast('Voice transcribed. You can edit before sending!', 'info');
          }
        };

        recognition.onerror = (err) => {
          console.warn('Speech recognition error:', err);
          stopVoiceRecording();
        };

        recognition.onend = () => {
          stopVoiceRecording();
        };
      } catch (err) {
        console.warn('Speech recognition setup error:', err);
      }
    }

    function startVoiceRecording() {
      if (!recognition) {
        showToast('Voice recording is not supported in your browser.', 'warning');
        return;
      }
      try {
        recognition.start();
      } catch (err) {
        stopVoiceRecording();
      }
    }

    function stopVoiceRecording() {
      isRecording = false;
      if (aiMicBtn) aiMicBtn.classList.remove('listening');
      if (aiListeningBanner) aiListeningBanner.style.display = 'none';
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
    }

    if (aiMicBtn) {
      aiMicBtn.addEventListener('click', () => {
        if (isRecording) {
          stopVoiceRecording();
        } else {
          startVoiceRecording();
        }
      });
    }

    if (aiStopMicBtn) {
      aiStopMicBtn.addEventListener('click', stopVoiceRecording);
    }

    // Prompt Chips Event Delegation
    if (aiChatMessages) {
      aiChatMessages.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (chip) {
          const promptText = chip.getAttribute('data-prompt') || chip.textContent.trim();
          if (promptText) {
            sendAiUserMessage(promptText);
          }
        }
      });
    }

    const aiSendBtn = document.getElementById('ai-send-btn');
    
    function handleAiSubmit(e) {
      if (e) e.preventDefault();
      const text = aiChatInput.value.trim();
      if (!text) return;
      sendAiUserMessage(text);
      aiChatInput.value = '';
    }

    if (aiChatForm && aiChatInput) {
      aiChatForm.addEventListener('submit', handleAiSubmit);
    }
    
    if (aiSendBtn) {
      aiSendBtn.addEventListener('click', handleAiSubmit);
    }

    async function sendAiUserMessage(promptText) {
      appendChatMessage('user', promptText);
      const typingElem = showTypingIndicator();

      try {
        const reply = await generateAiResponse(promptText);
        if (typingElem) typingElem.remove();
        appendChatMessage('bot', reply);
        speakAiText(reply);
      } catch (err) {
        console.error('AI Response Error:', err);
        if (typingElem) typingElem.remove();
        const fallbackReply = generateFallbackNlpResponse(promptText);
        appendChatMessage('bot', fallbackReply);
        speakAiText(fallbackReply);
      }
    }

    function speakAiText(text) {
      if (!ttsEnabled || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*_#`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('TTS Speech error:', err);
      }
    }

    function appendChatMessage(sender, htmlContent) {
      if (!aiChatMessages) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

      const avatar = document.createElement('div');
      avatar.className = 'chat-avatar';
      avatar.textContent = sender === 'user' ? '👤' : '🤖';

      const textDiv = document.createElement('div');
      textDiv.className = 'chat-text';
      textDiv.innerHTML = formatAiResponseMarkdown(htmlContent);

      msgDiv.appendChild(avatar);
      msgDiv.appendChild(textDiv);
      aiChatMessages.appendChild(msgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function showTypingIndicator() {
      if (!aiChatMessages) return null;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg bot-msg';
      msgDiv.innerHTML = `
        <div class="chat-avatar">🤖</div>
        <div class="chat-text">
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      aiChatMessages.appendChild(msgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      return msgDiv;
    }

    async function generateAiResponse(userPrompt) {
      // Check for direct Action Commands first!
      const actionResult = processDirectTaskActionCommand(userPrompt);
      if (actionResult) return actionResult;

      // 1. Primary: Try Server-Side Express Proxy (/api/chat)
      try {
        const serverRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userPrompt, tasks: tasks.slice(0, 10) })
        });

        if (serverRes.ok) {
          const data = await serverRes.json();
          if (data.success && data.text) {
            return data.text;
          }
        }
      } catch (e) {
        // Server route unavailable (e.g. static host), continue to client fallbacks
      }

      // 2. Secondary: Try Direct Gemini REST API if user saved API key in localStorage
      const key = aiApiKey || localStorage.getItem('taskflow-ai-key');
      if (key && key !== 'your_gemini_api_key_here') {
        const activeTasksStr = tasks.slice(0, 10).map(t => `- "${t.title}" (${t.category}, Priority: ${t.priority}, Due: ${t.dueDate || 'None'}, Completed: ${t.completed})`).join('\n');
        const systemPrompt = `You are TaskFlow AI, an intelligent productivity companion.
CURRENT USER TASKS:
${activeTasksStr}

USER PROMPT: "${userPrompt}"
Respond helpfully, concisely (under 120 words), and format with clean markdown.`;

        const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        for (const modelName of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });
            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) return text;
            }
          } catch (err) {
            console.warn(`Direct Gemini API failed with ${modelName}:`, err);
          }
        }
      }

      // 3. Fallback: Intelligent Client-Side NLP Engine
      return generateFallbackNlpResponse(userPrompt);
    }

    function processDirectTaskActionCommand(promptText) {
      const lower = promptText.toLowerCase().trim();

      // --- Helper: Extract task name from natural language ---
      function extractTaskName(input) {
        let name = input;
        // Remove common filler words and phrases to extract the actual task name
        name = name.replace(/^(hey|hi|hello|please|can you|could you|i want to|i'd like to|i would like to|would you|will you|go ahead and|just|kindly)\s+/gi, '');
        name = name.replace(/\s+(please|for me|from my tasks|from my list|from the list|from tasks|from the task list|in my tasks|in my list|right now|now|asap|immediately)$/gi, '');
        // Remove action verbs and connectors
        name = name.replace(/^(delete|remove|erase|trash|get rid of|eliminate|drop|cancel|complete|finish|mark as done|mark done|mark as completed|mark completed|check off)\s+/gi, '');
        // Remove "the task" / "a task" / "task" with optional "called" / "named" / "titled" / "with name" / "with title"
        name = name.replace(/^(the\s+)?task\s+(called|named|titled|with name|with title)?\s*/gi, '');
        name = name.replace(/^(called|named|titled)\s+/gi, '');
        // Remove surrounding quotes
        name = name.replace(/^["'\u201c\u201d\u2018\u2019]+|["'\u201c\u201d\u2018\u2019]+$/g, '');
        return name.trim();
      }

      // --- Helper: Find task by fuzzy title match ---
      function findTaskByName(searchName, taskList) {
        if (!searchName || searchName.length < 2) return null;
        const searchLower = searchName.toLowerCase();

        // 1. Exact match
        let found = taskList.find(t => t.title.toLowerCase() === searchLower);
        if (found) return found;

        // 2. Title contains search or search contains title
        if (searchName.length > 3) {
          found = taskList.find(t => t.title.toLowerCase().includes(searchLower) || searchLower.includes(t.title.toLowerCase()));
          if (found) return found;
        }

        // 3. Check if any task title words appear significantly in the search
        let bestMatch = null;
        let bestScore = 0;
        for (const t of taskList) {
          const titleWords = t.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
          const searchWords = searchLower.split(/\s+/).filter(w => w.length > 2);
          if (titleWords.length === 0) continue;
          const matchingWords = titleWords.filter(tw => searchWords.some(sw => sw.includes(tw) || tw.includes(sw)));
          const score = matchingWords.length / titleWords.length;
          if (score > bestScore && score >= 0.5) {
            bestScore = score;
            bestMatch = t;
          }
        }
        if (bestMatch) return bestMatch;

        // 4. Check if any task title appears anywhere in the full input (only safe for words > 3 chars)
        for (const t of taskList) {
          if (t.title.length > 3 && lower.includes(t.title.toLowerCase())) {
            return t;
          }
        }

        return null;
      }

      // --- INTENT 1: ADD / CREATE TASK ---
      const addKeywords = [
        'add task', 'add a task', 'create task', 'create a task', 'new task',
        'remind me to', 'i want to add', 'add this task', 'add a new task',
        'make a task', 'add writing assignment', 'please add'
      ];
      
      const cleanLower = lower.replace(/^(hey|hi|hello|please|can you|could you|i want to|i need to)\s+/i, '').trim();
      
      const isAddIntent = addKeywords.some(kw => lower.includes(kw))
        || (lower.includes('add') && lower.includes('task'))
        || /^(add|create|make|remind|schedule|review|update|fix|write|read|buy|call|email|send|check)\s+/i.test(cleanLower);

      if (isAddIntent && !lower.match(/\b(delete|remove|erase|trash|get rid of|eliminate|drop|complete|finish|mark as done|mark done|mark as completed|mark completed|check off)\b/)) {
        let taskTitle = '';

        // Extract title using natural patterns:
        if (lower.includes(' called ')) {
          taskTitle = promptText.substring(promptText.toLowerCase().indexOf(' called ') + 8).trim();
        } else if (lower.includes(' named ')) {
          taskTitle = promptText.substring(promptText.toLowerCase().indexOf(' named ') + 7).trim();
        } else if (lower.includes(' titled ')) {
          taskTitle = promptText.substring(promptText.toLowerCase().indexOf(' titled ') + 8).trim();
        } else {
          taskTitle = promptText.replace(/^(hello|hi|please|hey|can you|could you|i want to|i'd like to|i need to)?\s*(please)?\s*(add|create|make|remind me to|remind me|schedule)?\s*(a|an|this|the|new)?\s*(task|todo|item)?\s*(called|named|titled|to|for|as)?\s*/i, '').trim();
        }

        // Clean conversational and priority suffix fillers
        taskTitle = taskTitle.replace(/\s+(make|set|change)?\s*(the)?\s*priority\s*(as|to|is)?\s*(high|medium|low).*$/i, '').trim();
        taskTitle = taskTitle.replace(/\s+(so please|please|in my|to my|app|application|to do app|in to do|for me|right now|now).*$/i, '').trim();
        taskTitle = taskTitle.replace(/^a\s+/i, '').trim();
        taskTitle = taskTitle.replace(/^["'\u201c\u201d\u2018\u2019]+|["'\u201c\u201d\u2018\u2019]+$/g, '');

        if (!taskTitle || taskTitle.length < 2) {
          taskTitle = 'New Task';
        } else {
          taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
        }

        // Auto-detect category
        let category = 'Work';
        const titleLower = taskTitle.toLowerCase();
        if (titleLower.includes('study') || titleLower.includes('assignment') || titleLower.includes('homework') || titleLower.includes('exam') || titleLower.includes('essay') || titleLower.includes('write') || titleLower.includes('reading') || titleLower.includes('class') || titleLower.includes('lecture')) {
          category = 'Study';
        } else if (titleLower.includes('buy') || titleLower.includes('shop') || titleLower.includes('groceries') || titleLower.includes('store') || titleLower.includes('market') || titleLower.includes('order')) {
          category = 'Shopping';
        } else if (titleLower.includes('gym') || titleLower.includes('workout') || titleLower.includes('clean') || titleLower.includes('doctor') || titleLower.includes('call') || titleLower.includes('mom') || titleLower.includes('dad') || titleLower.includes('laundry') || titleLower.includes('cook')) {
          category = 'Personal';
        }

        // Auto-detect priority
        let priority = 'medium';
        if (lower.includes('high') || lower.includes('urgent') || lower.includes('important') || lower.includes('critical')) {
          priority = 'high';
        } else if (lower.includes('low') || lower.includes('whenever') || lower.includes('no rush')) {
          priority = 'low';
        }

        const newTask = {
          id: generateId(),
          title: taskTitle,
          description: 'Added via TaskFlow AI Copilot',
          category: category,
          priority: priority,
          dueDate: getTodayStr(),
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
        showToast(`Created task: "${taskTitle}"`, 'success');

        return `\u2705 <strong>Task Created Successfully!</strong><br>\u2022 Title: <strong>"${escapeHtml(taskTitle)}"</strong><br>\u2022 Category: <strong>${category}</strong><br>\u2022 Priority: <strong>${priority.charAt(0).toUpperCase() + priority.slice(1)}</strong><br>\u2022 Due Date: <strong>Today</strong><br><br>\ud83c\udf89 <em>Added to your active task dashboard!</em>`;
      }

      // --- INTENT 5: DELETE / REMOVE TASK (before complete to avoid conflicts) ---
      const isDeleteIntent = /\b(delete|remove|erase|trash|get rid of|eliminate|drop)\b/.test(lower)
        && !lower.includes('completed')
        && (lower.includes('task') || tasks.some(t => lower.includes(t.title.toLowerCase())));

      if (isDeleteIntent) {
        const taskName = extractTaskName(promptText);
        let targetTask = findTaskByName(taskName, tasks);

        if (targetTask) {
          tasks = tasks.filter(t => t.id !== targetTask.id);
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          showToast(`Deleted task: "${targetTask.title}"`, 'danger');
          return `\ud83d\uddd1\ufe0f <strong>Task Deleted!</strong><br>Removed <strong>"${escapeHtml(targetTask.title)}"</strong> from your task list.`;
        } else {
          // No matching task found - list available tasks
          if (tasks.length === 0) {
            return `\u2139\ufe0f You don't have any tasks to delete. Your task list is empty.`;
          }
          const taskListHtml = tasks.slice(0, 5).map(t => `\u2022 "${escapeHtml(t.title)}" ${t.completed ? '\u2705' : '\ud83d\udccb'}`).join('<br>');
          return `\u26a0\ufe0f <strong>Task not found.</strong> I couldn't find a task matching "<em>${escapeHtml(taskName)}</em>".<br><br>\ud83d\udccb <strong>Your current tasks:</strong><br>${taskListHtml}<br><br><em>Try saying "remove [exact task name]"</em>`;
        }
      }

      // --- INTENT 2: COMPLETE / FINISH / MARK DONE TASK ---
      const isCompleteIntent = /\b(complete|finish|done|mark as done|mark done|mark as completed|mark completed|check off|tick off)\b/.test(lower)
        && !lower.includes('clear completed');

      if (isCompleteIntent) {
        const activeTasks = tasks.filter(t => !t.completed);
        if (activeTasks.length === 0) {
          return `\u2139\ufe0f All tasks are already completed! Nothing left to mark as done.`;
        }

        const taskName = extractTaskName(promptText);
        let targetTask = findTaskByName(taskName, activeTasks);

        if (!targetTask) {
          // Try to find any task title mentioned in the input
          for (const t of activeTasks) {
            if (lower.includes(t.title.toLowerCase())) {
              targetTask = t;
              break;
            }
          }
        }

        if (targetTask) {
          targetTask.completed = true;
          saveTasks();
          renderTodayCards();
          renderTasks();
          updateStats();
          updateWeeklyChart();
          showToast(`Marked completed: "${targetTask.title}"`, 'success');
          return `\ud83c\udf89 <strong>Task Completed!</strong><br>Marked <strong>"${escapeHtml(targetTask.title)}"</strong> as done. Great job!`;
        } else {
          const taskListHtml = activeTasks.slice(0, 5).map(t => `\u2022 "${escapeHtml(t.title)}" (${t.priority})`).join('<br>');
          return `\u26a0\ufe0f <strong>Which task?</strong> I couldn't identify which task to complete from "<em>${escapeHtml(taskName)}</em>".<br><br>\ud83d\udccb <strong>Active tasks:</strong><br>${taskListHtml}<br><br><em>Try saying "complete [exact task name]"</em>`;
        }
      }

      // --- INTENT 3: TOGGLE THEME (DARK / LIGHT MODE) ---
      if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('toggle theme') || lower.includes('change theme') || lower.includes('dark theme') || lower.includes('light theme') || lower.includes('switch theme') || lower.includes('night mode')) {
        let newTheme = 'dark';
        if (lower.includes('light')) newTheme = 'light';
        else if (theme === 'dark' && !lower.includes('dark')) newTheme = 'light';

        theme = newTheme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('taskflow-theme', theme);
        if (themeToggle) themeToggle.checked = (theme === 'dark');

        showToast(`Switched to ${theme} theme`, 'info');
        return theme === 'dark' ? `\ud83c\udf19 <strong>Dark Mode Activated!</strong>` : `\u2600\ufe0f <strong>Light Mode Activated!</strong>`;
      }

      // --- INTENT 4: CLEAR COMPLETED TASKS ---
      if (lower.includes('clear completed') || lower.includes('delete completed') || lower.includes('remove completed') || lower.includes('clean up') || lower.includes('clear all completed') || lower.includes('remove all done') || lower.includes('delete all done')) {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
          return `\u2139\ufe0f You have no completed tasks to clear.`;
        }
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTodayCards();
        renderTasks();
        updateStats();
        updateWeeklyChart();
        showToast(`Cleared ${completedCount} completed tasks`, 'success');
        return `\ud83e\uddf9 <strong>Cleared ${completedCount} completed tasks!</strong>`;
      }

      // --- INTENT 6: LIST / SHOW ALL TASKS ---
      if (/\b(show|list|display|what are|tell me|view)\b/.test(lower) && /\b(tasks?|to ?do|list|items?)\b/.test(lower)) {
        const activeTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        if (tasks.length === 0) {
          return `\ud83d\udccb <strong>No tasks yet!</strong><br>Your task list is empty. Say <em>"add task Buy groceries"</em> to get started!`;
        }

        let response = `\ud83d\udccb <strong>Your Tasks (${tasks.length} total):</strong><br><br>`;

        if (activeTasks.length > 0) {
          response += `<strong>\ud83d\udd35 Active (${activeTasks.length}):</strong><br>`;
          response += activeTasks.slice(0, 8).map(t => `\u2022 ${escapeHtml(t.title)} <span style="opacity:0.7">[${t.category}, ${t.priority}]</span>`).join('<br>');
          if (activeTasks.length > 8) response += `<br><em>...and ${activeTasks.length - 8} more</em>`;
        }

        if (completedTasks.length > 0) {
          response += `<br><br><strong>\u2705 Completed (${completedTasks.length}):</strong><br>`;
          response += completedTasks.slice(0, 3).map(t => `\u2022 <s>${escapeHtml(t.title)}</s>`).join('<br>');
          if (completedTasks.length > 3) response += `<br><em>...and ${completedTasks.length - 3} more</em>`;
        }

        return response;
      }

      // --- INTENT 7: HOW MANY / COUNT TASKS ---
      if (/\b(how many|count|number of|total)\b/.test(lower) && /\b(tasks?|to ?do|items?)\b/.test(lower)) {
        const activeTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);
        return `\ud83d\udcca <strong>Task Count:</strong><br>\u2022 Total: <strong>${tasks.length}</strong><br>\u2022 Active: <strong>${activeTasks.length}</strong><br>\u2022 Completed: <strong>${completedTasks.length}</strong>`;
      }

      // --- INTENT 8: EDIT TASK (RENAME / PRIORITY) ---
      if (/\b(rename|change name|edit|update title|change title|change priority|update priority|set priority)\b/.test(lower)) {
        return `\u270f\ufe0f <strong>To edit a task:</strong><br>Click on the task in your dashboard to edit its title, priority, or category directly. <em>Inline editing is coming soon to the copilot!</em>`;
      }

      return null;
    }

    function generateFallbackNlpResponse(promptText) {
      const text = promptText.toLowerCase().trim();
      const activeTasks = tasks.filter(t => !t.completed);
      const completedTasks = tasks.filter(t => t.completed);
      const highPriority = activeTasks.filter(t => t.priority === 'high');
      const today = getTodayStr();
      const dueToday = activeTasks.filter(t => t.dueDate === today);

      // --- Greetings ---
      if (/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening|howdy|hola|namaste)\b/i.test(text) && text.split(/\s+/).length <= 4) {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';

        if (activeTasks.length === 0) {
          return `${greeting}! \ud83d\udc4b You're all caught up \u2014 no pending tasks! Say <em>"add task..."</em> to create one.`;
        }
        return `${greeting}! \ud83d\udc4b You have <strong>${activeTasks.length} active task${activeTasks.length > 1 ? 's' : ''}</strong>. ${highPriority.length > 0 ? `<strong>${highPriority.length}</strong> are high priority. ` : ''}How can I help you today?`;
      }

      // --- Thank you ---
      if (/\b(thank|thanks|thx|ty|appreciate)\b/.test(text)) {
        return `You're welcome! \ud83d\ude0a Let me know if you need anything else with your tasks.`;
      }

      // --- Who are you / what can you do ---
      if (/\b(who are you|what can you do|what are you|your name|capabilities|features)\b/.test(text)) {
        return `\ud83e\udd16 I'm <strong>TaskFlow AI Copilot</strong>! Here's what I can do:<br><br>
\u2022 <strong>Add tasks:</strong> <em>"Add task Buy groceries"</em><br>
\u2022 <strong>Delete tasks:</strong> <em>"Remove the task called Meeting prep"</em><br>
\u2022 <strong>Complete tasks:</strong> <em>"Mark Project review as done"</em><br>
\u2022 <strong>List tasks:</strong> <em>"Show me all my tasks"</em><br>
\u2022 <strong>Switch theme:</strong> <em>"Turn on dark mode"</em><br>
\u2022 <strong>Get tips:</strong> <em>"Give me productivity advice"</em><br>
\u2022 <strong>Voice input:</strong> Click \ud83c\udfa4 to speak commands!`;
      }

      // --- Priority / Important ---
      if (text.includes('priority') || text.includes('important') || text.includes('urgent')) {
        if (highPriority.length === 0) {
          return `\ud83c\udf1f <strong>Great job!</strong> You have no high-priority tasks pending right now. Total active: <strong>${activeTasks.length}</strong>.`;
        }
        const listHtml = highPriority.slice(0, 5).map(t => `\u2022 <strong>${escapeHtml(t.title)}</strong> (${t.category})`).join('<br>');
        return `\ud83c\udfaf <strong>High-Priority Tasks (${highPriority.length}):</strong><br>${listHtml}<br><br><em>Focus on these first!</em>`;
      }

      // --- Schedule / Today / Plan ---
      if (text.includes('schedule') || text.includes('today') || text.includes('plan') || text.includes('for today') || text.includes('my day')) {
        if (activeTasks.length === 0) {
          return `\ud83c\udf89 Your schedule is clear! All tasks are completed. Say <em>"add task..."</em> to create a new one.`;
        }
        const todayList = dueToday.length > 0 ? dueToday : activeTasks.slice(0, 5);
        const scheduleHtml = todayList.map((t, idx) => `<strong>${9 + idx * 2}:00 AM</strong> \u2014 ${escapeHtml(t.title)} <span style="opacity:0.8">(${t.priority.toUpperCase()})</span>`).join('<br>');
        return `\ud83d\udcc5 <strong>Suggested Daily Schedule:</strong><br>${scheduleHtml}<br><br>\ud83d\udca1 <em>Take breaks between deep work sessions!</em>`;
      }

      // --- Tips / Help / Advice ---
      if (text.includes('tip') || text.includes('help') || text.includes('advice') || text.includes('suggest') || text.includes('recommend')) {
        return `\ud83d\udca1 <strong>Productivity Tips:</strong><br>
\u2022 <strong>2-Minute Rule:</strong> If it takes under 2 mins, do it now.<br>
\u2022 <strong>Category Focus:</strong> Group your <strong>${activeTasks.length} active tasks</strong> by category.<br>
\u2022 <strong>Voice Commands:</strong> Click \ud83c\udfa4 and say commands!<br>
\u2022 <strong>Quick Actions:</strong> <em>"Add task..."</em>, <em>"Remove the task..."</em>, <em>"Complete..."</em>`;
      }

      // --- Status / Progress / How am I doing ---
      if (/\b(status|progress|how am i|doing|stats|statistics|overview|summary)\b/.test(text)) {
        const rate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
        let emoji = '\ud83d\udcca';
        let encouragement = '';
        if (rate >= 80) { emoji = '\ud83c\udfc6'; encouragement = 'Outstanding progress!'; }
        else if (rate >= 50) { emoji = '\ud83d\udcaa'; encouragement = 'Good momentum, keep going!'; }
        else if (rate > 0) { emoji = '\ud83d\ude80'; encouragement = "You're making progress!"; }
        else { emoji = '\ud83c\udf31'; encouragement = 'Time to get started!'; }

        return `${emoji} <strong>Your Progress:</strong><br>
\u2022 Active Tasks: <strong>${activeTasks.length}</strong><br>
\u2022 Completed: <strong>${completedTasks.length}</strong><br>
\u2022 Completion Rate: <strong>${rate}%</strong><br>
\u2022 High Priority Pending: <strong>${highPriority.length}</strong><br><br>
<em>${encouragement}</em>`;
      }

      // --- Category search ---
      const categoryMatch = text.match(/\b(work|study|personal|shopping|health|fitness)\b/);
      if (categoryMatch && (text.includes('task') || text.includes('show') || text.includes('list') || text.includes('what'))) {
        const cat = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1);
        const catTasks = activeTasks.filter(t => t.category.toLowerCase() === categoryMatch[1]);
        if (catTasks.length === 0) {
          return `\ud83d\udcc2 No active <strong>${cat}</strong> tasks found.`;
        }
        const listHtml = catTasks.slice(0, 5).map(t => `\u2022 ${escapeHtml(t.title)} (${t.priority})`).join('<br>');
        return `\ud83d\udcc2 <strong>${cat} Tasks (${catTasks.length}):</strong><br>${listHtml}`;
      }

      // --- Catch-all: Try to find if user mentioned a specific task name ---
      for (const t of tasks) {
        if (text.includes(t.title.toLowerCase()) && t.title.length > 3) {
          const statusText = t.completed ? '\u2705 Completed' : `\ud83d\udccb Active (${t.priority} priority)`;
          return `\ud83d\udccc <strong>Task Found: "${escapeHtml(t.title)}"</strong><br>
\u2022 Status: ${statusText}<br>
\u2022 Category: ${t.category}<br>
\u2022 Due: ${t.dueDate || 'No due date'}<br><br>
<em>Say "complete ${escapeHtml(t.title)}" or "remove ${escapeHtml(t.title)}" to take action.</em>`;
        }
      }

      // --- Final fallback: Contextual response with examples ---
      const activeCount = activeTasks.length;
      const doneCount = completedTasks.length;
      const rate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

      let contextResponse = `\ud83e\udd16 I understand you said: <em>"${escapeHtml(promptText)}"</em><br><br>`;
      contextResponse += `Here's what I can help you with:<br>`;
      contextResponse += `\u2022 <strong>"Add task [name]"</strong> \u2014 Create a new task<br>`;
      contextResponse += `\u2022 <strong>"Remove the task [name]"</strong> \u2014 Delete a task<br>`;
      contextResponse += `\u2022 <strong>"Complete [task name]"</strong> \u2014 Mark as done<br>`;
      contextResponse += `\u2022 <strong>"Show my tasks"</strong> \u2014 List all tasks<br>`;
      contextResponse += `\u2022 <strong>"Dark mode"</strong> / <strong>"Light mode"</strong> \u2014 Switch theme<br><br>`;
      contextResponse += `\ud83d\udcca Currently: <strong>${activeCount} active</strong>, <strong>${doneCount} done</strong> (${rate}% complete)`;

      return contextResponse;
    }

    function formatAiResponseMarkdown(rawText) {
      if (!rawText) return '';
      let formatted = rawText
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return formatted;
    }
  }
});

