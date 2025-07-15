// logger.js

/**
 * Sends a log entry to the test server.
 * @param {string} stack such as frontend, backend.
 * @param {string} level - e.g., "info", "warn", "error", "fatal", "debug"
 * @param {string} pkg - packages that can only use frontend like api, hooks etc.
 * @param {string} message - log message description
 */
export async function Log(stack, level, pkg, message) {
    try {
      const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack,
          level,
          package: pkg,
          message,
        }),
      });
  
      if (!response.ok) {
        // handes the failed logs
        console.error('Failed to send log:', response.statusText);
      }
    } catch (err) {
      //handles the network errors
      console.error('Logging error:', err);
    }
  }