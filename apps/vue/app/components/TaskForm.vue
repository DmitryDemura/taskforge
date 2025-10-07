<template>
  <div class="vstack" style="min-width: 320px">
    <div class="vstack">
      <label for="title">Title</label>

      <InputText
        id="title"
        v-model="model.title"
        placeholder="Task title"
        :disabled="props.disabled"
        aria-required="true"
      />
    </div>

    <div class="vstack">
      <label for="desc">Description</label>

      <Textarea
        id="desc"
        v-model="model.description"
        autoResize
        rows="3"
        placeholder="Optional description"
        :disabled="props.disabled"
      />
    </div>

    <div class="hstack">
      <div class="vstack" style="flex: 1">
        <label for="status">Status</label>

        <Dropdown
          id="status"
          v-model="model.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          :disabled="props.disabled"
          aria-label="Status"
          appendTo="body"
          :baseZIndex="12000"
        />
      </div>

      <div class="vstack" style="flex: 1">
        <label for="due">Due Date</label>

        <Calendar
          id="due"
          v-model="due"
          date-format="yy-mm-dd"
          show-icon
          icon-display="input"
          :disabled="props.disabled"
          aria-label="Due date"
          appendTo="body"
          :baseZIndex="12000"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import type { Task, TaskStatus } from '@/composables/useTasks';

const props = defineProps<{
  modelValue: Partial<Task>;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: Partial<Task>): void }>();

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const statusOptions = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
] as { label: string; value: TaskStatus }[];

const due = computed<Date | null>({
  get: () => {
    if (!model.value.dueDate) {
      return null;
    }
    return new Date(model.value.dueDate);
  },
  set: (d) => {
    model.value.dueDate = d ? new Date(d).toISOString().slice(0, 10) : null;
  },
});
</script>
