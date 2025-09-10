<template>
  <div class="card" role="region" aria-labelledby="appTitle">
    <template v-if="backendDown">
      <div class="skeleton-wrap" aria-live="polite" aria-busy="true">
        <div class="skeleton-toolbar">
          <Skeleton width="30%" height="2rem" />
        </div>
        <div class="skeleton-header">
          <Skeleton width="20%" height="1.2rem" />
          <Skeleton width="15%" height="1.2rem" />
          <Skeleton width="12%" height="1.2rem" />
          <Skeleton width="10%" height="1.2rem" />
        </div>
        <div class="skeleton-rows">
          <div v-for="n in 6" :key="n" class="skeleton-row">
            <Skeleton width="35%" height="1.1rem" />
            <Skeleton width="10%" height="1.1rem" />
            <Skeleton width="12%" height="1.1rem" />
            <Skeleton width="10%" height="1.1rem" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <DataTable
        ref="dataTableRef"
        :key="`dt-${settings.pageSize}`"
        :lazy="true"
        :value="safeTasks"
        dataKey="id"
        :loading="pending"
        :paginator="true"
        :alwaysShowPaginator="true"
        :rows="settings.pageSize"
        :first="settings.page * settings.pageSize"
        :totalRecords="props.totalRecords"
        :rowsPerPageOptions="pageSizes"
        :sortField="settings.sortField || undefined"
        :sortOrder="settings.sortOrder"
        v-model:filters="dtFilters"
        :globalFilterFields="['title', 'status', 'dueDate', 'description']"
        :rowClass="rowClass"
        @page="onPage"
        @sort="onSort"
        @filter="onFilter"
        responsiveLayout="scroll"
        paginatorDropdownAppendTo="body"
        aria-label="Tasks table"
      >
        <Column field="title" header="Title" sortable :showFilterMatchModes="false">
          <template #filter>
            <InputText
              v-model="dtFilters.title.value"
              placeholder="Filter by title"
              aria-label="Filter by title"
            />
          </template>
        </Column>

        <Column field="status" header="Status" sortable :showFilterMatchModes="false">
          <template #filter>
            <Dropdown
              v-model="dtFilters.status.value"
              :options="statusOptionsAll"
              option-label="label"
              option-value="value"
              placeholder="Any"
              aria-label="Filter by status"
              appendTo="body"
            />
          </template>

          <template #body="{ data }">
            <Tag
              :value="statusLabel(data.status)"
              :severity="statusSeverity(data.status)"
              aria-label="Status tag"
            />
          </template>
        </Column>

        <Column field="dueDate" header="Due" sortable :showFilterMatchModes="false">
          <template #body="{ data }">
            <span :style="{ color: isOverdue(data.dueDate) ? 'tomato' : 'inherit' }">
              {{ data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '—' }}
            </span>
          </template>

          <template #filter>
            <InputText
              v-model="dtFilters.dueDate.value"
              placeholder="yyyy-mm-dd"
              aria-label="Filter by due date"
            />
          </template>
        </Column>

        <Column header="Actions" :style="{ width: '160px' }">
          <template #body="{ data }">
            <div class="hstack" role="group" aria-label="Row actions">
              <Button
                icon="pi pi-pencil"
                rounded
                text
                :aria-label="`Edit ${data.title}`"
                @click="emit('edit', data)"
              />
              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                :aria-label="`Delete ${data.title}`"
                @click="emit('delete', data)"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="p-4">No tasks found.</div>
        </template>
      </DataTable>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import DataTable, {
  type DataTablePageEvent,
  type DataTableSortEvent,
  type DataTableFilterEvent,
} from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import { FilterMatchMode } from 'primevue/api';

import { useSettingsStore, type SortOrder } from '@/stores/settings';
import type { Task, TaskStatus } from '@/composables/useTasks';

const props = defineProps({
  tasks: {
    type: [Array, Object] as unknown as PropType<Task[] | { tasks: Task[] }>,
    required: true,
  },
  pending: { type: Boolean, required: true },
  totalRecords: { type: Number, default: 0 },
  backendDown: { type: Boolean, default: false },
});

const emit = defineEmits<{
  (e: 'edit', t: Task): void;
  (e: 'delete', t: Task): void;
  (e: 'reload'): void;
}>();

const settings = useSettingsStore();

const safeTasks = computed<Task[]>(() => {
  const v = props.tasks as unknown;

  if (Array.isArray(v)) {
    return v as Task[];
  }

  if (typeof v === 'object' && v !== null && Array.isArray((v as { tasks?: unknown }).tasks)) {
    return (v as { tasks: Task[] }).tasks;
  }

  return [];
});

const pageSizes = [5, 10, 20, 50];

const dataTableRef = ref();

const statusOptionsAll = [
  { label: 'All', value: '' },
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
] as const;

const dtFilters = reactive({
  global: { value: settings.global, matchMode: FilterMatchMode.CONTAINS },
  title: { value: settings.filters.title ?? '', matchMode: FilterMatchMode.CONTAINS },
  status: {
    value: settings.status === 'all' ? '' : settings.status,
    matchMode: FilterMatchMode.EQUALS,
  },
  dueDate: { value: settings.filters.dueDate ?? '', matchMode: FilterMatchMode.CONTAINS },
});

let filterTimer: ReturnType<typeof setTimeout> | null = null;
let updatingFilters = false;

onMounted(() => {
  if (settings.pageSize !== 5) {
    settings.pageSize = 5;
    settings.page = 0;
    settings.save();
    emit('reload');
  }
});

function emitReloadDebounced(ms = 250) {
  if (filterTimer) clearTimeout(filterTimer);
  filterTimer = setTimeout(() => emit('reload'), ms);
}

function statusLabel(s: TaskStatus): string {
  if (s === 'todo') return 'To do';
  if (s === 'in_progress') return 'In progress';
  return 'Done';
}

function statusSeverity(s: TaskStatus): 'secondary' | 'info' | 'success' {
  if (s === 'todo') return 'secondary';
  if (s === 'in_progress') return 'info';
  return 'success';
}

function isOverdue(d?: string | null): boolean {
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d) < today;
}

function rowClass(data: Task): string {
  if (data.status === 'done') return 'row--done';
  if (data.status === 'in_progress') return 'row--progress';
  return 'row--todo';
}

function onPage(e: DataTablePageEvent): void {
  const rowsChanged = e.rows !== settings.pageSize;
  settings.pageSize = e.rows;
  settings.page = rowsChanged ? 0 : Math.floor(e.first / e.rows);
  settings.save();
  emit('reload');
}

function onSort(e: DataTableSortEvent): void {
  settings.sortField = (e.sortField as string | null) ?? null;
  settings.sortOrder = (e.sortOrder ?? 1) as SortOrder;
  settings.save();
  emitReloadDebounced(0);
}

function onFilter(e: DataTableFilterEvent): void {
  if (updatingFilters) return;

  let hasChanges = false;
  updatingFilters = true;

  try {
    if (e.filters?.title) {
      const newValue = (e.filters.title as any).value || '';
      if (settings.filters.title !== newValue) {
        settings.filters.title = newValue;
        hasChanges = true;
      }
    }

    if (e.filters?.status) {
      const statusValue = (e.filters.status as any).value;
      const newStatus = statusValue === '' ? 'all' : statusValue || 'all';
      if (settings.status !== newStatus) {
        settings.status = newStatus;
        hasChanges = true;
      }
    }

    if (e.filters?.dueDate) {
      const newValue = (e.filters.dueDate as any).value || '';
      if (settings.filters.dueDate !== newValue) {
        settings.filters.dueDate = newValue;
        hasChanges = true;
      }
    }
  } finally {
    updatingFilters = false;
  }

  if (hasChanges) {
    settings.page = 0;
    settings.save();
    emitReloadDebounced(0);
  }
}

watch(
  () => [settings.filters.title, settings.status, settings.filters.dueDate],
  ([newTitle, newStatus, newDueDate]) => {
    if (updatingFilters) return;

    updatingFilters = true;
    try {
      const titleValue = newTitle ?? '';
      if (dtFilters.title.value !== titleValue) {
        dtFilters.title.value = titleValue;
      }

      const statusValue = newStatus === 'all' ? '' : newStatus;
      if (dtFilters.status.value !== statusValue) {
        dtFilters.status.value = statusValue;
      }

      const dueDateValue = newDueDate ?? '';
      if (dtFilters.dueDate.value !== dueDateValue) {
        dtFilters.dueDate.value = dueDateValue;
      }
    } finally {
      updatingFilters = false;
    }
  },
);
</script>

<style scoped>
.skeleton-wrap {
  padding: 1rem;
}
.skeleton-toolbar {
  margin-bottom: 0.5rem;
}
.skeleton-header {
  display: grid;
  grid-template-columns: 1fr 160px 160px 160px;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.skeleton-rows {
  display: grid;
  gap: 0.75rem;
}
.skeleton-row {
  display: grid;
  grid-template-columns: 1fr 160px 160px 160px;
  gap: 1rem;
  align-items: center;
}
</style>
