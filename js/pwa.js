// PWA Service Worker Registration
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/service-worker.js')
      .then((registration) => {
        console.log('PWA Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', (event) => {
            if (event.target.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content available! Refresh to update.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('PWA Service Worker registration failed:', error);
      });
  });
  
  // Request notification permission for future features
  if ('Notification' in window && Notification.permission === 'default') {
    // Silent permission request - user will see browser prompt
    void Notification.requestPermission();
  }
}

// Online/Offline status indicator
window.addEventListener('online', () => {
  console.log('Connection restored - back online');
});

window.addEventListener('offline', () => {
  console.log('Connection lost - using cached version');
});
