---
title: API Reference
description: Complete REST API documentation for the Digital Arabic Maqām Archive
---

# API Reference

The DiArMaqAr API provides programmatic access to maqām, jins, and tuning-system data with comprehensive documentation and examples.

<ClientOnly>
  <Suspense>
    <template #default>
      <LazyOASpec :spec-url="openApiUrl" />
    </template>
    <template #fallback>
      <div class="api-loading">
        <p>Loading API documentation...</p>
      </div>
    </template>
  </Suspense>
</ClientOnly>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'

// Lazy load the OpenAPI component wrapper to improve initial page load
// This defers loading the component and its dependencies until needed
const LazyOASpec = defineAsyncComponent({
  loader: () => import('../.vitepress/components/LazyOASpec.vue'),
  delay: 200, // Show fallback after 200ms delay for better UX
  timeout: 10000, // Timeout after 10 seconds
  onError: (error, retry, fail, attempts) => {
    // Log error for debugging
    console.error('Failed to load OpenAPI component:', error)
    if (attempts <= 3) {
      // Retry up to 3 times
      retry()
    } else {
      fail()
    }
  }
})

// Generate cache-busting URL once on mount
// Use /api/openapi.json which is a Next.js API route that works reliably on Netlify
// The API route serves the file from public/docs/openapi.json with proper no-cache headers
const openApiUrl = ref('/api/openapi.json')

onMounted(() => {
  // Add timestamp query parameter to ensure fresh fetch on each page load
  // The API route reads this parameter and includes it in response headers
  openApiUrl.value = `/api/openapi.json?v=${Date.now()}`
})
</script>

<style scoped>
.api-loading {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.api-error {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
  border-radius: 8px;
  margin: 1rem 0;
}
</style>

## Base URL

- **Production**: `http://localhost:3000/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses are in JSON format and follow consistent error handling patterns.

## Rate Limiting

Currently, there are no rate limits. Please use the API responsibly.

