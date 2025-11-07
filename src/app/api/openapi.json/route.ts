import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * API route to serve OpenAPI JSON specification with no-cache headers.
 * This prevents browser caching issues when the specification is updated.
 * 
 * This route is used by VitePress documentation to load the OpenAPI spec
 * and ensures browsers always fetch the latest version.
 */

// Force dynamic rendering to ensure file is read at runtime
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Try multiple possible locations where the file might be in Netlify's environment
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'docs', 'openapi.json'),
      path.join(process.cwd(), '..', 'public', 'docs', 'openapi.json'),
      path.join('/opt/build/repo', 'public', 'docs', 'openapi.json'),
    ]
    
    let foundPath: string | null = null
    for (const openapiPath of possiblePaths) {
      try {
        if (fs.existsSync(openapiPath)) {
          foundPath = openapiPath
          break
        }
      } catch {
        continue
      }
    }
    
    if (!foundPath) {
      console.error(`OpenAPI file not found. Tried paths:`, possiblePaths)
      console.error(`Current working directory: ${process.cwd()}`)
      return NextResponse.json(
        { error: 'OpenAPI specification not found', triedPaths: possiblePaths },
        { status: 404 }
      )
    }
    
    const fileContents = fs.readFileSync(foundPath, 'utf8')
    const stats = fs.statSync(foundPath)
    
    // Get cache-busting query parameter if provided, or use file modification time
    const url = new URL(request.url)
    const version = url.searchParams.get('v') || stats.mtime.getTime().toString()
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': stats.mtime.toUTCString(),
        'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
        // Add version header for cache-busting
        'X-OpenAPI-Version': version,
      },
    })
  } catch (error) {
    console.error('Error serving OpenAPI specification:', error)
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    )
  }
}

