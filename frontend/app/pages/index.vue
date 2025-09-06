<script setup lang="ts">
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const ping = () => {
  if (!import.meta.client) {
    return;
  }

  const toast = useToast();

  toast.add({
    severity: 'success',
    summary: 'TaskForge',
    detail: 'PrimeVue OK',
    life: 1500,
  });
};
</script>

<template>
  <ClientOnly>
    <div style="padding: 24px">
      <Button label="Ping" icon="pi pi-check" @click="ping" />
    </div>
  </ClientOnly>
</template>
