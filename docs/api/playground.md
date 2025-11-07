---
title: OpenAPI Playground
description: Interactive API documentation and testing playground
---

# OpenAPI Playground

Interactive API documentation with live endpoint testing capabilities. All API endpoints are available in the interactive documentation below, organized by resource type (Maqāmāt, Ajnās, Tuning Systems, etc.).

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification: [openapi.json](/openapi.json)

---

## Interactive API Documentation

<ClientOnly>
  <OASpec :spec-url="openApiUrl" />
</ClientOnly>

<script setup>
import { ref } from 'vue'

// OpenAPI spec URL
const openApiUrl = ref(`/openapi.json?v=${Date.now()}`)
</script>

