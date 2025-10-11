import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
      const [header, base64Data] = videoId.split(',')
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'video/mp4'
      
      if (!base64Data) {
        return NextResponse.json({ error: 'Invalid video data' }, { status: 400 })
      }

      const buffer = Buffer.from(base64Data, 'base64')

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
          'Accept-Ranges': 'bytes',
        },
      })
    }

    // Para vídeos com URLs externas (YouTube, Vimeo, etc.)
    if (videoId.startsWith('http')) {
      return NextResponse.redirect(videoId)
    }

    // Buscar vídeo no banco de dados
    const { data: videoData, error: videoError } = await supabaseAdmin
      .from('ImageStorage')
      .select('data, mimeType, size')
      .eq('id', videoId)
      .eq('category', 'video')
      .single()

    if (videoError || !videoData) {
      console.error('❌ Video not found:', videoError)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const buffer = Buffer.from(videoData.data)
    const mimeType = videoData.mimeType || 'video/mp4'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Accept-Ranges': 'bytes',
      },
    })

  } catch (error) {
    console.error('❌ Error serving video:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to serve video',
      debug: errorMessage
    }, { status: 500 })
  }
}