---
title: API Reference
description: Complete REST API documentation for the Digital Arabic Maqām Archive
---

# API Reference

The DiArMaqAr API provides programmatic access to maqām, jins, and tuning-system data with comprehensive documentation and examples.

<ClientOnly>
  <OASpec :spec-url="openApiUrl" />
</ClientOnly>

<script setup>
import { ref, onMounted } from 'vue'

// Generate cache-busting URL once on mount
// The API route at /api/openapi.json already has strict no-cache headers,
// but this provides an extra layer of cache-busting for browser/client-side caches
const openApiUrl = ref('/api/openapi.json')

onMounted(() => {
  // Add timestamp query parameter to ensure fresh fetch on each page load
  // The API route reads this parameter and includes it in response headers
  openApiUrl.value = `/api/openapi.json?v=${Date.now()}`
})
</script>

## Base URL

- **Production**: `http://localhost:3000/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses are in JSON format and follow consistent error handling patterns.

## Rate Limiting

Currently, there are no rate limits. Please use the API responsibly.

