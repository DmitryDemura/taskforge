import { defineStore } from 'pinia';
import type { TaskStatus } from '@/composables/useTasks';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type SortOrder = 1 | -1;

const LS_KEY = 'taskforge-settings-v5';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'auto' as ThemeMode,

    pageSize: 20,
    page: 0,
    sortField: 'dueDate' as string | null,
    sortOrder: 1 as SortOrder,

    global: '',
    status: 'all' as TaskStatus | 'all',
    filters: { title: '', dueDate: '' } as Record<string, string>,
  }),

  actions: {
    load(): void {
      try {
        const raw = localStorage.getItem(LS_KEY);

        if (raw) {
          Object.assign(this, JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    },

    save(): void {
      localStorage.setItem(LS_KEY, JSON.stringify(this.$state));
    },

    setTheme(mode: ThemeMode): void {
      this.theme = mode;
      this.save();
    },
  },
});
