// Rexflow Consultant Widget - Embed Script
// Add to site <head>: <script src="widget/embed.js" async></script>

(function() {
  // Load widget HTML
  const iframe = document.createElement('iframe');
  iframe.src = '/widget/consultant.html';
  iframe.style.cssText = 'position:fixed;bottom:24px;right:24px;width:0;height:0;border:none;z-index:99999;';
  iframe.id = 'rexflow-consultant';
  document.body.appendChild(iframe);
  
  // Listen for messages from widget
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'consultant') {
      if (e.data.action === 'send') {
        // Forward to Telegram via API
        fetch('/widget/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: e.data.text, source: 'website' })
        });
      }
    }
  });
})();
