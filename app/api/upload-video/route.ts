import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🎥 Video upload API called')
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Please log in to upload videos' 
      }, { status: 401 })
    }

    // Verificar se é admin ou instrutor
    const userRole = (session.user as any)?.role
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Only admins and instructors can upload videos' 
      }, { status: 403 })
    }

    const data = await request.formData()
    const file: File | null = data.get('video') as File || data.get('file') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No video file uploaded. Expected field name: video or file' 
      }, { status: 400 })
    }

    console.log('🎥 Video file received:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Validar se é vídeo
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only video files are allowed' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 500MB para vídeos)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video file too large. Maximum 500MB allowed' 
      }, { status: 400 })
    }

    // Validar tipos de vídeo permitidos
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: `Video type not supported. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Gerar nome único e seguro
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const secureFilename = `video_${timestamp}_${randomId}.${extension}`

    console.log('💾 Processing video...')

    // Converter para base64 para armazenar como string
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    console.log('✅ Video processed successfully:', secureFilename)

    return NextResponse.json({ 
      success: true, 
      videoUrl: dataUrl,
      url: dataUrl,
      filename: secureFilename,
      size: file.size,
      type: file.type,
      duration: null, // Será calculado no frontend se necessário
      storage: 'base64',
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Video upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload video',
      debug: errorMessage
    }, { status: 500 })
  }
}
