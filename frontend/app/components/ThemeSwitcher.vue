<template>
  <div class="hstack" role="group" aria-label="Theme switcher">
    <!-- Auto -->
    <button
      class="icon-btn"
      :class="{ active: settings.theme === 'auto' }"
      @click="set('auto')"
      :aria-pressed="settings.theme === 'auto'"
      :title="autoTitle"
      aria-label="Auto theme"
    >
      <IconMoon v-if="systemPrefersDark" />
      <IconSun v-else />
      <span class="auto-badge" aria-hidden="true">A</span>
      <span class="sr-only">{{ autoTitle }}</span>
    </button>

    <!-- Light -->
    <button
      class="icon-btn"
      :class="{ active: settings.theme === 'light' }"
      @click="set('light')"
      :aria-pressed="settings.theme === 'light'"
      aria-label="Light theme"
      title="Light theme"
    >
      <IconSun />
      <span class="sr-only">Light</span>
    </button>

    <!-- Dark -->
    <button
      class="icon-btn"
      :class="{ active: settings.theme === 'dark' }"
      @click="set('dark')"
      :aria-pressed="settings.theme === 'dark'"
      aria-label="Dark theme"
      title="Dark theme"
    >
      <IconMoon />
      <span class="sr-only">Dark</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, type ThemeMode } from '@/stores/settings';
import { useTheme } from '@/composables/useTheme.client';
import IconSun from '@/components/icons/IconSun.vue';
import IconMoon from '@/components/icons/IconMoon.vue';

const settings = useSettingsStore();
const { applyTheme, systemPrefersDark } = useTheme();

const autoTitle = computed(() => {
  return systemPrefersDark.value ? 'Auto (system: dark)' : 'Auto (system: light)';
});

function set(mode: ThemeMode): void {
  settings.setTheme(mode);
  applyTheme();
}
</script>

<style scoped>
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 40px;
  height: 36px;

  border: none;
  background: transparent;
  cursor: pointer;

  color: var(--fg);
  opacity: 0.85;

  border-radius: 8px;
}

.icon-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

[data-theme='dark'] .icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.icon-btn.active {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.auto-badge {
  position: absolute;
  right: 2px;
  bottom: 2px;

  font-size: 11px;
  font-weight: 700;

  background: var(--card-bg);
  color: var(--fg);

  border-radius: 4px;
  padding: 0 3px;
  line-height: 1.2;

  opacity: 0.95;
}

.sr-only {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
