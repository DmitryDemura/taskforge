<template>
  <div class="global-search-container">
    <div class="search-input-wrapper">
      <InputText
        ref="searchRef"
        class="global-search"
        :value="searchValue"
        placeholder="Search in all columns..."
        :aria-label="'Global search'"
        @input="onInput"
      />
      <Button
        v-if="searchValue"
        icon="pi pi-times"
        class="clear-search-btn"
        @click="clearSearch"
        aria-label="Clear search"
        text
        rounded
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();

const emit = defineEmits<{
  (e: 'search', value: string): void;
}>();

const searchValue = computed({
  get: () => settings.global,
  set: (value: string) => {
    if (settings.global !== value) {
      settings.global = value;
    }
  },
});

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (searchValue.value !== value) {
    searchValue.value = value;
    settings.page = 0;
    settings.save();
    emit('search', value);
  }
}

function clearSearch(): void {
  searchValue.value = '';
  settings.page = 0;
  settings.save();
  emit('search', '');
}

const searchRef = ref<HTMLInputElement>();

function onKeydown(e: KeyboardEvent): void {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const key = e.key.toLowerCase();

  if (isMac && e.metaKey && key === 'k') {
    e.preventDefault();
    searchRef.value?.focus();
    return;
  }

  if (!isMac && e.ctrlKey && key === 'k') {
    e.preventDefault();
    searchRef.value?.focus();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.global-search-container {
  width: 100%;
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.global-search {
  width: 100%;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border-radius: 8px;
  border: 1px solid var(--p-surface-border);
  background: var(--p-surface-0);
  color: var(--p-text-color);
  transition: all 0.2s ease;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
}

.global-search:focus {
  outline: none;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 2px var(--p-primary-color-alpha-20);
}

.global-search::placeholder {
  color: var(--p-text-muted-color);
}
</style>
