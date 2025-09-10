<template>
  <main id="main" class="container vstack" role="main" aria-labelledby="appTitle">
    <TaskHeader @filter="reload" @sort="reloadIfServerSort" @create="openCreate" />

    <GlobalSearch @search="onGlobalSearch" />

    <TaskTable
      :tasks="tasks"
      :pending="pending"
      :totalRecords="totalTasks"
      :firstLoad="firstLoad"
      :backendDown="backendDown"
      @edit="openEdit"
      @delete="removeTask"
      @reload="reload"
    />

    <TaskDialog
      v-model:visible="dialog.visible"
      v-model:modelValue="dialog.model"
      :mode="dialog.mode"
      @submit="submit"
      @cancel="onCancelDialog"
    />

    <ConfirmDialog />
    <Toast />
  </main>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

import TaskHeader from '@/components/TaskHeader.vue';
import TaskTable from '@/components/TaskTable.vue';
import TaskDialog from '@/components/TaskDialog.vue';
import GlobalSearch from '@/components/GlobalSearch.vue';

import { useSettingsStore } from '@/stores/settings';
import { useTasksApi, type Task } from '@/composables/useTasks';
import { useTheme } from '@/composables/useTheme.client';

const toast = useToast();
const settings = useSettingsStore();
const { applyTheme, watchSystem } = useTheme();
const { list, create, update, remove, pending, backendDown } = useTasksApi();
const firstLoad = ref(true);

const tasks = ref<Task[]>([]);
const totalTasks = ref(0);

const dialog = reactive<{
  visible: boolean;
  mode: 'create' | 'edit';
  model: Partial<Task>;
}>({
  visible: false,
  mode: 'create',
  model: {},
});

const debouncedReload = debounce(() => reload(), 450);

let reloading = false;

function debounce<T extends (...a: any[]) => void>(fn: T, ms = 400) {
  let t: any = null;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

onMounted(async () => {
  settings.load();
  applyTheme();

  const unwatch = watchSystem();
  onUnmounted(unwatch);

  await reload(); // initial load
});

/**
 * Key function: collects a query from Pinia and calls backend.
 * - filters and pagination always on backend
 * - sorting: always send it to backend (let backend handle it)
 */
async function reload(): Promise<void> {
  if (reloading) {
    return;
  }

  reloading = true;

  try {
    backendDown.value = false;

    const queryParams = {
      status: settings.status === 'all' ? 'all' : settings.status,
      sort:
        settings.sortField && settings.sortOrder
          ? settings.sortOrder === 1
            ? 'asc'
            : 'desc'
          : undefined,
      sortField: settings.sortField || undefined,
      page: settings.page + 1,
      limit: settings.pageSize,
      search: settings.global || undefined,
      title: settings.filters.title || undefined,
      dueDate: settings.filters.dueDate || undefined,
    };

    const result = await list(queryParams);

    tasks.value = Array.isArray(result) ? (result as Task[]) : (result.tasks ?? []);
    totalTasks.value = Array.isArray(result)
      ? tasks.value.length
      : (result.total ?? tasks.value.length);
  } catch (e) {
    console.error('[tasks] reload failed:', e);
    backendDown.value = true;
    tasks.value = [];
    totalTasks.value = 0;
  } finally {
    reloading = false;

    if (firstLoad.value) {
      firstLoad.value = false;
    }
  }
}

function reloadIfServerSort(): void {
  void reload();
}

function openCreate(): void {
  dialog.mode = 'create';
  dialog.model = {
    title: '',
    description: '',
    status: 'todo',
    dueDate: null,
  };
  dialog.visible = true;
}

function openEdit(row: Task): void {
  dialog.mode = 'edit';
  dialog.model = { ...row };
  dialog.visible = true;
}

async function submit(): Promise<void> {
  try {
    if (dialog.mode === 'create') {
      await create(dialog.model as Omit<Task, 'id'>);
      toast.add({ severity: 'success', summary: 'Created', life: 1600 });
    } else {
      await update(dialog.model.id as number, dialog.model);
      toast.add({ severity: 'success', summary: 'Saved', life: 1600 });
    }

    dialog.visible = false;
    await reload();
  } catch (e: any) {
    console.error('Submit error:', e);

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.message ?? 'Request failed',
      life: 2600,
    });

    dialog.visible = false;
  }
}

async function removeTask(row: Task): Promise<void> {
  try {
    await remove(row.id);
    toast.add({ severity: 'success', summary: 'Deleted', life: 1400 });
    await reload();
  } catch (e: any) {
    console.error('Delete error:', e);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.message ?? 'Request failed',
      life: 2600,
    });
  }
}

function onCancelDialog(): void {
  dialog.visible = false;
}

function onGlobalSearch(): void {
  // GlobalSearch component already handles settings.global update
  // We just need to trigger reload
  debouncedReload();
}
</script>
