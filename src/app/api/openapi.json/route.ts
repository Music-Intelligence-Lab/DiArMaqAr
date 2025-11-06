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
export async function GET(request: Request) {
  try {
    const openapiPath = path.join(process.cwd(), 'public', 'docs', 'openapi.json')
    
    if (!fs.existsSync(openapiPath)) {
      return NextResponse.json(
        { error: 'OpenAPI specification not found' },
        { status: 404 }
      )
    }
    
    const fileContents = fs.readFileSync(openapiPath, 'utf8')
    const stats = fs.statSync(openapiPath)
    
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

