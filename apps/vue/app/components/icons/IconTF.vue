<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="logo-mark"
    viewBox="0 0 512 512"
    role="img"
    preserveAspectRatio="xMidYMid meet"
    aria-label="TF emblem"
  >
    <defs>
      <linearGradient id="tfGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6d28d9" />
        <stop offset="1" stop-color="#111827" />
      </linearGradient>
    </defs>

    <circle cx="256" cy="256" r="248" fill="url(#tfGrad)" />
    <circle cx="256" cy="256" r="236" fill="none" stroke="#e5e7eb" stroke-width="2" />
    <circle cx="256" cy="256" r="224" fill="none" stroke="#111827" stroke-width="2" opacity="0.6" />
    <circle cx="256" cy="256" r="210" :fill="props.color || 'var(--accent, #6c5ce7)'" />

    <g transform="skewX(-12)">
      <text x="160" y="320" font-size="260" class="ff-letter">T</text>
      <text x="290" y="380" font-size="260" class="ff-letter">F</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
  }>(),
  {
    color: undefined,
  },
);
</script>

<style scoped>
.ff-letter {
  font-family: 'FooFan', serif;
  fill: #111;
  stroke: #fff;
  stroke-width: 16;
  paint-order: stroke fill;
}

.logo-mark {
  display: inline-block;
  vertical-align: middle;
}
</style>
