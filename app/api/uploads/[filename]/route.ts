import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'tiff': 'image/tiff',
    'avif': 'image/avif',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params
  console.log(`📁 Serving local file: ${filename}`)

  try {
    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    console.log(`📁 Trying local path: ${filePath}`)

    try {
      const fileBuffer = await fs.readFile(filePath)
      const contentType = getContentType(filename)

      const headers = new Headers()
      headers.set('Content-Type', contentType)
      headers.set('Content-Length', fileBuffer.length.toString())
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      
      console.log(`✅ Successfully served local file: ${filename} with Content-Type: ${contentType}`)
      return new NextResponse(fileBuffer, { headers })
    } catch (localError) {
      console.log(`⚠️ Local file not found: ${filename}`)
      
      // Fallback SVG para arquivos não encontrados
      const fallbackSvg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#374151"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
            Image Not Found
          </text>
          <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
            ${filename}
          </text>
        </svg>
      `
      const fallbackBuffer = Buffer.from(fallbackSvg)
      
      const headers = new Headers()
      headers.set('Content-Type', 'image/svg+xml')
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      headers.set('Pragma', 'no-cache')
      headers.set('Expires', '0')
      
      console.log(`⚠️ Serving fallback SVG for: ${filename}`)
      return new NextResponse(fallbackBuffer, { status: 404, headers })
    }
  } catch (error) {
    console.error(`❌ Unexpected error serving file ${filename}:`, error)
    
    const fallbackSvg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
          Server Error
        </text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
          ${filename}
        </text>
      </svg>
    `
    const fallbackBuffer = Buffer.from(fallbackSvg)
    
    const headers = new Headers()
    headers.set('Content-Type', 'image/svg+xml')
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    
    return new NextResponse(fallbackBuffer, { status: 500, headers })
  }
}