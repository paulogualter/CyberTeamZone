import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const imageId = params.imageId
    
    console.log('🖼️ Serving image from database:', imageId)
    
    // Buscar a imagem no banco de dados
    const { data: imageData, error } = await supabaseAdmin
      .from('ImageStorage')
      .select('*')
      .eq('id', imageId)
      .single()

    if (error) {
      console.error('❌ Error fetching image from database:', error)
      return new NextResponse('Image not found', { status: 404 })
    }

    if (!imageData) {
      console.log('❌ Image not found in database:', imageId)
      return new NextResponse('Image not found', { status: 404 })
    }

    // Converter base64 de volta para buffer
    const imageBuffer = Buffer.from(imageData.data, 'base64')
    
    console.log('✅ Image served from database:', {
      id: imageData.id,
      filename: imageData.filename,
      mimeType: imageData.mimeType,
      size: imageData.size,
      bufferSize: imageBuffer.length
    })

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': imageData.mimeType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${imageData.originalName}"`,
      },
    })
  } catch (error) {
    console.error('❌ Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE endpoint para remover imagens
export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const imageId = params.imageId
    
    console.log('🗑️ Deleting image from database:', imageId)
    
    // Deletar a imagem do banco de dados
    const { error } = await supabaseAdmin
      .from('ImageStorage')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('❌ Error deleting image from database:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete image' 
      }, { status: 500 })
    }

    console.log('✅ Image deleted from database:', imageId)

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    })
  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
