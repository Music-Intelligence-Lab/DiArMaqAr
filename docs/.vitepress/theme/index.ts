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
    // Configure OpenAPI theme to use Shiki (code blocks) instead of vue-json-pretty (tree view)
    // This ensures all JSON responses render consistently as formatted code blocks
    useOpenapi({
      config: {
        jsonViewer: {
          renderer: 'shiki', // Use Shiki for formatted code blocks instead of tree view
        },
      },
    })
    
    // OpenAPI will be configured per-page using the <OpenAPI /> component
    openApiTheme.enhanceApp({ app })
  },
} satisfies Theme

