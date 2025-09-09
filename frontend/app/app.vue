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
</style>
