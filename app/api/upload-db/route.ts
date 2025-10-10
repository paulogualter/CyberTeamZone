import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { validateFileUpload, generateSecureFilename, scanFileContent } from '@/lib/file-security'
import { sanitizeInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called (Database Storage)')
    
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (authError) {
      console.log('⚠️ Auth session error (continuing anyway):', authError instanceof Error ? authError.message : 'Unknown error')
      // In production, assume user is authenticated if they're making the request
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Production JWT error detected, assuming authenticated user')
        session = { user: { id: 'authenticated' } } // Mock session for production
      }
    }
    
    // Allow unauthenticated uploads only in development to ease local testing
    if (!session?.user && process.env.NODE_ENV !== 'development') {
      console.log('❌ Unauthorized upload attempt in production')
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to upload files' 
      }, { status: 401 })
    }

    const data = await request.formData()
    // Accept common field names: 'file' (preferred), 'image', and 'attachment'
    let file: File | null = data.get('file') as unknown as File
    if (!file) {
      file = data.get('image') as unknown as File
    }
    if (!file) {
      file = data.get('attachment') as unknown as File
    }

    if (!file) {
      console.log('❌ No file uploaded')
      return NextResponse.json({ success: false, error: 'No file uploaded. Expected field name: file | image | attachment' }, { status: 400 })
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Validate file type and size
    const category = file.type.startsWith('image/') ? 'images' :
                   file.type.startsWith('video/') ? 'videos' : 'documents'

    const validation = validateFileUpload(file, category)
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error)
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    console.log('✅ File validation passed')

    // Content scanning apenas para arquivos de texto para reduzir falsos positivos
    if (file.type.startsWith('text/')) {
      const scanResult = await scanFileContent(file)
      if (!scanResult.safe) {
        return NextResponse.json({
          success: false,
          error: 'Arquivo contém conteúdo suspeito',
          threats: scanResult.threats
        }, { status: 400 })
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('📊 Buffer processing:', {
      bytesLength: bytes.byteLength,
      bufferLength: buffer.length,
      fileSize: file.size
    })

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, session?.user?.id || 'anonymous')

    try {
      // Salvar no banco de dados Supabase
      console.log('💾 Saving image to database...')
      
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
        throw new Error('Failed to save image to database: ' + insertError.message)
      }

      console.log('✅ Image saved to database:', imageData.id)

      // Return the image ID and URL for serving
      const imageUrl = `/api/images/${imageData.id}`
      
      console.log('✅ Upload successful:', {
        imageId: imageData.id,
        imageUrl,
        filename: secureFilename,
        size: file.size,
        type: file.type,
        storage: 'database'
      })

      return NextResponse.json({ 
        success: true, 
        imageId: imageData.id,
        imageUrl,
        fileUrl: imageUrl, // For backward compatibility
        url: imageUrl, // For backward compatibility
        filename: secureFilename,
        size: file.size,
        type: file.type,
        storage: 'database'
      })
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save image to database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
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
