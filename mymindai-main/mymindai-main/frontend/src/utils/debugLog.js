export function debugLog(...args) {
    const DEBUG_MODE = true; // выключить = false
  
    if (DEBUG_MODE) {
      if (window.Telegram?.WebApp.platform === 'unknown') {
        // Если запущено вне Telegram, показываем в консоли
        console.log('[debugLog]', ...args);
      } else {
        // Если запущено внутри Telegram, показываем alert
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return '[Unserializable Object]';
            }
          }
          return String(arg);
        }).join(' | ');
  
        alert(`[debugLog]\n${message}`);
      }
    }
  }
  