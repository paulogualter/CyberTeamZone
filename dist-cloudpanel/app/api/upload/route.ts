import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateFileUpload, generateSecureFilename, scanFileContent, validateImageFile } from '@/lib/file-security'
import { sanitizeInput } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type and size
    const category = file.type.startsWith('image/') ? 'images' : 
                   file.type.startsWith('video/') ? 'videos' : 'documents'
    
    const validation = validateFileUpload(file, category)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Scan file content for threats
    const scanResult = await scanFileContent(file)
    if (!scanResult.safe) {
      return NextResponse.json({ 
        success: false,
        error: 'Arquivo contém conteúdo suspeito',
        threats: scanResult.threats 
      }, { status: 400 })
    }

    // Additional validation for images
    if (category === 'images') {
      const imageValidation = await validateImageFile(file)
      if (!imageValidation.valid) {
        return NextResponse.json({ success: false, error: imageValidation.error }, { status: 400 })
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name, session.user.id)
    const filepath = join(uploadsDir, secureFilename)

    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/${secureFilename}`

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