import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Digital Arabic Maqām Archive',
  description: 'Comprehensive documentation for the Digital Arabic Maqām Archive - TypeScript library and REST API',
  
  // Base path for serving from /docs/ in Next.js
  base: '/docs/',
  
  // Build output will go to public/docs so Next.js can serve it
  outDir: '../public/docs',
  
  // Enable clean URLs (without .html extension)
  cleanUrls: true,
  
  // Last updated timestamp
  lastUpdated: true,
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'TypeScript Library', link: '/library/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Theoretical Framework', link: '/guide/theoretical-framework' },
            { text: 'Tuning Systems', link: '/guide/tuning-systems' },
            { text: 'Ajnās', link: '/guide/ajnas' },
            { text: 'Maqāmāt', link: '/guide/maqamat' },
            { text: 'Suyūr', link: '/guide/suyur' },
          ]
        },
        {
          text: 'Advanced Features',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Transposition', link: '/guide/transposition' },
            { text: 'Modulation', link: '/guide/modulation' },
            { text: 'Audio Synthesis', link: '/guide/audio-synthesis' },
            { text: 'MIDI Integration', link: '/guide/midi-integration' },
            { text: 'Data Export', link: '/guide/data-export' },
          ]
        },
        {
          text: 'Research and Methodology',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Research Applications', link: '/guide/research-applications' },
            { text: 'Cultural Framework', link: '/guide/cultural-framework' },
            { text: 'Bibliographic Sources', link: '/guide/bibliographic-sources' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Base URL', link: '/api/#base-url' },
            { text: 'Authentication', link: '/api/#authentication' },
            { text: 'Response Format', link: '/api/#response-format' },
            { text: 'Rate Limiting', link: '/api/#rate-limiting' },
          ]
        },
        {
          text: 'Endpoints',
          collapsible: true,
          collapsed: false,
          items: [
            {
              text: 'Maqāmāt',
              items: [
                { text: 'List Maqāmāt', link: '/api/#listMaqamat' },
                { text: 'Get Maqām Details', link: '/api/#getMaqam' },
                { text: 'Check Availability', link: '/api/#getMaqamAvailability' },
              ]
            },
            {
              text: 'Tuning Systems',
              items: [
                { text: 'List Tuning Systems', link: '/api/#listTuningSystems' },
              ]
            },
            {
              text: 'Availability',
              items: [
                { text: 'Check Availability', link: '/api/#checkAvailability' },
              ]
            },
          ]
        },
      ],
      '/library/': [
        {
          text: 'TypeScript Library',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Overview', link: '/library/' },
          ]
        },
        {
          text: 'Library Reference',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Complete Reference', link: '/library/api/README' },
            { text: 'Modules Index', link: '/library/api/modules' },
          ]
        },
        {
          text: 'Models',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Maqam', link: '/library/api/models/Maqam/README' },
            { text: 'Jins', link: '/library/api/models/Jins/README' },
            { text: 'TuningSystem', link: '/library/api/models/TuningSystem/README' },
            { text: 'PitchClass', link: '/library/api/models/PitchClass/README' },
            { text: 'NoteName', link: '/library/api/models/NoteName/README' },
            { text: 'Pattern', link: '/library/api/models/Pattern/README' },
          ]
        },
        {
          text: 'Functions',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Export', link: '/library/api/functions/export/README' },
            { text: 'Transpose', link: '/library/api/functions/transpose/README' },
            { text: 'Modulate', link: '/library/api/functions/modulate/README' },
            { text: 'Import', link: '/library/api/functions/import/README' },
            { text: 'Classify Maqam Family', link: '/library/api/functions/classifyMaqamFamily/README' },
            { text: 'Get Pitch Class Intervals', link: '/library/api/functions/getPitchClassIntervals/README' },
            { text: 'Get Tuning System Pitch Classes', link: '/library/api/functions/getTuningSystemPitchClasses/README' },
            { text: 'Calculate Cents Deviation', link: '/library/api/functions/calculateCentsDeviation/README' },
            { text: 'Convert Pitch Class', link: '/library/api/functions/convertPitchClass/README' },
            { text: 'SCALA Export', link: '/library/api/functions/scala-export/README' },
          ]
        }
      ],
    },

    // Edit link configuration
    editLink: {
      pattern: 'https://github.com/Music-Intelligence-Lab/DiArMaqAr/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated text customization
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // Table of contents (outline) configuration - disabled to remove right sidebar
    outline: false,

    // Back to top button
    returnToTopLabel: 'Back to top',

    // Previous/Next page navigation
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Music-Intelligence-Lab/DiArMaqAr' }
    ],

    footer: {
      message: 'Digital Arabic Maqām Archive Documentation',
      copyright: 'Copyright © 2025 Music Intelligence Lab'
    },

    search: {
      provider: 'local',
      options: {
        // Search configuration can be customized here
        // See: https://vitepress.dev/reference/default-theme-search
      }
    }
  },

  ignoreDeadLinks: true

})

