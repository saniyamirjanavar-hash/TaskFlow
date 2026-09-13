# TaskFlow AI — Intelligent Productivity & Task Management SPA

> A modern, responsive Single Page Application (SPA) for task management featuring server-side Gemini AI integration, Google Calendar synchronization, real-time analytics, and persistent local storage.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini%20AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

---

## 📌 Project Overview

**TaskFlow AI** is a feature-rich productivity dashboard that enables users to create, organize, filter, complete, and track daily tasks effortlessly. It includes a built-in AI assistant powered by Google Gemini, audio chimes, progress statistics, and optional Google Calendar event synchronization.

### 🌟 Key Highlights
- 🤖 **Gemini AI Companion** — Server-side secure API proxy with automatic fallback to built-in client NLP.
- 🎨 **Glassmorphism UI** — Modern design system with dark/light mode and smooth micro-animations.
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop viewports.
- 💾 **Data Persistence** — Tasks and preferences saved automatically via Browser Local Storage.
- 📊 **Live Analytics** — Real-time completion progress tracking, task counters, and weekly charts.
- 🔊 **Audio Synthesis** — Web Audio API synthesized completion chime.
- 📅 **Google Calendar Sync** — Integrated timeline and event creation capabilities.

---

## 🚀 Live Demo & Repository

- 🔗 **Live Website (GitHub Pages)**: [https://saniyamirjanavar-hash.github.io/TaskFlow/](https://saniyamirjanavar-hash.github.io/TaskFlow/)
- 📦 **GitHub Repository**: [https://github.com/saniyamirjanavar-hash/TaskFlow](https://github.com/saniyamirjanavar-hash/TaskFlow)

---

## ✨ Feature Breakdown

### 🎯 Core Task Management

| Feature | Description | Status |
|---------|-------------|--------|
| **Add Tasks** | Prevent empty entries, add titles, categories, priorities, due dates, & descriptions. | ✅ Complete |
| **View Tasks** | Card-based grid layout with interactive status badges and subtask progress. | ✅ Complete |
| **Mark Complete** | Toggle completion with strikethrough effect and synthesized sound feedback. | ✅ Complete |
| **Edit Tasks** | Pre-filled modal to modify all task attributes and subtasks. | ✅ Complete |
| **Delete Tasks** | Deletion confirmation modal to prevent accidental removals. | ✅ Complete |
| **Subtasks / Checklist** | Nested checklist with progress indicators and auto-complete parent logic. | ✅ Complete |

### 🔍 Search, Filter & Analytics

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-Time Search** | Dynamic title matching with clear search button. | ✅ Complete |
| **Status Filters** | Filter by All, Active, Completed, or Priority (High/Medium/Low). | ✅ Complete |
| **Category Filters** | Work, Personal, Study, Shopping, Other color-coded tags. | ✅ Complete |
| **Sorting** | Sort by Newest, Oldest, Priority (High→Low), Due Date, or Title. | ✅ Complete |
| **Statistics Dashboard** | Live task count, completed count, active count, and completion rate %. | ✅ Complete |
| **Weekly Chart** | Bar chart visualizing daily task completions across the week. | ✅ Complete |

### 🤖 Gemini AI Assistant Integration

| Feature | Description | Status |
|---------|-------------|--------|
| **Server-Side API Proxy** | Node/Express backend (`server.js`) secures API keys in environment variables. | ✅ Complete |
| **SDK Integration** | Official `@google/genai` SDK with candidate model fallback (`gemini-3.6-flash`). | ✅ Complete |
| **Built-in Client Fallback** | Runs local NLP task breakdown if backend API is not configured. | ✅ Complete |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3 (Variables, Flexbox/Grid, Animations), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **AI Integration** | `@google/genai` SDK / REST API Fallback |
| **Data Storage** | Browser `localStorage` API |
| **Audio** | Web Audio API |
| **Deployment** | GitHub Pages & Cloud Hosting (Render / Vercel ready) |

---

## 📁 Project Structure

```
TaskFlow/
├── index.html           # Main Single Page Application HTML
├── styles.css           # Glassmorphism design system & responsive CSS
├── app.js               # Application logic, LocalStorage & AI Assistant
├── google-calendar.js   # Google Calendar API integration module
├── server.js            # Express server & Gemini API proxy route
├── package.json         # Node.js dependencies & scripts
├── .env                 # Environment variables configuration (excluded from git)
└── README.md            # Documentation
```

---

## 🔧 How to Run Locally

### Option 1: Static Mode (Client-Only)
Simply open `index.html` directly in your browser, or use VS Code **Live Server**:
1. Open project folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

### Option 2: Full-Stack Mode (Express + Gemini API)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/saniyamirjanavar-hash/TaskFlow.git
   cd TaskFlow
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Start the server**:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000` in your browser.

---

## 💾 Local Storage Schema

```javascript
{
  "id": "task_1726200000_abc123",
  "title": "Finalize project presentation",
  "description": "Review slides and prepare demo script",
  "category": "Work",
  "priority": "High",
  "dueDate": "2026-09-15",
  "completed": false,
  "subtasks": [
    { "id": "sub_1", "title": "Draft slides", "completed": true },
    { "id": "sub_2", "title": "Practice speech", "completed": false }
  ],
  "createdAt": 1726200000000
}
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👩‍💻 Author

**Saniya Mirjanavar**
- GitHub: [@saniyamirjanavar-hash](https://github.com/saniyamirjanavar-hash)
- Repository: [TaskFlow](https://github.com/saniyamirjanavar-hash/TaskFlow)
