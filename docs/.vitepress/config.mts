import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

const IGNORED_SIDEBAR_PATHS = ['/api/playground']

/** Strip hash fragments and remove links to ignored files so vitepress-plugin-llms can match sidebar links */
function stripSidebarLinkHashes(sidebar: DefaultTheme.Sidebar | undefined): DefaultTheme.Sidebar | undefined {
  if (!sidebar) return sidebar
  const strip = (link: string) => (typeof link === 'string' ? link.replace(/#.*$/, '') : link)
  const isIgnored = (link: string) => IGNORED_SIDEBAR_PATHS.some((p) => strip(link).startsWith(p))
  const mapItem = (item: DefaultTheme.SidebarItem): DefaultTheme.SidebarItem | null => {
    if ('link' in item && item.link) {
      if (isIgnored(item.link)) return null
      return { ...item, link: strip(item.link), items: item.items?.map(mapItem).filter(Boolean) as DefaultTheme.SidebarItem[] | undefined }
    }
    if ('items' in item && item.items) {
      const mapped = item.items.map(mapItem).filter(Boolean) as DefaultTheme.SidebarItem[]
      return mapped.length ? { ...item, items: mapped } : null
    }
    return item
  }
  const filterItems = (items: DefaultTheme.SidebarItem[]) => items.map(mapItem).filter(Boolean) as DefaultTheme.SidebarItem[]
  if (Array.isArray(sidebar)) {
    return filterItems(sidebar) as DefaultTheme.Sidebar
  }
  return Object.fromEntries(
    Object.entries(sidebar).map(([k, v]) => [k, filterItems(v)])
  ) as DefaultTheme.Sidebar
}

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
        // Strip hash fragments so plugin can match sidebar links (e.g. /api/endpoints-reference#maqamat) to files
        sidebar: (configSidebar) => stripSidebarLinkHashes(configSidebar),
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
          text: 'API Getting Started',
          collapsed: false,
          items: [
            { text: 'API Overview', link: '/api/' },
            { text: 'Representative Examples', link: '/api/representative-examples' },
          ]
        },
        {
          text: 'Static Documentation',
          collapsed: false,
          items: [
            {
              text: 'Endpoints Reference',
              link: '/api/endpoints-reference',
              items: [
                { text: 'Quick Reference', link: '/api/endpoints-reference#quick-reference' },
                { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
                { text: 'OpenAPI Specification', link: '/api/endpoints-reference#openapi-specification' },
                { text: 'Authentication', link: '/api/endpoints-reference#authentication' },
                { text: 'Response Format', link: '/api/endpoints-reference#response-format' },
                { text: 'Rate Limiting', link: '/api/endpoints-reference#rate-limiting' },
                { text: 'Common Parameters', link: '/api/endpoints-reference#common-parameters' },
              ]
            },
            {
              text: 'Maqāmāt',
              collapsed: true,
              link: '/api/endpoints-reference#maqamat',
              items: [
                { text: 'List all maqāmāt', link: '/api/endpoints-reference#listMaqamat' },
                { text: 'List maqām families', link: '/api/endpoints-reference#listMaqamFamilies' },
                { text: 'Get detailed maqām data', link: '/api/endpoints-reference#getMaqam' },
                { text: 'Check maqām availability', link: '/api/endpoints-reference#getMaqamAvailability' },
                { text: 'List transpositions for a maqām', link: '/api/endpoints-reference#listMaqamTranspositions' },
                { text: 'Compare maqām data across tuning systems', link: '/api/endpoints-reference#compareMaqam' },
                { text: 'Classify by 12-pitch-class sets', link: '/api/endpoints-reference#classifyMaqamat12PitchClassSets' },
                { text: 'Classify by maqam-based pitch class sets', link: '/api/endpoints-reference#classifyMaqamatByMaqamPitchClassSets' },
              ]
            },
            {
              text: 'Ajnās',
              collapsed: true,
              link: '/api/endpoints-reference#ajnas',
              items: [
                { text: 'List all ajnās', link: '/api/endpoints-reference#listAjnas' },
                { text: 'Get detailed jins data', link: '/api/endpoints-reference#getJins' },
                { text: 'Check jins availability', link: '/api/endpoints-reference#getJinsAvailability' },
                { text: 'List transpositions for a jins', link: '/api/endpoints-reference#listJinsTranspositions' },
                { text: 'Compare jins data across tuning systems', link: '/api/endpoints-reference#compareJins' },
              ]
            },
            {
              text: 'Tuning Systems',
              collapsed: true,
              link: '/api/endpoints-reference#tuning-systems',
              items: [
                { text: 'List all tuning systems', link: '/api/endpoints-reference#listTuningSystems' },
                { text: 'Get tuning system details', link: '/api/endpoints-reference#getTuningSystemPitchClasses' },
                { text: 'List maqāmāt available in a tuning system', link: '/api/endpoints-reference#listTuningSystemMaqamat' },
              ]
            },
            {
              text: 'Pitch Classes',
              collapsed: true,
              link: '/api/endpoints-reference#pitch-classes',
              items: [
                { text: 'List all note names', link: '/api/endpoints-reference#listNoteNames' },
                { text: 'Get pitch class details by note name', link: '/api/endpoints-reference#getPitchClassByNoteName' },
                { text: 'Check note name availability', link: '/api/endpoints-reference#getNoteNameAvailability' },
                { text: 'Compare pitch class across tuning systems', link: '/api/endpoints-reference#comparePitchClassByNoteName' },
              ]
            },
            {
              text: 'Intervals',
              collapsed: true,
              link: '/api/endpoints-reference#intervals',
              items: [
                { text: 'Calculate intervals by note names', link: '/api/endpoints-reference#calculateIntervalsByNoteNames' },
                { text: 'Compare intervals across tuning systems', link: '/api/endpoints-reference#compareIntervalsByNoteNames' },
              ]
            },
            {
              text: 'Sources',
              collapsed: true,
              link: '/api/endpoints-reference#sources',
              items: [
                { text: 'List all bibliographic sources', link: '/api/endpoints-reference#listSources' },
                { text: 'Get a single bibliographic source', link: '/api/endpoints-reference#getSource' },
                { text: 'List tuning systems by source', link: '/api/endpoints-reference#listTuningSystemsBySource' },
                { text: 'List maqamat by source', link: '/api/endpoints-reference#listMaqamatBySource' },
                { text: 'List ajnas by source', link: '/api/endpoints-reference#listAjnasBySource' },
              ]
            },
          ]
        },
        {
          text: 'Interactive Playground',
          collapsed: false,
          items: [
            { text: 'OpenAPI Playground', link: '/api/playground' },
            { text: 'Maqāmāt', link: '/api/playground#maqamat' },
            { text: 'Ajnās', link: '/api/playground#ajnas' },
            { text: 'Tuning Systems', link: '/api/playground#tuning-systems' },
            { text: 'Pitch Classes', link: '/api/playground#pitch-classes' },
            { text: 'Intervals', link: '/api/playground#intervals' },
            { text: 'Sources', link: '/api/playground#sources' },
            { text: 'Modulations', link: '/api/playground#modulations' },
          ]
        },
      ],
        '/api/playground': [
          {
            text: 'API Getting Started',
            collapsed: false,
            items: [
              { text: 'API Overview', link: '/api/' },
              { text: 'Representative Examples', link: '/api/representative-examples' },
            ]
          },
          {
            text: 'Static Documentation',
            collapsed: true,
            items: [
              {
                text: 'Endpoints Reference',
                link: '/api/endpoints-reference',
                items: [
                  { text: 'Quick Reference', link: '/api/endpoints-reference#quick-reference' },
                  { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
                  { text: 'OpenAPI Specification', link: '/api/endpoints-reference#openapi-specification' },
                  { text: 'Authentication', link: '/api/endpoints-reference#authentication' },
                  { text: 'Response Format', link: '/api/endpoints-reference#response-format' },
                  { text: 'Rate Limiting', link: '/api/endpoints-reference#rate-limiting' },
                  { text: 'Common Parameters', link: '/api/endpoints-reference#common-parameters' },
                ]
              },
              {
                text: 'Maqāmāt',
                collapsed: true,
                link: '/api/endpoints-reference#maqamat',
                items: [
                  { text: 'List all maqāmāt', link: '/api/endpoints-reference#listMaqamat' },
                  { text: 'Get detailed maqām data', link: '/api/endpoints-reference#getMaqam' },
                  { text: 'Check maqām availability', link: '/api/endpoints-reference#getMaqamAvailability' },
                  { text: 'List transpositions for a maqām', link: '/api/endpoints-reference#listMaqamTranspositions' },
                  { text: 'Compare maqām data across tuning systems', link: '/api/endpoints-reference#compareMaqam' },
                  { text: 'Classify by 12-pitch-class sets', link: '/api/endpoints-reference#classifyMaqamat12PitchClassSets' },
                  { text: 'Classify by maqam-based pitch class sets', link: '/api/endpoints-reference#classifyMaqamatByMaqamPitchClassSets' },
                ]
              },
              {
                text: 'Ajnās',
                collapsed: true,
                link: '/api/endpoints-reference#ajnas',
                items: [
                  { text: 'List all ajnās', link: '/api/endpoints-reference#listAjnas' },
                  { text: 'Get detailed jins data', link: '/api/endpoints-reference#getJins' },
                  { text: 'Check jins availability', link: '/api/endpoints-reference#getJinsAvailability' },
                  { text: 'List transpositions for a jins', link: '/api/endpoints-reference#listJinsTranspositions' },
                  { text: 'Compare jins data across tuning systems', link: '/api/endpoints-reference#compareJins' },
                ]
              },
              {
                text: 'Tuning Systems',
                collapsed: true,
                link: '/api/endpoints-reference#tuning-systems',
                items: [
                  { text: 'List all tuning systems', link: '/api/endpoints-reference#listTuningSystems' },
                  { text: 'Get tuning system details', link: '/api/endpoints-reference#getTuningSystemPitchClasses' },
                  { text: 'List maqāmāt available in a tuning system', link: '/api/endpoints-reference#listTuningSystemMaqamat' },
                ]
              },
              {
                text: 'Pitch Classes',
                collapsed: true,
                link: '/api/endpoints-reference#pitch-classes',
                items: [
                  { text: 'List all note names', link: '/api/endpoints-reference#listNoteNames' },
                  { text: 'Get pitch class details by note name', link: '/api/endpoints-reference#getPitchClassByNoteName' },
                  { text: 'Check note name availability', link: '/api/endpoints-reference#getNoteNameAvailability' },
                  { text: 'Compare pitch class across tuning systems', link: '/api/endpoints-reference#comparePitchClassByNoteName' },
                ]
              },
              {
                text: 'Intervals',
                collapsed: true,
                link: '/api/endpoints-reference#intervals',
                items: [
                  { text: 'Calculate intervals by note names', link: '/api/endpoints-reference#calculateIntervalsByNoteNames' },
                  { text: 'Compare intervals across tuning systems', link: '/api/endpoints-reference#compareIntervalsByNoteNames' },
                ]
              },
              {
                text: 'Sources',
                collapsed: true,
                link: '/api/endpoints-reference#sources',
                items: [
                  { text: 'List all bibliographic sources', link: '/api/endpoints-reference#listSources' },
                  { text: 'Get a single bibliographic source', link: '/api/endpoints-reference#getSource' },
                  { text: 'List tuning systems by source', link: '/api/endpoints-reference#listTuningSystemsBySource' },
                  { text: 'List maqamat by source', link: '/api/endpoints-reference#listMaqamatBySource' },
                  { text: 'List ajnas by source', link: '/api/endpoints-reference#listAjnasBySource' },
                ]
              },
            ]
          },
          {
            text: 'Interactive Playground',
            collapsed: false,
            items: [
              { text: 'OpenAPI Playground', link: '/api/playground' },
              { text: 'Maqāmāt', link: '/api/playground#maqamat' },
              { text: 'Ajnās', link: '/api/playground#ajnas' },
              { text: 'Tuning Systems', link: '/api/playground#tuning-systems' },
              { text: 'Pitch Classes', link: '/api/playground#pitch-classes' },
              { text: 'Intervals', link: '/api/playground#intervals' },
              { text: 'Sources', link: '/api/playground#sources' },
              { text: 'Modulations', link: '/api/playground#modulations' },
            ]
          },
        ],
        '/api/endpoints-reference': [
          {
            text: 'API Getting Started',
            collapsed: false,
            items: [
              { text: 'API Overview', link: '/api/' },
              { text: 'Representative Examples', link: '/api/representative-examples' },
            ]
          },
          {
            text: 'Static Documentation',
            collapsed: false,
            items: [
              {
                text: 'Endpoints Reference',
                link: '/api/endpoints-reference',
                items: [
                  { text: 'Quick Reference', link: '/api/endpoints-reference#quick-reference' },
                  { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
                  { text: 'OpenAPI Specification', link: '/api/endpoints-reference#openapi-specification' },
                  { text: 'Authentication', link: '/api/endpoints-reference#authentication' },
                  { text: 'Response Format', link: '/api/endpoints-reference#response-format' },
                  { text: 'Rate Limiting', link: '/api/endpoints-reference#rate-limiting' },
                  { text: 'Common Parameters', link: '/api/endpoints-reference#common-parameters' },
                ]
              },
              {
                text: 'Maqāmāt',
                collapsed: true,
                link: '/api/endpoints-reference#maqamat',
                items: [
                  { text: 'List all maqāmāt', link: '/api/endpoints-reference#listMaqamat' },
                  { text: 'Get detailed maqām data', link: '/api/endpoints-reference#getMaqam' },
                  { text: 'Check maqām availability', link: '/api/endpoints-reference#getMaqamAvailability' },
                  { text: 'List transpositions for a maqām', link: '/api/endpoints-reference#listMaqamTranspositions' },
                  { text: 'Compare maqām data across tuning systems', link: '/api/endpoints-reference#compareMaqam' },
                  { text: 'Classify by 12-pitch-class sets', link: '/api/endpoints-reference#classifyMaqamat12PitchClassSets' },
                  { text: 'Classify by maqam-based pitch class sets', link: '/api/endpoints-reference#classifyMaqamatByMaqamPitchClassSets' },
                ]
              },
              {
                text: 'Ajnās',
                collapsed: true,
                link: '/api/endpoints-reference#ajnas',
                items: [
                  { text: 'List all ajnās', link: '/api/endpoints-reference#listAjnas' },
                  { text: 'Get detailed jins data', link: '/api/endpoints-reference#getJins' },
                  { text: 'Check jins availability', link: '/api/endpoints-reference#getJinsAvailability' },
                  { text: 'List transpositions for a jins', link: '/api/endpoints-reference#listJinsTranspositions' },
                  { text: 'Compare jins data across tuning systems', link: '/api/endpoints-reference#compareJins' },
                ]
              },
              {
                text: 'Tuning Systems',
                collapsed: true,
                link: '/api/endpoints-reference#tuning-systems',
                items: [
                  { text: 'List all tuning systems', link: '/api/endpoints-reference#listTuningSystems' },
                  { text: 'Get tuning system details', link: '/api/endpoints-reference#getTuningSystemPitchClasses' },
                  { text: 'List maqāmāt available in a tuning system', link: '/api/endpoints-reference#listTuningSystemMaqamat' },
                ]
              },
              {
                text: 'Pitch Classes',
                collapsed: true,
                link: '/api/endpoints-reference#pitch-classes',
                items: [
                  { text: 'List all note names', link: '/api/endpoints-reference#listNoteNames' },
                  { text: 'Get pitch class details by note name', link: '/api/endpoints-reference#getPitchClassByNoteName' },
                  { text: 'Check note name availability', link: '/api/endpoints-reference#getNoteNameAvailability' },
                  { text: 'Compare pitch class across tuning systems', link: '/api/endpoints-reference#comparePitchClassByNoteName' },
                ]
              },
              {
                text: 'Intervals',
                collapsed: true,
                link: '/api/endpoints-reference#intervals',
                items: [
                  { text: 'Calculate intervals by note names', link: '/api/endpoints-reference#calculateIntervalsByNoteNames' },
                  { text: 'Compare intervals across tuning systems', link: '/api/endpoints-reference#compareIntervalsByNoteNames' },
                ]
              },
              {
                text: 'Sources',
                collapsed: true,
                link: '/api/endpoints-reference#sources',
                items: [
                  { text: 'List all bibliographic sources', link: '/api/endpoints-reference#listSources' },
                  { text: 'Get a single bibliographic source', link: '/api/endpoints-reference#getSource' },
                  { text: 'List tuning systems by source', link: '/api/endpoints-reference#listTuningSystemsBySource' },
                  { text: 'List maqamat by source', link: '/api/endpoints-reference#listMaqamatBySource' },
                  { text: 'List ajnas by source', link: '/api/endpoints-reference#listAjnasBySource' },
                ]
              },
            ]
          },
          {
            text: 'Interactive Playground',
            collapsed: true,
            items: [
              { text: 'OpenAPI Playground', link: '/api/playground' },
              { text: 'Maqāmāt', link: '/api/playground#maqamat' },
              { text: 'Ajnās', link: '/api/playground#ajnas' },
              { text: 'Tuning Systems', link: '/api/playground#tuning-systems' },
              { text: 'Pitch Classes', link: '/api/playground#pitch-classes' },
              { text: 'Intervals', link: '/api/playground#intervals' },
              { text: 'Sources', link: '/api/playground#sources' },
              { text: 'Modulations', link: '/api/playground#modulations' },
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

