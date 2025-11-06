import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useOpenapi, theme as openApiTheme } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
// Import custom.css after OpenAPI styles to ensure our overrides apply
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Configure OpenAPI theme with performance optimizations
    useOpenapi({
      config: {
        jsonViewer: {
          renderer: 'shiki', // Use Shiki for formatted code blocks instead of tree view
        },
        // Performance optimizations: only expand first level by default
        // This reduces initial render time for large API specs
        defaultExpandDepth: 1,
        // Keep request/response payloads visible but optimize rendering
        hideRequestPayload: false,
        hideResponsePayload: false,
        // Optimize rendering of large schemas
        hideSchemaExamples: false,
      },
    })
    
    // OpenAPI will be configured per-page using the <OpenAPI /> component
    openApiTheme.enhanceApp({ app })
  },
} satisfies Theme

