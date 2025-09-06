import { defineNuxtPlugin } from 'nuxt/app';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(PrimeVue, { ripple: true });
  vueApp.use(ToastService);
  vueApp.use(ConfirmationService);
});
