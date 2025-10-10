import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Converter para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const secureFilename = `img_${timestamp}_${randomId}.${extension}`

    console.log('💾 Saving to local storage...')

    // Salvar na pasta public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = join(uploadsDir, secureFilename)
    await writeFile(filepath, buffer)

    const fileUrl = `/api/uploads/${secureFilename}`
    
    console.log('✅ Image saved successfully:', secureFilename)

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      url: fileUrl,
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