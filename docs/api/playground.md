---
title: OpenAPI Playground
description: Interactive API documentation and testing playground
head:
  - - link
    - rel: prefetch
      href: /docs/openapi.json
      as: fetch
      crossorigin: anonymous
---

# OpenAPI Playground

Interactive API documentation with live endpoint testing capabilities. All API endpoints are available in the interactive documentation below, organized by resource type (Maqāmāt, Ajnās, Tuning Systems, etc.).

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification: [openapi.json](/docs/openapi.json)

---

## Interactive API Documentation

Interactive API documentation with live endpoint testing capabilities. All API endpoints are available in the interactive documentation below, organized by resource type (Maqāmāt, Ajnās, Tuning Systems, etc.).

<ClientOnly>
  <HashNavigation />
  <OASpec :spec-url="'/docs/openapi.json'" />
  <template #fallback>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: var(--vp-c-text-2);">
      <p>Loading API documentation...</p>
    </div>
  </template>
</ClientOnly>

