import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    // Construir o caminho do arquivo
    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    
    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.log('❌ File not found:', filePath)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Ler o arquivo
    const fileBuffer = await readFile(filePath)
    
    // Determinar o tipo de conteúdo baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'mp4':
        contentType = 'video/mp4'
        break
      case 'mp3':
        contentType = 'audio/mpeg'
        break
    }
    
    console.log('✅ Serving file:', filename, 'Content-Type:', contentType)
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('❌ Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
