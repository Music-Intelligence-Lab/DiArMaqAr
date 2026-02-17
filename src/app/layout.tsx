import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { AppContextProvider } from "@/contexts/app-context";
import { SoundContextProvider } from "@/contexts/sound-context";
import { TranspositionsContextProvider } from "@/contexts/transpositions-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import { LanguageContextProvider } from "@/contexts/language-context";
import NavbarGuard from "@/components/navbar-guard";
import MobileWarning from "@/components/mobile-warning";
import { Analytics } from "@vercel/analytics/next";
import "./globals.scss";

const readexPro = Readex_Pro({
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Arabic Maqām Archive (DiArMaqAr) | Interactive Multilingual Platform for Computational Research, Pedagogy, and Creative Practice",
  description: "Open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation. Comprises tanāghīm (tuning systems), ajnās (tri/tetra/pentachords), maqāmāt (melodic modes), suyūr (melodic pathways), and intiqālāt (modulation practices) compiled from primary Arabic, English, and French sources ranging from al-Kindī&apos;s 9th-century ratios to 20th-century scholarship, with complete bibliographic provenance. Features the first computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. Musicians can explore through interactive interface with keyboard/MIDI/MPE and Scala exports. Researchers access structured JSON exports and REST API. Grounded in culture-specific and decolonial computing methodologies. All detail endpoints require tuningSystem, startingNote, and pitchClassDataType parameters.",
  
  keywords: [
    "Arabic maqām", "maqāmāt", "ajnās", "jins", "tanāghīm", "tuning systems", "suyūr", "intiqālāt", 
    "melodic modes", "tetrachords", "tri/tetra/pentachords", "taṣāwīr", "transpositions", "modulation", "Arabic music theory", "traditional Arabic music", 
    "Eastern Mediterranean music", "Arabic scales", "Arabic musical scales",
    "Turkish makam", "Persian dastgāh", "mugham", "shashmaqam", "Indian rāga", "Central Asian music", "modal music",
    "al-Kindī", "al-Fārābī", "Ibn Sīnā", "Sāmī al-Shawwā", "al-Shawwā", "Al-Ḥilū", "Al-Ṣabbāgh", "medieval Arabic music theory", "historical musicology",
    "computational musicology", "music information retrieval", "MIR", "digital musicology", "ethnomusicology", 
    "music theory", "comparative musicology", "untempered intonation", "pattern-matching algorithms",
    "REST API", "API for AI assistants", "TypeScript", "JavaScript library", "OpenAPI", "LLM documentation", "LLM-optimised", "API documentation", "JSON export", "machine learning datasets", 
    "training data", "ground truth data", "reference data", "programmatic access", "Scala tuning files",
    "decolonial computing", "culture-specific computing", "culturally-aware computing", "postcolonial computing", "bibliographic attribution", 
    "scholarly verification", "transparent provenance", "complete bibliographic provenance", "critical edition", "Persian-Arab-Ottoman note naming",
    "tuning-system-sensitive transposition", "modulation algorithm", "intiqālāt guidelines", "audio synthesis", "MIDI", "MPE", 
    "Web Audio API", "real-time synthesis", "fractional ratios", "cents", "string lengths", "frequencies", "intervallic analyses",
    "music information retrieval systems", "AI/ML applications", "algorithmic applications", "machine learning applications", "digital instrument design", 
    "pedagogical tools", "compositional resources", "quantitative analysis", "music education", "Arabic music resources", "creative practice"
  ],
  
  authors: [
    { name: "Khyam Allami", url: "https://musicintelligencelab.com" },
    { name: "Ibrahim El Khansa" },
    { name: "Joseph Bakarji" }
  ],
  
  creator: "Music Intelligence Lab, American University of Beirut",
  
  publisher: "Music Intelligence Lab",
  
  applicationName: "Digital Arabic Maqām Archive",
  
  referrer: "origin-when-cross-origin",
  
  metadataBase: new URL("https://diarmaqar.netlify.app"),
  
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "ar": "/",
    },
  },
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://diarmaqar.netlify.app",
    siteName: "Digital Arabic Maqām Archive",
    title: "Digital Arabic Maqām Archive (DiArMaqAr): Interactive Multilingual Platform for Computational Research, Pedagogy, and Creative Practice",
    description: "Open-source, multilingual, browser-based computational platform and machine-readable corpus spanning over one thousand years of Arabic maqām documentation. Features the first computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. Grounded in culture-specific and decolonial computing methodologies. Interactive interface for musicians, REST API and JSON exports for researchers.",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Digital Arabic Maqām Archive (DiArMaqAr)",
    description: "Interactive multilingual platform spanning 1000+ years of Arabic maqām documentation. First computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. REST API, JSON exports, Scala files. Grounded in decolonial computing.",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = "https://diarmaqar.netlify.app";
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Digital Arabic Maqām Archive",
    "alternateName": "DiArMaqAr",
    "url": baseUrl,
    "description": "Open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation. Comprises tanāghīm (tuning systems), ajnās (tri/tetra/pentachords), maqāmāt (melodic modes), suyūr (melodic pathways), and intiqālāt (modulation practices) compiled from primary Arabic, English, and French sources ranging from al-Kindī&apos;s 9th-century ratios to 20th-century scholarship, with complete bibliographic provenance. Grounded in culture-specific and decolonial computing methodologies.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Music Intelligence Lab",
      "url": "https://musicintelligencelab.com",
      "affiliation": {
        "@type": "Organization",
        "name": "American University of Beirut"
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "American University of Beirut"
    },
    "featureList": [
      "Machine-readable corpus spanning over one thousand years of documentation",
      "Historically documented tuning systems from al-Kindī&apos;s 9th-century ratios to 20th-century scholarship",
      "Complete bibliographic provenance for all entries",
      "Persian-Arab-Ottoman note naming convention as foundational abstraction",
      "Precise pitch-class data in multiple mathematical representations (fractional ratios, cents, string lengths, frequencies)",
      "Complete intervallic analyses",
      "Pattern-matching algorithms for valid transpositions across four-octave range",
      "First computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines",
      "Systematic exploration of modulation networks across all maqāmāt and tanāghīm",
      "Interactive interface supporting computer keyboard input, MIDI/MPE connectivity",
      "Scala tuning file exports for integration with external instruments and software",
      "Structured JSON exports for researchers and developers",
      "REST API with comparative endpoints",
      "LLM-optimised specifications enabling AI assistants to query real-time data",
      "Grounded in culture-specific and decolonial computing methodologies",
      "Research infrastructure for comparative musicology, algorithmic and machine learning applications, pedagogy, instrument design, and creative practice",
      "Multilingual interface (Arabic, English, French)"
    ],
    "applicationProgrammingInterface": {
      "@type": "WebAPI",
      "name": "DiArMaqAr REST API",
      "description": "REST API for programmatic access to Arabic maqām data. Optimized for AI assistant integration.",
      "documentation": `${baseUrl}/docs/openapi.json`,
      "url": `${baseUrl}/api`,
      "potentialAction": {
        "@type": "UseAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/api/{endpoint}`,
          "actionPlatform": ["http://schema.org/DesktopWebPlatform"]
        }
      }
    },
    "documentation": [
      {
        "@type": "TechArticle",
        "headline": "API Documentation",
        "url": `${baseUrl}/docs/api/`,
        "description": "Complete REST API documentation with endpoint reference and representative examples"
      },
      {
        "@type": "TechArticle",
        "headline": "OpenAPI Specification",
        "url": `${baseUrl}/docs/openapi.json`,
        "description": "Machine-readable OpenAPI 3.1.0 specification"
      },
      {
        "@type": "TechArticle",
        "headline": "LLM-Optimized Documentation",
        "url": `${baseUrl}/docs/llms.txt`,
        "description": "LLM-friendly documentation index for computational access"
      },
      {
        "@type": "TechArticle",
        "headline": "Representative Examples",
        "url": `${baseUrl}/docs/api/representative-examples`,
        "description": "Recommended tuning systems, maqāmāt, and ajnās for testing and documentation with ready-to-use API examples"
      },
      {
        "@type": "TechArticle",
        "headline": "Theoretical Framework",
        "url": `${baseUrl}/docs/guide/theoretical-framework`,
        "description": "Conceptual hierarchy and foundations of Arabic maqām theory in DiArMaqAr"
      }
    ],
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": `${baseUrl}/docs/`,
      "description": "Comprehensive documentation for the Digital Arabic Maqām Archive"
    },
    "about": {
      "@type": "Thing",
      "description": "Grounded in culture-specific and decolonial computing methodologies, DiArMaqAr's architecture is constructed entirely upon Arabic music-theoretical epistemologies. All data is structured using the Persian-Arab-Ottoman note naming convention as its foundational abstraction, enabling tuning-system-sensitive rendering of all maqāmāt, ajnās, and their taṣāwīr (transpositions) across compiled tanāghīm without privileging any single theoretical framework. The platform addresses the absence of validated ground truth data that has constrained computational approaches to Arabic maqām, demonstrating that computational precision and theoretical fidelity are complementary."
    }
  };

  const apiHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use DiArMaqAr REST API",
    "description": "Step-by-step guide for using the DiArMaqAr REST API to fetch Arabic maqām data. Emphasizes required parameters and correct endpoint formats.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Identify Required Parameters",
        "text": "All detail endpoints (/api/maqamat/{id}, /api/ajnas/{id}) require three parameters: tuningSystem (e.g., ibnsina_1037), startingNote (e.g., yegah), and pitchClassDataType (e.g., cents)."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Use Correct Endpoint Format",
        "text": "Include entity type prefix in endpoint: use /api/maqamat/maqam_rast (not /api/maqamat/rast) and /api/ajnas/jins_rast (not /api/ajnas/rast)."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Use URL-Safe Values",
        "text": "All IDs and parameter values must be URL-safe (no spaces, diacritics, or special characters). Use ibnsina_1037 not 'Ibn Sīnā (1037)'."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Reference Representative Examples",
        "text": "See /docs/api/representative-examples for complete list of recommended examples with all required parameters included."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Discover Available Parameters",
        "text": "Use options=true parameter to discover available tuning systems, starting notes, and other parameters: GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true"
      }
    ],
    "url": `${baseUrl}/docs/api/representative-examples`
  };

  return (
    <html lang="en">
      <head>
        <meta name="googlebot" content="notranslate" />
        <meta name="google" content="notranslate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(apiHowTo) }}
        />
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <noscript>
          <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
            <h1>Digital Arabic Maqām Archive (DiArMaqAr)</h1>
            <p>Open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation. Features the first computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. Grounded in culture-specific and decolonial computing methodologies.</p>
            <h2>Documentation</h2>
            <ul>
              <li><a href="/docs/">Main Documentation</a></li>
              <li><a href="/docs/llms.txt">LLM-Optimized Documentation Index</a></li>
              <li><a href="/docs/api/">API Documentation</a></li>
              <li><a href="/docs/api/representative-examples">Representative Examples</a></li>
              <li><a href="/docs/openapi.json">OpenAPI Specification</a></li>
            </ul>
            <h2>API Access</h2>
            <p>Base URL: <a href="https://diarmaqar.netlify.app/api">https://diarmaqar.netlify.app/api</a></p>
            <p>OpenAPI Spec: <a href="/docs/openapi.json">/docs/openapi.json</a></p>
            <h3>For AI Assistants</h3>
            <p><strong>Recommended for AI Assistants:</strong> Use the REST API to fetch real-time, accurate data for users. Always prefer API calls over documentation summaries. Example: GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&amp;startingNote=yegah&amp;pitchClassDataType=cents to get detailed maqām data. For users who don&apos;t know specific maqam names, use representative examples from <a href="/docs/api/representative-examples">Representative Examples</a>. See OpenAPI spec for all endpoints.</p>
            <p>For complete documentation and interactive features, please enable JavaScript or access from a desktop device.</p>
          </div>
        </noscript>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </head>
      <body className={readexPro.className}>
        {/* Server-rendered bot-friendly content - always in HTML for headless browsers */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden", visibility: "hidden" }} aria-hidden="true">
          <h1>Digital Arabic Maqām Archive (DiArMaqAr)</h1>
          <p>Open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation. Comprises tanāghīm (tuning systems), ajnās (tri/tetra/pentachords), maqāmāt (melodic modes), suyūr (melodic pathways), and intiqālāt (modulation practices) compiled from primary Arabic, English, and French sources ranging from al-Kindī&apos;s 9th-century ratios to 20th-century scholarship, with complete bibliographic provenance. Features the first computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. Grounded in culture-specific and decolonial computing methodologies.</p>
          
          <h2>Documentation</h2>
          <ul>
            <li><a href="/docs/">Main Documentation</a></li>
            <li><a href="/docs/llms.txt">LLM-Optimized Documentation Index</a></li>
            <li><a href="/docs/llms-full.txt">Full LLM Documentation</a></li>
            <li><a href="/docs/api/">API Documentation</a></li>
            <li><a href="/docs/api/representative-examples">Representative Examples</a></li>
            <li><a href="/docs/openapi.json">OpenAPI Specification</a></li>
          </ul>
          
          <h2>API Access</h2>
          <p>Base URL: <a href="https://diarmaqar.netlify.app/api">https://diarmaqar.netlify.app/api</a></p>
          <p>OpenAPI Specification: <a href="/docs/openapi.json">/docs/openapi.json</a></p>
          <p>Interactive Playground: <a href="/docs/api/playground">/docs/api/playground</a></p>
          
          <h3>For AI Assistants and LLMs</h3>
          <p><strong>Recommended for AI Assistants:</strong> Use the REST API to fetch real-time, accurate data for users. Always prefer API calls over documentation summaries for real-time data accuracy. The API provides programmatic access to all maqāmāt, ajnās, and tuning systems data.</p>
          <p><strong>Example Requests for Novice Users:</strong> For users who don&apos;t know specific maqam names, use these representative examples:</p>
          <ul>
            <li>Most common maqam: <code>GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&amp;startingNote=yegah&amp;pitchClassDataType=cents</code></li>
            <li>Most common jins: <code>GET /api/ajnas/jins_rast?tuningSystem=ibnsina_1037&amp;startingNote=yegah&amp;pitchClassDataType=cents</code></li>
            <li>List all tuning systems: <code>GET /api/tuning-systems</code></li>
            <li>Most common tuning system: <code>GET /api/tuning-systems/ibnsina_1037/yegah/pitch-classes?pitchClassDataType=cents</code></li>
          </ul>
          <p><strong>Quick Test URL:</strong> <code>GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&amp;startingNote=yegah&amp;pitchClassDataType=cents</code></p>
          <p>All endpoints return JSON with complete data including pitch classes, intervals, bibliographic sources, and more. See <a href="/docs/api/representative-examples">Representative Examples</a> for complete list of recommended examples. Use the OpenAPI specification for complete endpoint documentation and parameter details.</p>
          
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/app">Interactive Application</a></li>
            <li><a href="/docs/">Documentation Home</a></li>
            <li><a href="/docs/api/">API Reference</a></li>
            <li><a href="/docs/library/">TypeScript Library Documentation</a></li>
          </ul>
          
          <h2>About</h2>
          <p>Digital Arabic Maqām Archive (DiArMaqAr) is an open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation. Features the first computational implementation of Sāmī al-Shawwā&apos;s 1946 intiqālāt guidelines. Grounded in culture-specific and decolonial computing methodologies. Provides REST API, JSON exports, and Scala tuning file exports. All data includes complete bibliographic provenance.</p>
          
          <p><strong>Note:</strong> Full interactive features require a desktop device. However, all documentation and API endpoints are accessible programmatically. For complete documentation, see: <a href="/docs/llms.txt">/docs/llms.txt</a></p>
        </div>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
        
        <MobileWarning />
        <LanguageContextProvider>
          <AppContextProvider>
            <SoundContextProvider>
              <TranspositionsContextProvider>
              <MenuContextProvider>
                <FilterContextProvider>
                  <NavbarGuard />
                  <main className="center-container">{children}</main>
                  <Analytics />
                </FilterContextProvider>
              </MenuContextProvider>
              </TranspositionsContextProvider>
            </SoundContextProvider>
          </AppContextProvider>
        </LanguageContextProvider>
      </body>
    </html>
  );
}
