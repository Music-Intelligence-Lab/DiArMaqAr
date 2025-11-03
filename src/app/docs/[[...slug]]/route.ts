import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    // Get the requested path
    const slug = params.slug || []
    const requestedPath = slug.join('/')
    
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

