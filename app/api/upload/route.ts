import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called')
    
    const data = await request.formData()
    const file: File | null = data.get('file') as File || data.get('image') as File || data.get('attachment') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 })
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validar se é imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only images are allowed' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum 10MB allowed' 
      }, { status: 400 })
    }

    // Gerar nome único
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const secureFilename = `img_${timestamp}_${randomId}.${extension}`

    console.log('💾 Processing image...')

    // Converter para base64 para armazenar como string
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    console.log('✅ Image processed successfully:', secureFilename)

    return NextResponse.json({ 
      success: true, 
      fileUrl: dataUrl,
      url: dataUrl,
      filename: secureFilename,
      size: file.size,
      type: file.type,
      storage: 'base64'
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
