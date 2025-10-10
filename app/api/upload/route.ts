import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateFileUpload, generateSecureFilename, scanFileContent } from '@/lib/file-security'
import { sanitizeInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload API called')
    
    const session = await getServerSession(authOptions)
    
    // Allow unauthenticated uploads only in development to ease local testing
    if (!session?.user && process.env.NODE_ENV !== 'development') {
      console.log('❌ Unauthorized upload attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      size: file.size
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

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, session?.user?.id || 'anonymous')

    let fileUrl: string

    if (process.env.VERCEL) {
      // Em produção, usar Vercel Blob
      console.log('🌐 Production environment detected, using Vercel Blob')
      
      try {
        // Import dinâmico para evitar problemas de build
        const { put } = await import('@vercel/blob')
        
        const blob = await put(secureFilename, buffer, {
          access: 'public',
          contentType: file.type,
          addRandomSuffix: true,
        })
        
        fileUrl = blob.url
        console.log('✅ Vercel Blob upload successful:', blob.url)
      } catch (blobError) {
        console.error('❌ Vercel Blob upload failed:', blobError)
        
        // Fallback: retornar erro específico
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to upload to Vercel Blob. Please check BLOB_READ_WRITE_TOKEN configuration.',
          details: blobError.message
        }, { status: 500 })
      }
    } else {
      // Em desenvolvimento, usar armazenamento local
      console.log('💻 Development environment detected, using local storage')
      
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const filepath = join(uploadsDir, secureFilename)
        await writeFile(filepath, buffer)
        fileUrl = `/uploads/${secureFilename}`
        console.log('✅ Local file upload successful:', fileUrl)
      } catch (localError) {
        console.error('❌ Local file upload failed:', localError)
        throw new Error('Failed to upload locally: ' + localError.message)
      }
    }

    console.log('✅ Upload successful:', {
      fileUrl,
      filename: secureFilename,
      size: file.size,
      type: file.type,
      environment: process.env.VERCEL ? 'production' : 'development'
    })

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      filename: secureFilename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('❌ Error uploading file:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
