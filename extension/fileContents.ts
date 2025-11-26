export const manifestContent = `{
  "manifest_version": 3,
  "name": "Polished AI",
  "version": "1.0",
  "description": "The Pro version of Polished AI.",
  "permissions": [
    "contextMenus",
    "activeTab",
    "scripting",
    "storage" 
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "action": {
    "default_title": "Polished AI"
  }
}`;

export const backgroundContent = `// background.js - Client Side (The Extension)
// In the SaaS version, this file DOES NOT contain the API Key.
// It sends the text to YOUR backend server.

const BACKEND_URL = "https://api.your-saas-domain.com/v1/polish";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "polishText") {
    
    // Get the user's auth token (saved during login)
    chrome.storage.local.get(['authToken'], (result) => {
      const token = result.authToken;
      
      if (!token) {
        sendResponse({ success: false, error: "Please log in to Polished AI." });
        // Optional: Open login page
        // chrome.tabs.create({ url: "https://polished.app/login" });
        return;
      }

      polishWithServer(request.text, request.tone, token)
        .then(data => sendResponse({ success: true, data: data }))
        .catch(err => sendResponse({ success: false, error: err.message }));
    });
    
    return true; // Keep channel open for async response
  }
});

async function polishWithServer(text, tone, token) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${token}\`
      },
      body: JSON.stringify({ text, tone })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Server Error");
    
    return data.improvedText;
  } catch (error) {
    throw new Error("Could not connect to server. Check internet.");
  }
}`;

export const serverContent = `// server.js - Your Backend (Node.js + Express)
// Run this on a server (e.g., Vercel, Heroku, AWS)

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Securely access API Key from environment variables on the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware to check if user is a paying subscriber (Mock)
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;
  // TODO: Validate token with your database (Supabase, Firebase, Auth0)
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  next();
};

app.post('/v1/polish', checkAuth, async (req, res) => {
  try {
    const { text, tone } = req.body;
    
    const systemInstruction = \`
      Fix punctuation, grammar, and improve flow.
      Tone: \${tone}. Input: "\${text}". Return ONLY the text.
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: { systemInstruction: { parts: [{ text: systemInstruction }] } }
    });

    // TODO: Deduct credits from user's account in database

    res.json({ improvedText: response.text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Processing Failed" });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
`;

export const contentScriptContent = `// content.js - Same as before
// This handles the UI injection on the user's page.

let overlay = null;
let activeSelectionRange = null;

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  if (text.length > 0) {
    activeSelectionRange = selection.getRangeAt(0);
    showButton(activeSelectionRange);
  } else {
    removeButton();
  }
});

function showButton(range) {
  removeButton();
  const rect = range.getBoundingClientRect();
  const btn = document.createElement('button');
  btn.id = "polished-trigger-btn";
  btn.innerHTML = "✨";
  
  btn.style.top = \`\${window.scrollY + rect.top - 40}px\`;
  btn.style.left = \`\${window.scrollX + rect.left}px\`;
  
  btn.onclick = (e) => {
    e.stopPropagation();
    const text = window.getSelection().toString();
    showOverlay(text);
    removeButton();
  };

  document.body.appendChild(btn);
}

function removeButton() {
  const btn = document.getElementById("polished-trigger-btn");
  if (btn) btn.remove();
}

function showOverlay(originalText) {
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = "polished-overlay";
  
  overlay.innerHTML = \`
    <div class="polished-header">
      <span>Polished AI Pro</span>
      <button id="polished-close">✕</button>
    </div>
    <div class="polished-body">
      <div class="polished-preview">\${originalText}</div>
      <div class="polished-controls">
        <select id="polished-tone">
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
        </select>
        <button id="polished-go">Improve</button>
      </div>
      <div id="polished-result" class="polished-result"></div>
      <button id="polished-replace" disabled>Replace</button>
    </div>
  \`;

  document.body.appendChild(overlay);

  document.getElementById('polished-close').onclick = () => overlay.remove();
  
  document.getElementById('polished-go').onclick = () => {
    const tone = document.getElementById('polished-tone').value;
    const resultDiv = document.getElementById('polished-result');
    const replaceBtn = document.getElementById('polished-replace');
    
    resultDiv.innerText = "Processing...";
    resultDiv.classList.add('loading');

    chrome.runtime.sendMessage(
      { action: "polishText", text: originalText, tone: tone },
      (response) => {
        resultDiv.classList.remove('loading');
        if (response.success) {
          resultDiv.innerText = response.data;
          replaceBtn.disabled = false;
          replaceBtn.onclick = () => replaceText(response.data);
        } else {
          resultDiv.innerText = response.error;
          if(response.error.includes("log in")) {
             // Create a login link
             resultDiv.innerHTML = \`\${response.error} <a href="#" style="color:#10b981">Login here</a>\`;
          }
        }
      }
    );
  };
}

function replaceText(newText) {
  if (activeSelectionRange) {
    activeSelectionRange.deleteContents();
    activeSelectionRange.insertNode(document.createTextNode(newText));
    overlay.remove();
    window.getSelection().removeAllRanges();
  }
}`;

export const stylesContent = `/* styles.css */
#polished-trigger-btn {
  position: absolute;
  z-index: 99999;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  animation: fadeIn 0.2s ease-out;
}
#polished-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: #0f172a;
  color: white;
  z-index: 100000;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  font-family: sans-serif;
  border: 1px solid #334155;
}
.polished-header {
  background: #059669;
  padding: 10px 16px;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
#polished-close { background: none; border: none; color: white; cursor: pointer; }
.polished-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.polished-preview { font-size: 12px; color: #94a3b8; font-style: italic; max-height: 50px; overflow: hidden; }
.polished-controls { display: flex; gap: 8px; }
#polished-tone { flex: 1; background: #1e293b; border: 1px solid #334155; color: white; padding: 6px; border-radius: 4px; }
#polished-go { background: #334155; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.polished-result { background: #1e293b; padding: 10px; border-radius: 6px; font-size: 13px; min-height: 60px; }
#polished-replace { width: 100%; padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
#polished-replace:disabled { background: #334155; color: #64748b; }
`;