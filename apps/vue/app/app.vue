<template>
  <a href="#main" class="sr-only-focusable">Skip to content</a>
  <NuxtPage />
</template>

<style>
.sr-only-focusable {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.sr-only-focusable:focus {
  left: 12px;
  top: 12px;
  width: auto;
  height: auto;
  background: #fff;
  color: #000;
  padding: 6px 10px;
  border-radius: 6px;
  z-index: 9999;
}

/* Dark theme support for PrimeVue components */
[data-theme='dark'] {
  --p-surface-0: #1f1f1f;
  --p-surface-50: #2a2a2a;
  --p-surface-100: #2f2f2f;
  --p-surface-200: #3a3a3a;
  --p-surface-300: #454545;
  --p-surface-400: #505050;
  --p-surface-500: #5a5a5a;
  --p-surface-600: #656565;
  --p-surface-700: #707070;
  --p-surface-800: #7a7a7a;
  --p-surface-900: #858585;
  --p-surface-950: #8f8f8f;

  --p-content-color: #e0e0e0;
  --p-text-color: #e0e0e0;
  --p-text-muted-color: #b0b0b0;
  --p-border-color: #3a3a3a;
  --p-primary-color: #3b82f6;
  --p-primary-contrast-color: #ffffff;
}

/* Ensure DataTable respects dark theme */
[data-theme='dark'] .p-datatable {
  background-color: var(--p-surface-0);
  color: var(--p-text-color);
}

[data-theme='dark'] .p-datatable .p-datatable-thead > tr > th {
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
  border-color: var(--p-border-color);
}

[data-theme='dark'] .p-datatable .p-datatable-tbody > tr {
  background-color: var(--p-surface-0);
  color: var(--p-text-color);
  border-color: var(--p-border-color);
}

[data-theme='dark'] .p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: var(--p-surface-50);
}

[data-theme='dark'] .p-datatable .p-datatable-tbody > tr:hover {
  background-color: var(--p-surface-100);
}

/* Dark theme for other PrimeVue components */
[data-theme='dark'] .p-inputtext {
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
  border-color: var(--p-border-color);
}

[data-theme='dark'] .p-dropdown {
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
  border-color: var(--p-border-color);
}

[data-theme='dark'] .p-button {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-color);
}

[data-theme='dark'] .p-card {
  background-color: var(--p-surface-0);
  color: var(--p-text-color);
}
</style>
