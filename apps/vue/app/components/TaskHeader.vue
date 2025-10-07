<template>
  <header class="header hstack" role="banner" aria-label="Task header">
    <IconTF class="logo-mark" />
    <h2 id="appTitle" style="margin: 0">TaskForge</h2>
    <div class="spacer"></div>

    <Dropdown
      v-model="settings.status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      aria-label="Status filter"
      appendTo="body"
      style="min-width: 160px"
      @change="emitFilter"
    />

    <Dropdown
      v-model="sortModel"
      :options="sortOptions"
      option-label="label"
      option-value="value"
      aria-label="Sort by due date"
      appendTo="body"
      style="min-width: 160px"
      @change="emitSort"
    />

    <ThemeSwitcher />

    <Button
      icon="pi pi-plus"
      @click="$emit('create')"
      aria-label="Create task"
      class="add-button"
    />
  </header>
</template>

<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import IconTF from '@/components/icons/IconTF.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();

const emit = defineEmits<{
  (e: 'filter'): void;
  (e: 'sort'): void;
  (e: 'create'): void;
}>();

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const sortOptions = [
  { label: 'Due ↑ (asc)', value: 'asc' },
  { label: 'Due ↓ (desc)', value: 'desc' },
];

const sortModel = computed<'asc' | 'desc'>({
  get: () => (settings.sortOrder === 1 ? 'asc' : 'desc'),
  set: (v) => {
    settings.sortOrder = v === 'asc' ? 1 : -1;
  },
});

function emitFilter(): void {
  settings.page = 0;
  settings.save();
  emit('filter');
}

function emitSort(): void {
  settings.save();
  emit('sort');
}
</script>

<style scoped>
.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
}

.add-button .pi {
  margin: 0 !important;
}
</style>
