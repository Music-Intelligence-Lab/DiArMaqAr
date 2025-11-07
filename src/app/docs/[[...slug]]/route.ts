import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Force dynamic rendering to ensure files are read at runtime
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    // Get the requested path
    const slug = params.slug || []
    const requestedPath = slug.join('/')
    
    // Special handling for openapi.json - serve directly from source with no-cache
    if (requestedPath === 'openapi.json') {
      const openapiPath = path.join(process.cwd(), 'public', 'docs', 'openapi.json')
      if (!fs.existsSync(openapiPath)) {
        return NextResponse.json(
          { error: 'OpenAPI specification not found' },
          { status: 404 }
        )
      }
      
      const fileContents = fs.readFileSync(openapiPath, 'utf8')
      const stats = fs.statSync(openapiPath)
      
      return new NextResponse(fileContents, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Last-Modified': stats.mtime.toUTCString(),
          'ETag': `"${stats.mtime.getTime()}-${stats.size}"`,
        },
      })
    }
    
    // Build the file path
    let filePath: string
    if (!requestedPath || requestedPath === '') {
      // Root /docs -> serve index.html
      filePath = path.join(process.cwd(), 'public', 'docs', 'index.html')
    } else {
      // Check if it's a directory (needs index.html) or a file
      const potentialDir = path.join(process.cwd(), 'public', 'docs', requestedPath)
      const potentialFile = path.join(process.cwd(), 'public', 'docs', requestedPath + '.html')
      const potentialDirIndex = path.join(process.cwd(), 'public', 'docs', requestedPath, 'index.html')
      
      if (fs.existsSync(potentialDirIndex)) {
        filePath = potentialDirIndex
      } else if (fs.existsSync(potentialFile)) {
        filePath = potentialFile
      } else if (fs.existsSync(potentialDir) && fs.statSync(potentialDir).isDirectory()) {
        // Directory exists, serve its index.html
        filePath = path.join(potentialDir, 'index.html')
      } else {
        // Try as index.html in the directory
        filePath = path.join(process.cwd(), 'public', 'docs', requestedPath, 'index.html')
      }
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8')
    
    // Determine content type
    const ext = path.extname(filePath)
    const contentType = ext === '.html' ? 'text/html' : 
                        ext === '.css' ? 'text/css' :
                        ext === '.js' ? 'application/javascript' :
                        ext === '.json' ? 'application/json' :
                        'text/plain'
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    console.error('Error serving docs:', error)
    return NextResponse.json(
      { error: 'Documentation not found' },
      { status: 404 }
    )
  }
}

