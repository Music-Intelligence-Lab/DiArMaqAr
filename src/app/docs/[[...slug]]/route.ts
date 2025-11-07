import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Force dynamic rendering to ensure files are read at runtime
export const dynamic = "force-dynamic";

// Helper to get the correct base path for files
function getBasePath(): string {
  // In Netlify serverless functions, files might be in different locations
  // Try multiple possible locations where public/docs/ might exist
  const possiblePaths = [
    process.cwd(), // Standard location
    path.join(process.cwd(), '..'), // Parent directory (common in Netlify)
    path.join(process.cwd(), '..', '..'), // Two levels up
    path.join(process.cwd(), '.next'), // Next.js build output
    path.join(process.cwd(), '.next', 'static'), // Next.js static files
    '/opt/build/repo', // Netlify build directory
    '/var/task', // AWS Lambda default (Netlify uses similar)
  ]
  
  for (const basePath of possiblePaths) {
    try {
      const testPath = path.join(basePath, 'public', 'docs', 'index.html')
      if (fs.existsSync(testPath)) {
        console.log(`Found docs at base path: ${basePath}`)
        return basePath
      }
    } catch (e) {
      // Path doesn't exist, continue
      continue
    }
  }
  
  console.warn(`Could not find public/docs/index.html, using fallback: ${process.cwd()}`)
  // Fallback to process.cwd()
  return process.cwd()
}

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
      const basePath = getBasePath()
      const openapiPath = path.join(basePath, 'public', 'docs', 'openapi.json')
      
      // Also try alternative locations
      const alternativePaths = [
        openapiPath,
        path.join(process.cwd(), 'public', 'docs', 'openapi.json'),
        path.join(process.cwd(), '..', 'public', 'docs', 'openapi.json'),
        path.join('/opt/build/repo', 'public', 'docs', 'openapi.json'),
      ]
      
      let foundPath: string | null = null
      for (const altPath of alternativePaths) {
        try {
          if (fs.existsSync(altPath)) {
            foundPath = altPath
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (!foundPath) {
        console.error(`OpenAPI file not found. Tried paths:`, alternativePaths)
        console.error(`Current working directory: ${process.cwd()}`)
        console.error(`Base path resolved to: ${basePath}`)
        // List directory contents for debugging
        try {
          const publicDocsPath = path.join(basePath, 'public', 'docs')
          if (fs.existsSync(publicDocsPath)) {
            const files = fs.readdirSync(publicDocsPath)
            console.error(`Files in public/docs/:`, files.slice(0, 20))
          }
        } catch (e) {
          console.error(`Could not list public/docs directory:`, e)
        }
        return NextResponse.json(
          { error: 'OpenAPI specification not found', triedPaths: alternativePaths },
          { status: 404 }
        )
      }
      
      const fileContents = fs.readFileSync(foundPath, 'utf8')
      const stats = fs.statSync(foundPath)
      
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
    const basePath = getBasePath()
    let filePath: string
    if (!requestedPath || requestedPath === '') {
      // Root /docs -> serve index.html
      filePath = path.join(basePath, 'public', 'docs', 'index.html')
    } else {
      // Check if it's a directory (needs index.html) or a file
      const potentialDir = path.join(basePath, 'public', 'docs', requestedPath)
      const potentialFile = path.join(basePath, 'public', 'docs', requestedPath + '.html')
      const potentialDirIndex = path.join(basePath, 'public', 'docs', requestedPath, 'index.html')
      
      if (fs.existsSync(potentialDirIndex)) {
        filePath = potentialDirIndex
      } else if (fs.existsSync(potentialFile)) {
        filePath = potentialFile
      } else if (fs.existsSync(potentialDir) && fs.statSync(potentialDir).isDirectory()) {
        // Directory exists, serve its index.html
        filePath = path.join(potentialDir, 'index.html')
      } else {
        // Try as index.html in the directory
        filePath = path.join(basePath, 'public', 'docs', requestedPath, 'index.html')
      }
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      console.error(`Requested path: ${requestedPath}`)
      console.error(`Base path: ${basePath}`)
      return NextResponse.json(
        { error: 'Page not found', path: filePath },
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { 
        error: 'Documentation not found',
        message: errorMessage,
        stack: errorStack,
        cwd: process.cwd()
      },
      { status: 500 }
    )
  }
}

