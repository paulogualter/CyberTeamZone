import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateFileUpload, generateSecureFilename } from '@/lib/file-security'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called - Database only mode')
    
    // Verificar autenticação
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (authError) {
      console.log('⚠️ Auth session error:', authError instanceof Error ? authError.message : 'Unknown error')
      // Em produção, assumir usuário autenticado se estiver fazendo a requisição
      if (process.env.NODE_ENV === 'production') {
        session = { user: { id: 'authenticated' } }
      }
    }
    
    // Permitir uploads não autenticados apenas em desenvolvimento
    if (!session?.user && process.env.NODE_ENV !== 'development') {
      console.log('❌ Unauthorized upload attempt in production')
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to upload files' 
      }, { status: 401 })
    }

    const data = await request.formData()
    let file: File | null = data.get('file') as unknown as File
    if (!file) {
      file = data.get('image') as unknown as File
    }
    if (!file) {
      file = data.get('attachment') as unknown as File
    }

    if (!file) {
      console.log('❌ No file uploaded')
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded. Expected field name: file | image | attachment' 
      }, { status: 400 })
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validar arquivo
    const category = file.type.startsWith('image/') ? 'images' :
                   file.type.startsWith('video/') ? 'videos' : 'documents'

    const validation = validateFileUpload(file, category)
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error)
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 })
    }

    console.log('✅ File validation passed')

    // Converter para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('📊 Buffer processing:', {
      bytesLength: bytes.byteLength,
      bufferLength: buffer.length,
      fileSize: file.size
    })

    // Gerar nome seguro
    const secureFilename = generateSecureFilename(file.name, session?.user?.id || 'anonymous')

    // SALVAR APENAS NO BANCO DE DADOS
    console.log('💾 Saving image to database...')
    
    try {
      const { data: imageData, error: insertError } = await supabaseAdmin
        .from('ImageStorage')
        .insert({
          filename: secureFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          data: buffer.toString('base64'), // Convert to base64 for storage
          uploadedBy: session?.user?.id || null
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Database insert error:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to save image to database: ' + insertError.message 
        }, { status: 500 })
      }

      const imageId = imageData.id
      const fileUrl = `/api/images/${imageData.id}`
      
      console.log('✅ Image saved to database successfully:', imageId)

      return NextResponse.json({ 
        success: true, 
        fileUrl,
        url: fileUrl, // For backward compatibility
        imageId, // ID da imagem no banco de dados
        filename: secureFilename,
        size: file.size,
        type: file.type,
        storage: 'database'
      })

    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database upload failed: ' + (dbError instanceof Error ? dbError.message : 'Unknown error')
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}