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
        markdown: {
          // vitepress-openapi builds its markdown-it with `breaks: true`, which
          // turns every newline into a <br>. Our openapi.yaml descriptions are
          // `|` block scalars with hard-wrapped prose, so that rendered them with
          // line breaks mid-sentence. CommonMark (and VitePress itself) treat a
          // single newline as a space; this restores that, so paragraphs reflow
          // and only blank lines and list markers start a new line.
          config: (md) => {
            md.set({ breaks: false })
            return md
          },
        },
      },
    })
    
    // OpenAPI will be configured per-page using the <OpenAPI /> component
    openApiTheme.enhanceApp({ app })
  },
} satisfies Theme

