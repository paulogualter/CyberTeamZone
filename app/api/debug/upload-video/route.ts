import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Debug video upload endpoint called')
    
    const data = await req.formData()
    const file: File | null = data.get('video') as unknown as File

    console.log('📁 Form data received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      formDataKeys: Array.from(data.keys())
    })

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No video file uploaded. Expected field name: video',
        debug: {
          formDataKeys: Array.from(data.keys()),
          hasFile: false
        }
      }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please select a valid video file',
        debug: {
          fileType: file.type,
          fileName: file.name
        }
      }, { status: 400 })
    }

    // Validar tamanho (máximo 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video file is too large. Maximum size: 500MB',
        debug: {
          fileSize: file.size,
          maxSize: maxSize
        }
      }, { status: 400 })
    }

    // Simular upload bem-sucedido sem salvar no banco
    const videoId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    
    // Criar data URL simples para teste
    const dataUrl = `data:${file.type};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`

    console.log('✅ Debug video upload successful:', videoId)

    return NextResponse.json({
      success: true,
      videoId: videoId,
      filename: file.name,
      url: dataUrl,
      videoUrl: dataUrl,
      size: file.size,
      type: file.type,
      storage: 'debug',
      debug: {
        videoId: videoId,
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name,
        dataUrlLength: dataUrl.length
      }
    })

  } catch (error) {
    console.error('❌ Debug video upload error:', error)
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
