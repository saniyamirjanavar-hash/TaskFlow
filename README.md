# TaskFlow — Interactive To-Do List Application

> A responsive, interactive Single Page Application (SPA) for managing daily tasks efficiently. Built with pure HTML5, CSS3, and JavaScript (ES6+) with Browser Local Storage for data persistence.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📌 Project Overview

**TaskFlow** is a feature-rich task management dashboard that allows users to create, view, edit, complete, delete, and organize their daily tasks. The application uses **Browser Local Storage** to ensure user data remains available across browser sessions.

### Key Highlights
- 🎨 **Premium UI Design** — Modern glassmorphism, dark/light themes, micro-animations
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile devices
- 💾 **Data Persistence** — Tasks saved via Local Storage (survives refresh/reopen)
- 🔍 **Search & Filter** — Real-time search, status filters, category filters, sorting
- 📊 **Statistics Dashboard** — Live task counts, completion rate, weekly progress chart
- 🔊 **Audio Feedback** — Web Audio API completion chime
- 📅 **Google Calendar Integration** — Optional sync with Google Calendar API (bonus feature)

---

## 🚀 Live Demo

🔗 **[View Live Application](#)** *(Deploy link to be added)*

---

## 📸 Screenshots

### Light Mode
The application features a clean, professional interface with a sidebar for navigation and statistics.

### Dark Mode
Full dark theme support with automatic system preference detection.

---

## ✨ Features

### Phase 1 — Core Task Management

| Feature | Description | Status |
|---------|-------------|--------|
| **Add Tasks** | Enter a task name and add it to the list. Empty tasks are prevented. | ✅ Complete |
| **View Tasks** | All tasks displayed in an organized card-based grid layout. | ✅ Complete |
| **Mark Complete** | Checkbox to toggle completion. Completed tasks show strikethrough styling. | ✅ Complete |
| **Edit Tasks** | Modal dialog to modify task title, category, priority, due date, description, and subtasks. | ✅ Complete |
| **Delete Tasks** | Delete button with confirmation dialog before removal. | ✅ Complete |
| **Responsive Design** | Works on desktop (1200px+), tablet (768px), and mobile (480px). | ✅ Complete |

### Phase 2 — Advanced Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Local Storage** | Tasks auto-saved. Persists on refresh, close, and reopen. | ✅ Complete |
| **Task Categories** | Work, Personal, Study, Shopping, Other — with color-coded badges. | ✅ Complete |
| **Task Priorities** | High (red), Medium (yellow), Low (green) — with visual indicators. | ✅ Complete |
| **Search** | Real-time search by task title with clear button. | ✅ Complete |
| **Filter by Status** | All Tasks, Active, Completed, High/Medium/Low Priority. | ✅ Complete |
| **Filter by Category** | All, Work, Personal, Study, Shopping, Other. | ✅ Complete |
| **Sorting** | Newest, Oldest, Priority (High→Low), Due Date, Alphabetical. | ✅ Complete |
| **Statistics Dashboard** | Total tasks, Active count, Completed count, Completion rate (%). | ✅ Complete |
| **Weekly Progress Chart** | Bar chart showing task completions per day of the week. | ✅ Complete |
| **Input Validation** | Empty task prevention with error tooltip animation. | ✅ Complete |
| **Confirmation Dialogs** | Delete confirmation modal before removing tasks. | ✅ Complete |
| **Empty State Messages** | Informative messages when no tasks exist or no search results found. | ✅ Complete |
| **Smooth Animations** | Slide-in cards, fade transitions, hover effects, toast notifications. | ✅ Complete |
| **Dark/Light Theme** | Toggle switch with system preference auto-detection. | ✅ Complete |
| **Subtasks/Checklist** | Nested subtask creation, completion tracking, progress badges. | ✅ Complete |
| **Due Date Tracking** | Date picker with overdue/due-today visual warnings. | ✅ Complete |
| **Sound Feedback** | Web Audio API synthesized chime on task completion. | ✅ Complete |

### Bonus Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Google Calendar Sync** | Connect to Google Calendar, sync tasks as events. | ✅ Complete |
| **Calendar Timeline** | Vertical timeline with color-coded event cards. | ✅ Complete |
| **Week Day Picker** | Navigate weeks and view events by day. | ✅ Complete |
| **3D Flip Card Widget** | Animated credit card showing completion rate. | ✅ Complete |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Application structure and semantic layout |
| **CSS3** | Styling, responsive design, animations, dark/light themes |
| **JavaScript (ES6+)** | Application logic, DOM manipulation, event handling, CRUD operations |
| **Browser Local Storage** | Persistent task data storage |
| **Web Audio API** | Sound effect synthesis |
| **Google Calendar API** | Optional calendar event synchronization |
| **Google Fonts** | Typography (Outfit, Plus Jakarta Sans) |
| **Git** | Version control |
| **GitHub** | Code repository |
| **GitHub Pages** | Deployment |

---

## 📁 Project Structure

```
ultimez/
├── index.html           # Main application page (SPA)
├── styles.css           # Complete CSS design system with themes
├── app.js               # Core application logic and task management
├── google-calendar.js   # Google Calendar API integration module
└── README.md            # Project documentation
```

---

## 🔧 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ultimez.git
   cd ultimez
   ```

2. **Open in browser**
   - Simply open `index.html` directly in your browser, OR
   - Use VS Code **Live Server** extension for a better development experience:
     - Install the Live Server extension
     - Right-click `index.html` → "Open with Live Server"
     - The app will open at `http://localhost:5500`

3. **Start using TaskFlow!**
   - Add tasks using the input field
   - Organize with categories and priorities
   - Filter, search, and sort your tasks
   - Toggle dark/light theme
   - All data saves automatically to Local Storage

---

## 💾 Local Storage Implementation

The application uses `localStorage` for persistent data storage:

```javascript
// Saving tasks
localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));

// Loading tasks
const tasks = JSON.parse(localStorage.getItem('taskflow-tasks'));

// Theme preference
localStorage.setItem('taskflow-theme', 'dark');

// Sound preference
localStorage.setItem('taskflow-sound', 'true');
```

**Data persists across:**
- ✅ Page refreshes
- ✅ Browser close and reopen
- ✅ Tab switching
- ✅ System restarts

---

## 📊 Task Data Structure

Each task is stored as a JSON object:

```javascript
{
  id: "task_1694300000_abc123",     // Unique identifier
  title: "Complete project report",  // Task name
  description: "Final review notes", // Optional description
  category: "Work",                  // Work | Personal | Study | Shopping | Other
  priority: "High",                  // High | Medium | Low
  dueDate: "2026-09-15",            // YYYY-MM-DD format
  completed: false,                  // Completion status
  subtasks: [                        // Nested checklist items
    { id: "sub_1", title: "Draft outline", completed: true },
    { id: "sub_2", title: "Write introduction", completed: false }
  ],
  createdAt: 1694300000000,          // Timestamp for sorting
  calendarEventId: null              // Google Calendar sync ID
}
```

---

## 🧪 Testing Checklist

| Test Scenario | Result |
|--------------|--------|
| Add a new task | ✅ Task appears in the list |
| Add empty task | ✅ Error tooltip shown, submission blocked |
| Edit a task title | ✅ Task updates immediately |
| Delete a task | ✅ Confirmation dialog shown, task removed |
| Mark task complete | ✅ Strikethrough styling, sound chime |
| Unmark completed task | ✅ Task restored to active state |
| Add subtasks | ✅ Subtasks appear in task card details |
| Toggle subtasks | ✅ Auto-completes parent when all subtasks done |
| Refresh browser | ✅ All tasks persist via Local Storage |
| Close and reopen browser | ✅ Tasks still available |
| Search by title | ✅ Real-time filtering works |
| Filter by status | ✅ Active/Completed/Priority filters work |
| Filter by category | ✅ Category filtering works |
| Sort tasks | ✅ All 5 sort options work correctly |
| Clear completed | ✅ Removes all completed tasks with confirmation |
| Toggle dark theme | ✅ Theme switches, preference saved |
| Desktop view (1200px+) | ✅ Full sidebar + main content layout |
| Tablet view (768px) | ✅ Stacked layout, responsive elements |
| Mobile view (480px) | ✅ Compact layout, touch-friendly |
| Invalid date input | ✅ Minimum date set to today |
| Multiple rapid adds | ✅ All tasks added correctly |

---

## 📅 Google Calendar Setup (Optional Bonus)

To enable Google Calendar sync:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable **Google Calendar API**
3. Create an **OAuth Client ID** (Web application)
4. Create an **API Key**
5. Open `google-calendar.js` and replace:
   ```javascript
   const CLIENT_ID = 'YOUR_CLIENT_ID';
   const API_KEY = 'YOUR_API_KEY';
   ```

> **Note:** The app works fully without Google Calendar. This is a bonus enhancement.

---

## 👨‍💻 Development Details

### CRUD Operations
- **Create**: Add task form with validation → `tasks.push(newTask)` → save to localStorage
- **Read**: Load from localStorage on page load → render task cards dynamically
- **Update**: Edit modal with pre-filled fields → update task object → save & re-render
- **Delete**: Confirmation dialog → `tasks.filter()` → save & re-render

### DOM Manipulation
- Dynamic task card creation using `document.createElement()`
- Event delegation on task list container for performance
- Modal open/close with CSS transitions and backdrop blur

### Event Handling
- Form submission (preventDefault)
- Click delegation for task actions (complete, edit, delete, sync)
- Keyboard support (Enter to add subtask, Escape to close modals)
- Change events for filters and sorting
- Input events for real-time search

---

## 🌐 Deployment

The application is deployed using GitHub Pages:
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Set source to main branch
4. Access via: `https://YOUR-USERNAME.github.io/ultimez/`

---

## 📝 License

This project was developed as an internship project for learning purposes.

---

## 🙏 Acknowledgments

- **Google Fonts** — Outfit & Plus Jakarta Sans typography
- **Uiverse.io** — Animated button and theme switch components
- Modern UI/UX design inspiration from Dribbble and Behance
