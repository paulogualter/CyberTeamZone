import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple Upload API called')
    
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

    // Converter para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const secureFilename = `img_${timestamp}_${randomId}.${extension}`

    console.log('💾 Saving to database...')

    // Salvar no banco de dados
    const { data: imageData, error: insertError } = await supabaseAdmin
      .from('ImageStorage')
      .insert({
        filename: secureFilename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: buffer.toString('base64'),
        uploadedBy: null // Permitir uploads anônimos temporariamente
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database error:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save image: ' + insertError.message 
      }, { status: 500 })
    }

    const imageId = imageData.id
    const fileUrl = `/api/images/${imageId}`
    
    console.log('✅ Image saved successfully:', imageId)

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      url: fileUrl,
      imageId,
      filename: secureFilename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}