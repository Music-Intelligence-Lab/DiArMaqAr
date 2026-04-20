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

> **For LLMs:** This page is an interactive UI that requires a browser.
> Use [`/docs/api/representative-examples`](/docs/api/representative-examples),
> [`/docs/openapi.json`](/docs/openapi.json), or direct `curl` calls against
> `/api/*` instead.

Interactive API documentation with live endpoint testing capabilities. All API endpoints are available 
in the interactive documentation below, organized by resource type (Maqāmāt, Ajnās, Tuning Systems, 
etc.).

Machine-readable OpenAPI 3.1.0 specification: [openapi.json](/openapi.json)

<ClientOnly>
  <HashNavigation />
  <OASpec :spec-url="'/docs/openapi.json'" />
  <template #fallback>
    <div style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: var(--vp-c-text-2);">
      <p>Loading API documentation...</p>
    </div>
  </template>
</ClientOnly>

