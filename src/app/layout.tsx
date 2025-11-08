import type { Metadata } from "next";
import { AppContextProvider } from "@/contexts/app-context";
import { SoundContextProvider } from "@/contexts/sound-context";
import { TranspositionsContextProvider } from "@/contexts/transpositions-context";
import { FilterContextProvider } from "@/contexts/filter-context";
import { MenuContextProvider } from "@/contexts/menu-context";
import { LanguageContextProvider } from "@/contexts/language-context";
import NavbarGuard from "@/components/navbar-guard";
import MobileWarning from "@/components/mobile-warning";
import { Readex_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.scss";

const readexPro = Readex_Pro({
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-readex-pro",
});

export const metadata: Metadata = {
  title: "Digital Arabic Maqām Archive (DiArMaqAr) | Computational Research Platform",
  description: "Comprehensive bilingual browser-based application and repository integrating historically documented tanāghīm (tuning systems), ajnās (tetrachords), maqāmāt (melodic modes), suyūr (melodic performance pathways), and intiqālāt (modulation practices) within a unified digital framework. Provides rigorously sourced, computationally accessible reference data with transparent provenance for computational musicology, music information retrieval, machine learning applications, and scholarly research.",
  
  keywords: [
    "Arabic maqām", "maqāmāt", "ajnās", "jins", "tanāghīm", "tuning systems", "suyūr", "intiqālāt", 
    "melodic modes", "tetrachords", "modulation", "Arabic music theory", "traditional Arabic music", 
    "Eastern Mediterranean music", "Arabic scales", "Arabic musical scales",
    "Turkish makam", "Persian dastgāh", "mugham", "shashmaqam", "Indian rāga", "Central Asian music", "modal music",
    "al-Kindī", "al-Fārābī", "Ibn Sīnā", "al-Shawwā", "Al-Ḥilū", "Al-Ṣabbāgh", "medieval Arabic music theory", "historical musicology",
    "computational musicology", "music information retrieval", "MIR", "digital musicology", "ethnomusicology", 
    "music theory", "comparative musicology", "untempered intonation",
    "REST API", "TypeScript", "JavaScript library", "OpenAPI", "JSON export", "machine learning datasets", 
    "training data", "ground truth data", "reference data", "programmatic access",
    "decolonial computing", "culturally-aware computing", "postcolonial computing", "bibliographic attribution", 
    "scholarly verification", "transparent provenance", "critical edition", "Arab-Ottoman-Persian note naming",
    "tuning-system-sensitive transposition", "modulation algorithm", "audio synthesis", "MIDI", "MPE", 
    "Web Audio API", "real-time synthesis", "microtonal playback",
    "music information retrieval systems", "AI/ML applications", "digital instrument design", 
    "pedagogical tools", "compositional resources", "quantitative analysis", "music education", "Arabic music resources"
  ],
  
  authors: [
    { name: "Khyam Allami", url: "https://musicintelligencelab.com" },
    { name: "Ibrahim El Khansa" }
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
    title: "Digital Arabic Maqām Archive (DiArMaqAr): Computational Research Platform",
    description: "Bilingual platform integrating historically documented Arabic maqām theory within a unified computational framework. Provides rigorously sourced reference data with transparent provenance for computational musicology, music information retrieval, and scholarly research. Includes data from al-Kindī (874 CE) to contemporary approaches with complete bibliographic attribution.",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Digital Arabic Maqām Archive (DiArMaqAr)",
    description: "Computational research platform for historically documented Arabic maqām theory with REST API, TypeScript library, and comprehensive documentation",
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
    "description": "Comprehensive bilingual browser-based application and repository integrating historically documented tanāghīm (tuning systems), ajnās (tetrachords), maqāmāt (melodic modes), suyūr (melodic performance pathways), and intiqālāt (modulation practices) within a unified digital framework",
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
      "Historically documented tuning systems from al-Kindī (874 CE) to contemporary approaches",
      "First algorithmic implementation of Sāmī al-Shawwā's 1946 modulation guidelines",
      "Tuning-system-sensitive transposition algorithms",
      "REST API for programmatic access",
      "TypeScript/JavaScript library",
      "Comprehensive documentation with bibliographic attribution",
      "OpenAPI specification",
      "Real-time audio synthesis with MPE support",
      "Bilingual Arabic-English interface"
    ],
    "documentation": [
      {
        "@type": "TechArticle",
        "headline": "API Documentation",
        "url": `${baseUrl}/docs/api/`,
        "description": "Complete REST API documentation with endpoint reference and canonical examples"
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
      "description": "The implementation operates entirely within Arabic theoretical frameworks and epistemological systems. All operations are grounded in the historical Arab-Ottoman-Persian note naming convention, with tuning-system-sensitive transposition capabilities that maintain intervallic integrity across all maqāmāt and ajnās."
    }
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
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <noscript>
          <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
            <h1>Digital Arabic Maqām Archive (DiArMaqAr)</h1>
            <p>Comprehensive bilingual browser-based application and repository integrating historically documented Arabic maqām theory within a unified computational framework.</p>
            <h2>Documentation</h2>
            <ul>
              <li><a href="/docs/">Main Documentation</a></li>
              <li><a href="/docs/llms.txt">LLM-Optimized Documentation Index</a></li>
              <li><a href="/docs/openapi.json">OpenAPI Specification</a></li>
              <li><a href="/docs/api/">API Documentation</a></li>
            </ul>
            <h2>API Access</h2>
            <p>Base URL: <a href="https://diarmaqar.netlify.app/api">https://diarmaqar.netlify.app/api</a></p>
            <p>OpenAPI Spec: <a href="/docs/openapi.json">/docs/openapi.json</a></p>
            <h3>For AI Assistants</h3>
            <p><strong>You can use the API to fetch specific data for users.</strong> Example: GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&amp;startingNote=yegah to get detailed maqām data. See OpenAPI spec for all endpoints.</p>
            <p>For complete documentation and interactive features, please enable JavaScript or access from a desktop device.</p>
          </div>
        </noscript>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </head>
      <body className={`${readexPro.variable}`}>
        {/* Server-rendered bot-friendly content - always in HTML for headless browsers */}
        {/* eslint-disable @next/next/no-html-link-for-pages */}
        <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden", visibility: "hidden" }} aria-hidden="true">
          <h1>Digital Arabic Maqām Archive (DiArMaqAr)</h1>
          <p>Comprehensive bilingual browser-based application and repository integrating historically documented Arabic maqām theory within a unified computational framework. Provides rigorously sourced, computationally accessible reference data with transparent provenance for computational musicology, music information retrieval, machine learning applications, and scholarly research.</p>
          
          <h2>Documentation</h2>
          <ul>
            <li><a href="/docs/">Main Documentation</a></li>
            <li><a href="/docs/llms.txt">LLM-Optimized Documentation Index</a></li>
            <li><a href="/docs/llms-full.txt">Full LLM Documentation</a></li>
            <li><a href="/docs/api/">API Documentation</a></li>
            <li><a href="/docs/openapi.json">OpenAPI Specification</a></li>
          </ul>
          
          <h2>API Access</h2>
          <p>Base URL: <a href="https://diarmaqar.netlify.app/api">https://diarmaqar.netlify.app/api</a></p>
          <p>OpenAPI Specification: <a href="/docs/openapi.json">/docs/openapi.json</a></p>
          <p>Interactive Playground: <a href="/docs/api/playground">/docs/api/playground</a></p>
          
          <h3>For AI Assistants and LLMs</h3>
          <p><strong>You can use the API to fetch specific data for users.</strong> The API provides programmatic access to all maqāmāt, ajnās, and tuning systems data. Example API calls:</p>
          <ul>
            <li>Get a specific maqām: <code>GET /api/maqamat/&#123;id&#125;?tuningSystem=&#123;system&#125;&amp;startingNote=&#123;note&#125;</code></li>
            <li>List all maqāmāt: <code>GET /api/maqamat</code></li>
            <li>Get a specific jins: <code>GET /api/ajnas/&#123;id&#125;?tuningSystem=&#123;system&#125;&amp;startingNote=&#123;note&#125;</code></li>
            <li>List all tuning systems: <code>GET /api/tuning-systems</code></li>
          </ul>
          <p>All endpoints return JSON with complete data including pitch classes, intervals, bibliographic sources, and more. Use the OpenAPI specification for complete endpoint documentation and parameter details.</p>
          
          <h2>Quick Links</h2>
          <ul>
            <li><a href="/app">Interactive Application</a></li>
            <li><a href="/docs/">Documentation Home</a></li>
            <li><a href="/docs/api/">API Reference</a></li>
            <li><a href="/docs/library/">TypeScript Library Documentation</a></li>
          </ul>
          
          <h2>About</h2>
          <p>Digital Arabic Maqām Archive (DiArMaqAr) is an open-source platform for Arabic maqām theory providing REST API and TypeScript library. Includes historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches. All data includes comprehensive bibliographic attribution following decolonial computing principles.</p>
          
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
