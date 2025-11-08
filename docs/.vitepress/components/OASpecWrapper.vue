<script setup lang="ts">
import { ClientOnly } from 'vitepress'

// OASpec is registered globally by vitepress-openapi theme
// We use ClientOnly to ensure it only renders on the client side
</script>

<template>
  <ClientOnly>
    <OASpec :spec-url="'/docs/openapi.json'" />
    <template #fallback>
      <div class="oaspec-loading">
        <p>Loading API documentation...</p>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.oaspec-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--vp-c-text-2);
}
</style>

