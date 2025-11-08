"use client";

import React from "react";

export default function MobileWarning() {
  return (
    <div className="mobile-warning">
      <div className="mobile-warning__content">
        <div className="mobile-warning__icon">
          🖥️
        </div>
        <h2 className="mobile-warning__title">
          Desktop Required
        </h2>
        <p className="mobile-warning__message">
          The Digital Arabic Maqām Archive is designed for laptop and desktop computers only.
        </p>
        <p>
          Please access this application from a device with a larger screen for the best experience.
        </p>
      </div>
      
      {/* Hidden bot-friendly content - always in DOM but visually hidden */}
      <div className="mobile-warning__bot-content">
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
          <li>Get a specific maqām: <code>GET /api/maqamat/{id}?tuningSystem={system}&amp;startingNote={note}</code></li>
          <li>List all maqāmāt: <code>GET /api/maqamat</code></li>
          <li>Get a specific jins: <code>GET /api/ajnas/{id}?tuningSystem={system}&amp;startingNote={note}</code></li>
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
    </div>
  );
}
