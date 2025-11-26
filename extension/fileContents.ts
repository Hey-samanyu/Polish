export const manifestContent = `{
  "manifest_version": 3,
  "name": "Polished AI (SaaS)",
  "version": "1.0",
  "description": "Professional writing assistant powered by Polished AI.",
  "permissions": [
    "contextMenus", 
    "activeTab", 
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
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

// BACKEND_URL_PLACEHOLDER will be replaced by App.tsx logic with the real live URL
export const backgroundContent = `// background.js
// Connected to Polished AI SaaS Backend

const BACKEND_URL = "BACKEND_URL_PLACEHOLDER"; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "polishText") {
    
    // Debugging: Log the URL we are trying to hit
    console.log("Polishing text via:", BACKEND_URL);

    polishTextWithServer(request.text, request.tone)
      .then(improvedText => sendResponse({ success: true, data: improvedText }))
      .catch(error => {
        console.error("Polish Error:", error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep channel open
  }
});

async function polishTextWithServer(text, tone) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tone })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Server Error (" + response.status + ")");
    }
    
    return data.improvedText;
  } catch (e) {
    console.error("Network Error Details:", e);
    throw new Error("Connection Failed. Check console for details.");
  }
}`;

export const contentScriptContent = `// content.js
// Handles UI injection

let overlay = null;
let activeSelectionRange = null;

// Listen for selection
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    // Ignore clicks inside our own UI
    if (e.target.closest('#polished-overlay') || e.target.closest('#polished-trigger-btn')) {
      return;
    }

    if (text.length > 0) {
      activeSelectionRange = selection.getRangeAt(0);
      showButton(activeSelectionRange);
    } else {
      removeButton();
    }
  }, 10);
});

function showButton(range) {
  removeButton();
  const rect = range.getBoundingClientRect();
  const btn = document.createElement('button');
  btn.id = "polished-trigger-btn";
  btn.innerHTML = "✨";
  
  // Calculate absolute position including scroll
  const top = window.scrollY + rect.top - 40;
  const left = window.scrollX + rect.left;
  
  btn.style.top = \`\${top}px\`;
  btn.style.left = \`\${left}px\`;
  
  btn.onmousedown = (e) => {
    e.preventDefault(); 
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
      <span>Polished AI</span>
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
    
    resultDiv.innerText = "Connecting...";
    resultDiv.classList.add('loading');
    resultDiv.classList.remove('error');

    chrome.runtime.sendMessage(
      { action: "polishText", text: originalText, tone: tone },
      (response) => {
        resultDiv.classList.remove('loading');
        
        // Handle runtime errors (like connection issues)
        if (chrome.runtime.lastError) {
             resultDiv.innerText = "Err: " + chrome.runtime.lastError.message;
             resultDiv.classList.add('error');
             return;
        }

        if (response && response.success) {
          resultDiv.innerText = response.data;
          replaceBtn.disabled = false;
          replaceBtn.onclick = () => replaceText(response.data);
        } else {
          resultDiv.innerText = response?.error || "Unknown Error";
          resultDiv.classList.add('error');
        }
      }
    );
  };
}

function replaceText(newText) {
  if (activeSelectionRange) {
    try {
        activeSelectionRange.deleteContents();
        activeSelectionRange.insertNode(document.createTextNode(newText));
        overlay.remove();
        window.getSelection().removeAllRanges();
    } catch(e) { alert("Could not replace text automatically. Please copy/paste."); }
  }
}`;

export const stylesContent = `/* styles.css */
#polished-trigger-btn {
  position: absolute;
  z-index: 2147483647;
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
  animation: popIn 0.2s;
}
#polished-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: #0f172a;
  color: #f8fafc;
  z-index: 2147483647;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  font-family: sans-serif;
  border: 1px solid #334155;
  overflow: hidden;
}
.polished-header {
  background: #059669;
  padding: 12px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}
#polished-close { background: none; border: none; color: white; cursor: pointer; }
.polished-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.polished-preview { font-size: 12px; color: #94a3b8; font-style: italic; max-height: 50px; overflow-y: auto; background: #1e293b; padding: 6px; border-radius: 4px; }
.polished-controls { display: flex; gap: 8px; }
#polished-tone { flex: 1; background: #1e293b; border: 1px solid #334155; color: white; padding: 6px; border-radius: 4px; }
#polished-go { background: #334155; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.polished-result { background: #1e293b; padding: 10px; border-radius: 6px; font-size: 14px; min-height: 60px; }
.polished-result.loading { color: #64748b; font-style: italic; }
.polished-result.error { color: #f87171; }
#polished-replace { width: 100%; padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
#polished-replace:disabled { background: #334155; color: #64748b; }
@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
`;