const express = require('express');
const path = require('path');
require('dotenv').config();

let GoogleGenAI;
try {
  const genaiPkg = require('@google/genai');
  GoogleGenAI = genaiPkg.GoogleGenAI;
} catch (e) {
  console.log('Using standard REST API fetch fallback for Gemini');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static(path.join(__dirname)));

/**
 * POST /api/chat - Server-side Gemini API Proxy Route
 * Stored securely in GEMINI_API_KEY environment variable.
 * Never exposes API key to client-side JavaScript.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, tasks = [] } = req.body;
    console.log(`[API /api/chat] Received prompt: "${prompt}" with ${tasks.length} tasks`);

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.log('[API /api/chat] Missing or default GEMINI_API_KEY');
      return res.json({
        success: false,
        error: 'NO_SERVER_API_KEY',
        message: 'GEMINI_API_KEY environment variable is not configured on the server. Falling back to built-in NLP engine.'
      });
    }

    const activeTasksStr = tasks.length > 0
      ? tasks.slice(0, 10).map(t => `- "${t.title}" (${t.category}, Priority: ${t.priority}, Due: ${t.dueDate || 'None'}, Status: ${t.completed ? 'Completed' : 'Active'})`).join('\n')
      : 'No tasks currently available.';

    const systemPrompt = `You are TaskFlow AI, an intelligent productivity companion deeply integrated into a modern web application.
Your goal is to assist users in organizing their work, managing tasks, offering smart recommendations, and providing concise responses.

CURRENT USER TASKS:
${activeTasksStr}

USER REQUEST:
"${prompt}"

Please respond naturally, concisely, and helpfully. Keep responses under 150 words. Format with clean markdown.`;

    let replyText = '';

    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

    // Primary: Use official @google/genai SDK if available
    if (GoogleGenAI) {
      const ai = new GoogleGenAI({ apiKey });
      for (const modelName of candidateModels) {
        try {
          console.log(`[API /api/chat] Trying SDK model: ${modelName}...`);
          const result = await ai.models.generateContent({
            model: modelName,
            contents: systemPrompt
          });
          if (result && result.text) {
            replyText = result.text;
            console.log(`[API /api/chat] Success with SDK model ${modelName}`);
            break;
          }
        } catch (sdkError) {
          console.error(`[API /api/chat] SDK error with ${modelName}:`, sdkError.message);
        }
      }
    }

    // Fallback: Direct REST API fetch to candidate models
    if (!replyText) {
      for (const modelName of candidateModels) {
        try {
          console.log(`[API /api/chat] Trying REST fallback model: ${modelName}...`);
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
              console.log(`[API /api/chat] Success with REST model ${modelName}`);
              break;
            }
          }
        } catch (fetchErr) {
          console.error(`[API /api/chat] REST error with ${modelName}:`, fetchErr.message);
        }
      }
    }

    if (!replyText) {
      console.log('[API /api/chat] Could not generate response from any model candidate');
      return res.status(502).json({
        success: false,
        error: 'API_ERROR',
        message: 'Could not generate response from Gemini API.'
      });
    }

    return res.json({
      success: true,
      text: replyText
    });
  } catch (error) {
    console.error('Server Route Error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error occurred while processing request.'
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 TaskFlow AI Server running at: http://localhost:${PORT}`);
  console.log(`🔒 Gemini API Route: POST http://localhost:${PORT}/api/chat`);
  console.log(`🔑 GEMINI_API_KEY Status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED ✅ (Key stored securely in .env)' : 'NOT CONFIGURED ⚠️'}`);
  console.log(`📦 @google/genai SDK: ${GoogleGenAI ? 'ACTIVE ✅' : 'INACTIVE ⚠️'}`);
  console.log(`===================================================`);
});
