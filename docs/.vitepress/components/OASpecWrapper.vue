<script setup lang="ts">
import { ClientOnly } from 'vitepress'
import OASpec from 'vitepress-openapi/src/components/Feature/OASpec.vue'

// Load the spec at runtime on the client side
</script>

<template>
  <ClientOnly>
    <OASpec spec-url="/docs/openapi.json" />
    <template #fallback>
      <div>Loading API documentation...</div>
    </template>
  </ClientOnly>
</template>

