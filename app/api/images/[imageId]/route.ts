import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import mime from 'mime-types'

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  const { imageId } = params
  console.log(`🖼️ Attempting to serve image from database: ${imageId}`)

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
  }

  try {
    // Buscar a imagem no banco de dados
    const { data: imageData, error } = await supabaseAdmin
      .from('ImageStorage')
      .select('data, mimeType, filename, originalName, size')
      .eq('id', imageId)
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Image not found in database' }, { status: 404 })
    }

    if (!imageData) {
      console.log(`❌ Image not found for ID: ${imageId}`)
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Converter dados base64 para buffer
    const buffer = Buffer.from(imageData.data, 'base64')
    const contentType = imageData.mimeType || mime.lookup(imageData.filename) || 'application/octet-stream'

    // Configurar headers
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=31536000, immutable') // Cache por 1 ano
    headers.set('Last-Modified', new Date().toUTCString())
    headers.set('ETag', `"${imageId}"`)

    console.log(`✅ Serving image from database: ${imageId} (${buffer.length} bytes, ${contentType})`)

    return new NextResponse(buffer, { 
      status: 200, 
      headers 
    })

  } catch (error) {
    console.error('❌ Error serving image from database:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve image from database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Método DELETE para remover imagens (opcional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  const { imageId } = params
  console.log(`🗑️ Attempting to delete image: ${imageId}`)

  if (!imageId) {
    return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('ImageStorage')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    console.log(`✅ Image deleted: ${imageId}`)
    return NextResponse.json({ success: true, message: 'Image deleted successfully' })

  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return NextResponse.json({ 
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}