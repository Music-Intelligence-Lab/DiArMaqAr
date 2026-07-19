import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { locales } from '@/i18n/config'

const baseUrl = 'https://diarmaqar.net'

const localizablePages = ["", "app", "about", "bibliography", "credits", "statistics", "user-guide"] as const;

function localizedEntries(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    localizablePages.map((page) => {
      const path = page ? `/${lang}/${page}` : `/${lang}`;
      return {
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}${page ? `/${l}/${page}` : `/${l}`}`])
          ),
        },
      };
    })
  );
}

/** Enumerate /docs/guide/*.md at build time. Runs during `next build`,
 *  which runs after `docs:build`, so the directory is always present. */
function guidePages(): MetadataRoute.Sitemap {
  const guideDir = path.join(process.cwd(), 'docs', 'guide')
  let entries: string[] = []
  try {
    entries = fs.readdirSync(guideDir)
  } catch {
    return []
  }
  return entries
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => ({
      url: `${baseUrl}/docs/guide/${f.replace(/\.md$/, '')}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const docsPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/llms.txt`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/docs/llms.txt`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/docs/llms-full.txt`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/docs/api`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/docs/openapi.json`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/docs/api/representative-examples`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/docs/api/endpoints-reference`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/docs/api/playground`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  return [...localizedEntries(), ...docsPages, ...guidePages()]
}
