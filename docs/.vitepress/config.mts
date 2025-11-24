import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

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

  // LLM-friendly documentation generation
  vite: {
    plugins: [
      llmstxt({
        // @ts-ignore - vitepress-plugin-llms template property may not be in types
        template: {
          introduction: 'Digital Arabic Maqām Archive (DiArMaqAr) - Open-source platform for Arabic maqām theory providing REST API and TypeScript library. Includes historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches. All data includes comprehensive bibliographic attribution following decolonial computing principles.',
        },
        // Ignore the playground page as it's interactive and not needed for LLM documentation
        // index.md contains all static API documentation for optimal LLM accessibility
        ignoreFiles: ['api/playground.md'],
      })
    ]
  },
  
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
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
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
          collapsed: false,
          items: [
            { text: 'Taṣwīr (Transposition)', link: '/guide/taswir' },
            { text: 'Intiqāl (Modulation)', link: '/guide/intiqal' },
            { text: 'Audio Synthesis', link: '/guide/audio-synthesis' },
            { text: 'MIDI Integration', link: '/guide/midi-integration' },
            { text: 'Data Export', link: '/guide/data-export' },
          ]
        },
        {
          text: 'Research and Methodology',
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
          text: 'API Documentation',
          items: [
            { text: 'Overview', link: '/api/' },
            {
              text: 'Endpoints Reference',
              link: '/api/endpoints-reference',
              items: [
                { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
                { text: 'OpenAPI Specification', link: '/api/endpoints-reference#openapi-specification' },
                { text: 'Authentication', link: '/api/endpoints-reference#authentication' },
                { text: 'Response Format', link: '/api/endpoints-reference#response-format' },
                { text: 'Rate Limiting', link: '/api/endpoints-reference#rate-limiting' },
                { text: 'Common Parameters', link: '/api/endpoints-reference#common-parameters' },
              ]
            },
            { text: 'Interactive Playground', link: '/api/playground' },
            { text: 'Representative Examples', link: '/api/representative-examples' },
          ]
        },
        {
          text: 'Endpoints',
          collapsed: false,
          items: [
            {
              text: 'Maqāmāt',
              link: '#maqamat',
              items: [
                { text: 'List Maqāmāt', link: '#listMaqamat' },
                { text: 'Get Maqām Details', link: '#getMaqam' },
                { text: 'Check Availability', link: '#getMaqamAvailability' },
                { text: 'List Transpositions', link: '#listMaqamTranspositions' },
                { text: 'Compare Across Tuning Systems', link: '#compareMaqam' },
                { text: 'Classification: 12-Pitch-Class Sets', link: '#classifyMaqamat12PitchClassSets' },
                { text: 'Classification: Maqam-Based Sets', link: '#classifyMaqamatByMaqamPitchClassSets' },
              ]
            },
            {
              text: 'Ajnās',
              link: '#ajnas',
              items: [
                { text: 'List Ajnās', link: '#listAjnas' },
                { text: 'Get Jins Details', link: '#getJins' },
                { text: 'Check Availability', link: '#getJinsAvailability' },
                { text: 'List Transpositions', link: '#listJinsTranspositions' },
                { text: 'Compare Across Tuning Systems', link: '#compareJins' },
              ]
            },
            {
              text: 'Tuning Systems',
              link: '#tuning-systems',
              items: [
                { text: 'List Tuning Systems', link: '#listTuningSystems' },
                { text: 'Get Tuning System Details', link: '#getTuningSystemPitchClasses' },
                { text: 'List Maqāmāt in Tuning System', link: '#listTuningSystemMaqamat' },
              ]
            },
            {
              text: 'Modulations',
              link: '#modulations',
              items: [
                { text: 'Find Modulation Routes', link: '#findModulationRoutes' },
              ]
            },
            {
              text: 'Pitch Classes',
              link: '#pitch-classes',
              items: [
                { text: 'List Note Names', link: '#listNoteNames' },
                { text: 'Get Pitch Class by Note Name', link: '#getPitchClassByNoteName' },
                { text: 'Check Note Name Availability', link: '#getNoteNameAvailability' },
                { text: 'Compare Pitch Class Across Systems', link: '#comparePitchClassByNoteName' },
              ]
            },
            {
              text: 'Intervals',
              link: '#intervals',
              items: [
                { text: 'Calculate Intervals by Note Names', link: '#calculateIntervalsByNoteNames' },
                { text: 'Compare Intervals Across Tuning Systems', link: '#compareIntervalsByNoteNames' },
              ]
            },
            {
              text: 'Sources',
              link: '#sources',
              items: [
                { text: 'List Sources', link: '#listSources' },
                { text: 'Get Source Details', link: '#getSource' },
                { text: 'List Tuning Systems by Source', link: '#listTuningSystemsBySource' },
                { text: 'List Maqāmāt by Source', link: '#listMaqamatBySource' },
                { text: 'List Ajnās by Source', link: '#listAjnasBySource' },
              ]
            },
          ]
        },
      ],
        '/api/playground': [
          {
            text: 'API Documentation',
            items: [
              { text: 'Overview', link: '/api/' },
              {
                text: 'Endpoints Reference',
                link: '/api/endpoints-reference',
                items: [
                  { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
                  { text: 'OpenAPI Specification', link: '/api/endpoints-reference#openapi-specification' },
                  { text: 'Authentication', link: '/api/endpoints-reference#authentication' },
                  { text: 'Response Format', link: '/api/endpoints-reference#response-format' },
                  { text: 'Rate Limiting', link: '/api/endpoints-reference#rate-limiting' },
                  { text: 'Common Parameters', link: '/api/endpoints-reference#common-parameters' },
                ]
              },
              { text: 'Interactive Playground', link: '/api/playground' },
              { text: 'Representative Examples', link: '/api/representative-examples' },
            ]
          },
        {
          text: 'Endpoints',
          collapsed: true,
          items: [
            {
              text: 'Maqāmāt',
              link: '#maqamat',
              items: [
                { text: 'List Maqāmāt', link: '#listMaqamat' },
                { text: 'Get Maqām Details', link: '#getMaqam' },
                { text: 'Check Availability', link: '#getMaqamAvailability' },
                { text: 'List Transpositions', link: '#listMaqamTranspositions' },
                { text: 'Compare Across Tuning Systems', link: '#compareMaqam' },
                { text: 'Classification: 12-Pitch-Class Sets', link: '#classifyMaqamat12PitchClassSets' },
                { text: 'Classification: Maqam-Based Sets', link: '#classifyMaqamatByMaqamPitchClassSets' },
              ]
            },
            {
              text: 'Ajnās',
              link: '#ajnas',
              items: [
                { text: 'List Ajnās', link: '#listAjnas' },
                { text: 'Get Jins Details', link: '#getJins' },
                { text: 'Check Availability', link: '#getJinsAvailability' },
                { text: 'List Transpositions', link: '#listJinsTranspositions' },
                { text: 'Compare Across Tuning Systems', link: '#compareJins' },
              ]
            },
            {
              text: 'Tuning Systems',
              link: '#tuning-systems',
              items: [
                { text: 'List Tuning Systems', link: '#listTuningSystems' },
                { text: 'Get Tuning System Details', link: '#getTuningSystemPitchClasses' },
                { text: 'List Maqāmāt in Tuning System', link: '#listTuningSystemMaqamat' },
              ]
            },
            {
              text: 'Modulations',
              link: '#modulations',
              items: [
                { text: 'Find Modulation Routes', link: '#findModulationRoutes' },
              ]
            },
            {
              text: 'Pitch Classes',
              link: '#pitch-classes',
              items: [
                { text: 'List Note Names', link: '#listNoteNames' },
                { text: 'Get Pitch Class by Note Name', link: '#getPitchClassByNoteName' },
                { text: 'Check Note Name Availability', link: '#getNoteNameAvailability' },
                { text: 'Compare Pitch Class Across Systems', link: '#comparePitchClassByNoteName' },
              ]
            },
            {
              text: 'Intervals',
              link: '#intervals',
              items: [
                { text: 'Calculate Intervals by Note Names', link: '#calculateIntervalsByNoteNames' },
                { text: 'Compare Intervals Across Tuning Systems', link: '#compareIntervalsByNoteNames' },
              ]
            },
            {
              text: 'Sources',
              link: '#sources',
              items: [
                { text: 'List Sources', link: '#listSources' },
                { text: 'Get Source Details', link: '#getSource' },
                { text: 'List Tuning Systems by Source', link: '#listTuningSystemsBySource' },
                { text: 'List Maqāmāt by Source', link: '#listMaqamatBySource' },
                { text: 'List Ajnās by Source', link: '#listAjnasBySource' },
              ]
            },
          ]
        },
      ],
      '/library/': [
        {
          text: 'TypeScript Library',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/library/' },
          ]
        },
        {
          text: 'Library Reference',
          collapsed: false,
          items: [
            { text: 'Complete Reference', link: '/library/api/README' },
            { text: 'Modules Index', link: '/library/api/modules' },
          ]
        },
        {
          text: 'Models',
          collapsed: false,
          items: [
            { text: 'Maqam', link: '/library/api/models/Maqam/README' },
            { text: 'Jins', link: '/library/api/models/Jins/README' },
            { text: 'TuningSystem', link: '/library/api/models/TuningSystem/README' },
            { text: 'PitchClass', link: '/library/api/models/PitchClass/README' },
            { text: 'NoteName', link: '/library/api/models/NoteName/README' },
          ]
        },
        {
          text: 'Functions',
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

    // Table of contents (outline) configuration - shows h2 and h3 headings
    outline: {
      level: [2, 3],
      label: 'On this page'
    },

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

