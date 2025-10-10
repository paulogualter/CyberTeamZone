import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateFileUpload, generateSecureFilename, scanFileContent, validateImageFile } from '@/lib/file-security'
import { sanitizeInput } from '@/lib/validation'
import { put } from '@/lib/blob'

export async function POST(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions)
    
    // Allow unauthenticated uploads only in development to ease local testing
    if (!session?.user && process.env.NODE_ENV !== 'development') {
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
      return NextResponse.json({ success: false, error: 'No file uploaded. Expected field name: file | image | attachment' }, { status: 400 })
    }

    // Validate file type and size
    const category = file.type.startsWith('image/') ? 'images' : 
                   file.type.startsWith('video/') ? 'videos' : 'documents'
    
    console.log('🔍 File validation:', {
      name: file.name,
      type: file.type,
      size: file.size,
      category
    })
    
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

    // Additional validation for images (simplified for server-side)
    if (category === 'images') {
      console.log('✅ Image validation passed (simplified)')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, session?.user?.id || 'anonymous')

    let fileUrl: string

    if (process.env.VERCEL) {
      // Use Vercel Blob for production
      const blob = await put(secureFilename, buffer, {
        access: 'public',
        contentType: file.type,
      })
      fileUrl = blob.url
    } else {
      // Use local storage for development
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const filepath = join(uploadsDir, secureFilename)
      await writeFile(filepath, buffer)
      fileUrl = `/uploads/${secureFilename}`
    }

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      filename: secureFilename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 })
  }
}