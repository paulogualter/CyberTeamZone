import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Test video upload endpoint called')
    
    const data = await req.formData()
    const file: File | null = data.get('video') as unknown as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No video file uploaded. Expected field name: video' 
      }, { status: 400 })
    }

    console.log('📁 Video file received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please select a valid video file' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video file is too large. Maximum size: 500MB' 
      }, { status: 400 })
    }

    // Converter arquivo para base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Gerar ID único para o vídeo
    const videoId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    // Salvar no banco de dados
    const { error: insertError } = await supabaseAdmin
      .from('ImageStorage')
      .insert({
        id: videoId,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: buffer,
        uploadedBy: 'test-user', // Para desenvolvimento
        category: 'video'
      })

    if (insertError) {
      console.error('❌ Error saving video to database:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save video to database', 
        debug: insertError.message 
      }, { status: 500 })
    }

    console.log('✅ Video saved successfully:', videoId)

    return NextResponse.json({
      success: true,
      videoId: videoId,
      filename: file.name,
      url: dataUrl, // Retornar data URL para preview imediato
      videoUrl: dataUrl, // Compatibilidade com componente
      size: file.size,
      type: file.type,
      storage: 'database',
      debug: {
        videoId: videoId,
        dataUrlLength: dataUrl.length,
        fileSize: file.size
      }
    })

  } catch (error) {
    console.error('❌ Test video upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        debug: errorMessage 
      },
      { status: 500 }
    )
  }
}
