export default defineNuxtPlugin(() => {
  if (process.dev && typeof window !== 'undefined') {
    const originalWarn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      const msg = String(args[0] ?? '');

      if (
        msg.includes('<Suspense> is an experimental feature') ||
        msg.includes('Deprecated since v4. Use Select component instead')
      ) {
        return; // mute noisy framework warnings in dev
      }

      originalWarn(...args);
    };
  }
});
