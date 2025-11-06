<script setup lang="ts">
// Props
interface Props {
  specUrl: string
}

const props = defineProps<Props>()

// OASpec is registered globally by the theme, so we can use it directly
// This wrapper allows us to lazy load it via defineAsyncComponent
</script>

<template>
  <!-- OASpec is available globally from vitepress-openapi theme -->
  <OASpec :spec-url="props.specUrl" />
</template>

