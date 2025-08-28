import * as Sentry from '@sentry/react';

export function initSentry() {
  if (process.env.PROD || '') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN || '' || 'YOUR_SENTRY_DSN',
      integrations: [
        // Remove BrowserTracing as it's not compatible with current version
      ],
      tracesSampleRate: 0.1,
      environment: process.env.MODE || '',
      release: process.env.VITE_APP_VERSION || '' || '1.0.0',

      // Remove performance option as it's not valid

      // Error filtering
      beforeSend(event) {
        // Filter out certain errors
        if (event.exception) {
          const exception = event.exception.values?.[0];
          if (
            exception?.value?.includes('ResizeObserver loop limit exceeded')
          ) {
            return null;
          }
        }
        return event;
      },

      // User context
      initialScope: {
        tags: {
          app: 'sabo-pool-arena-hub',
        },
      },
    });
  }
}

export { Sentry };
