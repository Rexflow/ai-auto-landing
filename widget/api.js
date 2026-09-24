// Rexflow Consultant Widget - API Handler
// This script handles message routing between website visitors and Telegram

const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Replace with bot token from @BotFather
const ADMIN_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID'; // This chat - DM with Artem

// Send message from website visitor to Telegram
async function forwardToTelegram(clientMsg, clientName = 'Клиент') {
  try {
    // Send to admin (Artem)
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: `💬 *Новый вопрос с сайта Rexflow*\n\n👤: ${clientName}\n📝: ${clientMsg}`,
        parse_mode: 'Markdown'
      })
    });
    return { success: true };
  } catch (e) {
    console.error('Forward error:', e);
    return { success: false, error: e.message };
  }
}

// Poll for new messages from Telegram
async function pollTelegram(offset = 0) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset + 1}&timeout=30`
    );
    const data = await res.json();
    if (data.ok && data.result.length > 0) {
      const messages = data.result.map(u => ({
        id: u.update_id,
        text: u.message?.text || '',
        chatId: u.message?.chat?.id,
        sender: u.message?.from?.first_name || 'Unknown',
        date: u.message?.date
      }));
      return { success: true, messages };
    }
    return { success: true, messages: [] };
  } catch (e) {
    console.error('Poll error:', e);
    return { success: false, error: e.message };
  }
}

// Export for use
if (typeof module !== 'undefined') module.exports = { forwardToTelegram, pollTelegram };
