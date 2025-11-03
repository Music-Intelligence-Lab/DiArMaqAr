import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useOpenapi, theme as openApiTheme } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // OpenAPI will be configured per-page using the <OpenAPI /> component
    openApiTheme.enhanceApp({ app })
  },
} satisfies Theme

