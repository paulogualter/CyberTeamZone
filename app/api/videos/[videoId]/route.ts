import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    console.log('🎥 Serving video:', videoId)

    // Para vídeos armazenados como base64 data URLs
    if (videoId.startsWith('data:')) {
      // Extrair o tipo MIME e os dados base64
      const [header, base64Data] = videoId.split(',')
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'video/mp4'
      
      if (!base64Data) {
        return NextResponse.json({ error: 'Invalid video data' }, { status: 400 })
      }

      // Converter base64 para buffer
      const buffer = Buffer.from(base64Data, 'base64')

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
          'Accept-Ranges': 'bytes', // Suporte a range requests para streaming
        },
      })
    }

    // Para vídeos com URLs externas (YouTube, Vimeo, etc.)
    if (videoId.startsWith('http')) {
      return NextResponse.redirect(videoId)
    }

    return NextResponse.json({ error: 'Video not found' }, { status: 404 })

  } catch (error) {
    console.error('❌ Error serving video:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to serve video',
      debug: errorMessage
    }, { status: 500 })
  }
}
