<template>
  <Dialog
    v-model:visible="visible"
    :header="dialogTitle"
    modal
    :style="{ width: '520px' }"
    role="dialog"
    aria-modal="true"
    appendTo="body"
    :baseZIndex="11000"
  >
    <TaskForm v-model="model" :disabled="isSubmitting" />

    <template #footer>
      <div class="hstack" style="justify-content: flex-end">
        <Button
          label="Cancel"
          severity="secondary"
          :disabled="isSubmitting"
          @click="close"
          aria-label="Cancel"
        />
        <Button
          :label="mode === 'create' ? 'Create' : 'Save'"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          @click="submit"
          aria-label="Submit changes"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import TaskForm from '@/components/TaskForm.vue';
import type { Task } from '@/composables/useTasks';

const props = defineProps<{
  modelValue: Partial<Task>;
  mode: 'create' | 'edit';
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'update:modelValue', v: Partial<Task>): void;
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const isSubmitting = ref(false);

const visible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v),
});

const model = computed({
  get: () => props.modelValue,
  set: (v: Partial<Task>) => emit('update:modelValue', v),
});

const dialogTitle = computed(() => {
  return props.mode === 'create' ? 'Create Task' : 'Edit Task';
});

function submit(): void {
  isSubmitting.value = true;
  emit('submit');
}

function close(): void {
  isSubmitting.value = false;
  emit('cancel');
  emit('update:visible', false);
}

// Reset submitting state when dialog closes
watch(
  () => props.visible,
  (newVisible) => {
    if (!newVisible) {
      isSubmitting.value = false;
    }
  },
);
</script>
