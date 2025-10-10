import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

// Função para determinar o Content-Type baseado na extensão do arquivo
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
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
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
  console.log(`🖼️ Attempting to serve image: ${filename}`)

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
  }

  try {
    // Tentar servir do diretório local primeiro
    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    console.log(`📁 Trying local path: ${filePath}`)

    try {
      const fileBuffer = await fs.readFile(filePath)
      const contentType = getContentType(filename)

      const headers = new Headers()
      headers.set('Content-Type', contentType)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')

      console.log(`✅ Served local image: ${filename}`)
      return new NextResponse(fileBuffer, { status: 200, headers })
    } catch (localError: any) {
      if (localError.code === 'ENOENT') {
        console.log(`❌ Local file not found: ${filename}`)
      } else {
        console.error(`❌ Error reading local file:`, localError)
      }
    }

    // Se não encontrou localmente, retornar uma imagem placeholder
    console.log(`🔄 Creating placeholder for missing image: ${filename}`)
    
    // Criar um SVG placeholder simples
    const placeholderSvg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="14">
          Image not found
        </text>
        <text x="50%" y="65%" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="10">
          ${filename}
        </text>
      </svg>
    `

    const headers = new Headers()
    headers.set('Content-Type', 'image/svg+xml')
    headers.set('Cache-Control', 'public, max-age=300') // Cache por 5 minutos

    return new NextResponse(placeholderSvg, { status: 200, headers })

  } catch (error) {
    console.error('❌ Error serving image:', error)
    return NextResponse.json({ 
      error: 'Failed to serve image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}