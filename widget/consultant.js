// Rexflow Consultant Widget v1.0
// Configuration - replace with real values
const CFG = {
  BOT_TOKEN: 'REPLACE_WITH_BOT_TOKEN',
  ADMIN_CHAT_ID: 'REPLACE_WITH_ADMIN_CHAT_ID',
  POLL_INTERVAL: 3000,
  WIDGET_POSITION: 'bottom-right'
};

// State
let isOpen = false;
let unreadCount = 0;
let lastUpdateId = 0;
let pollTimer = null;
let clientName = 'Аноним';

// Init
function init() {
  injectStyles();
  injectHTML();
  bindEvents();
  startPoll();
  console.log('[Rexflow] Consultant widget loaded');
}

// Inject CSS
function injectStyles() {
  const css = document.createElement('style');
  css.textContent = `
    #rexflow-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    #rexflow-toggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 64px; height: 64px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #0A0A0F; font-size: 28px; cursor: pointer;
      box-shadow: 0 4px 24px rgba(255,215,0,0.4), 0 0 0 4px rgba(255,215,0,0.1);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #rexflow-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 32px rgba(255,215,0,0.6); }
    #rexflow-toggle.active { background: linear-gradient(135deg, #FF3333, #cc2929); box-shadow: 0 4px 24px rgba(255,51,51,0.4); }
    #rexflow-badge {
      position: absolute; top: -4px; right: -4px;
      background: #FF3333; color: white; font-size: 11px; font-weight: 700;
      width: 22px; height: 22px; border-radius: 50%;
      display: none; align-items: center; justify-content: center;
    }
    #rexflow-chat {
      position: fixed; bottom: 104px; right: 24px; z-index: 99998;
      width: 400px; height: 540px; background: #0D0D1A;
      border: 1px solid #1a1a2e; border-radius: 20px;
      display: none; flex-direction: column; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.05);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    }
    #rexflow-chat.open { display: flex; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .rw-header {
      background: linear-gradient(135deg, #111122, #0d0d1a);
      padding: 18px 20px; display: flex; align-items: center; gap: 14px;
      border-bottom: 1px solid #1a1a2e;
    }
    .rw-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 20px; color: #0A0A0F;
    }
    .rw-info { flex: 1; }
    .rw-name { font-weight: 700; font-size: 15px; color: #fff; }
    .rw-status { font-size: 12px; color: #4CAF50; display: flex; align-items: center; gap: 6px; }
    .rw-status::before { content: ''; width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; display: inline-block; }
    .rw-status.offline::before { background: #FF3333; }
    .rw-close { background: none; border: none; color: #666; font-size: 20px; cursor: pointer; padding: 4px 8px; }
    .rw-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #0A0A0F; }
    .rw-msg { max-width: 82%; padding: 12px 16px; border-radius: 14px; font-size: 13px; line-height: 1.5; word-wrap: break-word; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .rw-msg.in { background: #14142a; align-self: flex-start; border-bottom-left-radius: 4px; color: #e0e0e0; }
    .rw-msg.out { background: linear-gradient(135deg, #FFD700, #FFA500); color: #0A0A0F; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 600; }
    .rw-msg.system { background: transparent; align-self: center; color: #555; font-size: 11px; text-align: center; padding: 4px 10px; }
    .rw-sender { font-weight: 700; font-size: 11px; margin-bottom: 4px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; }
    .rw-input { display: flex; gap: 10px; padding: 14px 16px; border-top: 1px solid #1a1a2e; background: #0d0d14; }
    .rw-input input { flex: 1; background: #14142a; border: 1px solid #1a1a2e; color: #fff; padding: 12px 16px; border-radius: 12px; font-size: 13px; outline: none; transition: border-color 0.2s; }
    .rw-input input:focus { border-color: #FFD700; }
    .rw-input input::placeholder { color: #555; }
    .rw-input button { background: linear-gradient(135deg, #FFD700, #FFA500); color: #0A0A0F; border: none; padding: 12px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .rw-input button:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(255,215,0,0.3); }
    .rw-input button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .rw-typing { display: flex; gap: 4px; padding: 10px 16px; }
    .rw-typing span { width: 8px; height: 8px; background: #FFD700; border-radius: 50%; animation: rwBounce 1.4s infinite; }
    .rw-typing span:nth-child(2) { animation-delay: 0.2s; }
    .rw-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes rwBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.4); } 50% { box-shadow: 0 0 0 12px rgba(255,215,0,0); } }
    .rw-pulse { animation: pulse 2s infinite; }
    @media (max-width: 480px) {
      #rexflow-chat { width: calc(100vw - 32px); height: 65vh; right: 16px; bottom: 88px; border-radius: 16px; }
    }
  `;
  document.head.appendChild(css);
}

// Inject HTML
function injectHTML() {
  const html = `
    <button id="rexflow-toggle" onclick="toggleChat()" aria-label="Open consultant chat">
      <span>💬</span>
      <span id="rexflow-badge">0</span>
    </button>
    <div id="rexflow-chat">
      <div class="rw-header">
        <div class="rw-avatar">R</div>
        <div class="rw-info">
          <div class="rw-name">Rexflow Consultant</div>
          <div class="rw-status" id="rw-status">● Онлайн</div>
        </div>
        <button class="rw-close" onclick="toggleChat()">✕</button>
      </div>
      <div class="rw-messages" id="rw-messages">
        <div class="rw-msg system">Здравствуйте! Задайте вопрос — Rexflow-ассистент ответит в течение минуты.</div>
      </div>
      <div class="rw-input">
        <input type="text" id="rw-input" placeholder="Напишите вопрос..." onkeydown="if(event.key==='Enter')sendMessage()">
        <button onclick="sendMessage()" id="rw-send-btn">→</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// Bind events
function bindEvents() {
  // Close on outside click
  document.addEventListener('click', function(e) {
    const chat = document.getElementById('rexflow-chat');
    const toggle = document.getElementById('rexflow-toggle');
    if (isOpen && !chat.contains(e.target) && !toggle.contains(e.target)) {
      toggleChat();
    }
  });
}

// Toggle chat
function toggleChat() {
  isOpen = !isOpen;
  const chat = document.getElementById('rexflow-chat');
  const toggle = document.getElementById('rexflow-toggle');
  if (isOpen) {
    chat.classList.add('open');
    toggle.classList.add('active');
    unreadCount = 0;
    updateBadge();
    startPoll();
  } else {
    chat.classList.remove('open');
    toggle.classList.remove('active');
    stopPoll();
  }
}

// Add message to chat
function addMessage(text, type, sender = 'Вы') {
  const container = document.getElementById('rw-messages');
  const msg = document.createElement('div');
  msg.className = `rw-msg ${type}`;
  msg.innerHTML = `<div class="rw-sender">${sender}</div>${escapeHtml(text)}`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// Show typing indicator
function showTyping() {
  const container = document.getElementById('rw-messages');
  const typing = document.createElement('div');
  typing.className = 'rw-typing';
  typing.id = 'rw-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  const t = document.getElementById('rw-typing');
  if (t) t.remove();
}

// Update unread badge
function updateBadge() {
  const badge = document.getElementById('rexflow-badge');
  if (unreadCount > 0) {
    badge.style.display = 'flex';
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    document.getElementById('rexflow-toggle').classList.add('rw-pulse');
  } else {
    badge.style.display = 'none';
    document.getElementById('rexflow-toggle').classList.remove('rw-pulse');
  }
}

// Escape HTML
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Send message to Telegram
async function sendMessage() {
  const input = document.getElementById('rw-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'out', 'Вы');
  input.value = '';
  document.getElementById('rw-send-btn').disabled = true;

  // Send to Telegram bot
  try {
    await fetch(`https://api.telegram.org/bot${CFG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CFG.ADMIN_CHAT_ID,
        text: `💬 *Rexflow — Новый вопрос*\n\n👤 Клиент\n📝 ${text}`,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.error('Send error:', e);
  }

  // Show typing indicator
  showTyping();

  // Auto-reply placeholder
  setTimeout(() => {
    hideTyping();
    addMessage('Сообщение доставлено. Ответ придёт в течение нескольких минут.', 'system', '');
    document.getElementById('rw-send-btn').disabled = false;
  }, 2000);
}

// Poll for new messages from Telegram
async function pollMessages() {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${CFG.BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
    );
    const data = await res.json();
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          const text = update.message.text;
          const sender = update.message.from?.first_name || 'Rexflow';
          const chatId = update.message.chat?.id;
          
          // Only show messages from admin chat
          if (chatId == CFG.ADMIN_CHAT_ID) {
            hideTyping();
            addMessage(text, 'in', sender);
            if (!isOpen) {
              unreadCount++;
              updateBadge();
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Poll error:', e);
  }
}

// Start/stop polling
function startPoll() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(pollMessages, CFG.POLL_INTERVAL);
}

function stopPoll() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
