export const manifestContent = `{
  "manifest_version": 3,
  "name": "Polished AI",
  "version": "1.0",
  "description": "Make your emails and texts sound better with AI.",
  "permissions": [
    "contextMenus", 
    "activeTab", 
    "scripting"
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
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}`;

export const backgroundContent = `// background.js
// This runs in the background of your Chrome browser.

// TODO: Paste your Gemini API Key here.
// Get one for free at: https://aistudio.google.com/app/apikey
const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "polishText") {
    
    if (API_KEY.includes("PASTE_YOUR")) {
      sendResponse({ success: false, error: "Missing API Key in background.js" });
      return;
    }

    polishTextWithGemini(request.text, request.tone)
      .then(improvedText => sendResponse({ success: true, data: improvedText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep the message channel open for async response
  }
});

async function polishTextWithGemini(text, tone) {
  const systemInstruction = \`
    You are an AI writing assistant. 
    Goal: Fix grammar, add punctuation, and improve flow.
    Tone: \${tone}
    Input: "\${text}"
    Return ONLY the improved text. No quotes.
  \`;

  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${API_KEY}\`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        config: {
            systemInstruction: { parts: [{ text: systemInstruction }] }
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "API Error");
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch (e) {
    throw new Error("Failed to connect to Gemini. Check your internet.");
  }
}`;

export const contentScriptContent = `// content.js
// This script runs on the web pages you visit (Gmail, Outlook, etc.)

let overlay = null;
let activeSelectionRange = null;

// 1. Listen for text selection
document.addEventListener('mouseup', (e) => {
  // Wait a tick to ensure selection is complete
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    // If we have text and aren't clicking inside our own overlay
    if (text.length > 0 && !e.target.closest('#polished-overlay') && !e.target.closest('#polished-trigger-btn')) {
      activeSelectionRange = selection.getRangeAt(0);
      showButton(activeSelectionRange);
    } else if (text.length === 0) {
      removeButton();
    }
  }, 10);
});

// 2. Show the "Polish" Button near selection
function showButton(range) {
  removeButton();

  const rect = range.getBoundingClientRect();
  const btn = document.createElement('button');
  btn.id = "polished-trigger-btn";
  btn.innerHTML = "✨";
  btn.title = "Polish with AI";
  
  // Calculate position (above the selection)
  const top = window.scrollY + rect.top - 40;
  const left = window.scrollX + rect.left;
  
  btn.style.top = \`\${top}px\`;
  btn.style.left = \`\${left}px\`;
  
  btn.onmousedown = (e) => {
    e.preventDefault(); // Prevent losing selection
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

// 3. Show the UI Overlay
function showOverlay(originalText) {
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = "polished-overlay";
  
  overlay.innerHTML = \`
    <div class="polished-header">
      <span>Polished AI</span>
      <button id="polished-close">✕</button>
    </div>
    <div class="polished-body">
      <div class="polished-preview">\${originalText}</div>
      <div class="polished-controls">
        <select id="polished-tone">
          <option value="Professional">Professional</option>
          <option value="Casual">Casual</option>
          <option value="Concise">Concise</option>
        </select>
        <button id="polished-go">Improve</button>
      </div>
      <div id="polished-result" class="polished-result"></div>
      <button id="polished-replace" disabled>Replace Selection</button>
    </div>
  \`;

  document.body.appendChild(overlay);

  // Close Handler
  document.getElementById('polished-close').onclick = () => overlay.remove();
  
  // Improve Handler
  document.getElementById('polished-go').onclick = () => {
    const tone = document.getElementById('polished-tone').value;
    const resultDiv = document.getElementById('polished-result');
    const replaceBtn = document.getElementById('polished-replace');
    
    resultDiv.innerText = "Thinking...";
    resultDiv.classList.add('loading');
    resultDiv.classList.remove('error');

    // Send message to background.js
    chrome.runtime.sendMessage(
      { action: "polishText", text: originalText, tone: tone },
      (response) => {
        resultDiv.classList.remove('loading');
        
        if (chrome.runtime.lastError) {
          resultDiv.innerText = "Error: " + chrome.runtime.lastError.message;
          resultDiv.classList.add('error');
          return;
        }

        if (response && response.success) {
          resultDiv.innerText = response.data;
          replaceBtn.disabled = false;
          replaceBtn.onclick = () => replaceText(response.data);
        } else {
          resultDiv.innerText = response?.error || "Unknown error";
          resultDiv.classList.add('error');
        }
      }
    );
  };
}

// 4. Replace text in the document
function replaceText(newText) {
  if (activeSelectionRange) {
    try {
        activeSelectionRange.deleteContents();
        activeSelectionRange.insertNode(document.createTextNode(newText));
        overlay.remove();
        window.getSelection().removeAllRanges();
    } catch (e) {
        alert("Could not replace text automatically. Please copy/paste.");
    }
  }
}`;

export const stylesContent = `/* styles.css */

#polished-trigger-btn {
  position: absolute;
  z-index: 2147483647; /* Max Z-Index */
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: 2px solid white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: transform 0.1s;
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

#polished-trigger-btn:hover {
  transform: scale(1.1);
}

#polished-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: #0f172a;
  color: #f8fafc;
  z-index: 2147483647;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #334155;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.polished-header {
  background: linear-gradient(to right, #059669, #047857);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #065f46;
}

#polished-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
  padding: 4px;
}
#polished-close:hover { opacity: 1; background: rgba(255,255,255,0.1); border-radius: 4px; }

.polished-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.polished-preview {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  max-height: 60px;
  overflow-y: auto;
  border-left: 3px solid #334155;
  padding-left: 10px;
  background: #1e293b;
  padding: 8px;
  border-radius: 0 4px 4px 0;
}

.polished-controls {
  display: flex;
  gap: 8px;
}

#polished-tone {
  flex: 1;
  background: #1e293b;
  border: 1px solid #334155;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}
#polished-tone:focus { border-color: #10b981; }

#polished-go {
  background: #334155;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: background 0.2s;
}
#polished-go:hover { background: #475569; }

.polished-result {
  background: #1e293b;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  border: 1px solid #334155;
  line-height: 1.5;
}

.polished-result.loading { color: #64748b; font-style: italic; }
.polished-result.error { color: #f87171; border-color: #7f1d1d; background: #450a0a; }

#polished-replace {
  width: 100%;
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}
#polished-replace:disabled {
  background: #334155;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}
#polished-replace:not(:disabled):hover { background: #059669; }

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes slideIn {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
`;