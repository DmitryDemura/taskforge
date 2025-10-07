import { useSettingsStore } from '@/stores/settings';

export function useTheme() {
  const settings = useSettingsStore();
  const systemPrefersDark = ref(false);

  function readSystem(): void {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = mq.matches;
  }

  function applyTheme(): void {
    const html = document.documentElement;

    if (settings.theme === 'auto') {
      html.setAttribute('data-theme', systemPrefersDark.value ? 'dark' : 'light');

      return;
    }

    html.setAttribute('data-theme', settings.theme);
  }

  function watchSystem(): () => void {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (): void => {
      readSystem();

      if (settings.theme === 'auto') {
        applyTheme();
      }
    };

    mq.addEventListener('change', handler);

    return () => {
      mq.removeEventListener('change', handler);
    };
  }

  onMounted(() => {
    readSystem();
    applyTheme();
  });

  return { applyTheme, watchSystem, systemPrefersDark };
}
