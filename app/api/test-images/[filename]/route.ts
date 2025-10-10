import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params
  console.log(`🧪 Test image requested: ${filename}`)

  // Criar uma imagem SVG de teste
  const testSvg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
        Test Image
      </text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="12" fill="#9CA3AF" text-anchor="middle" alignment-baseline="middle">
        ${filename}
      </text>
    </svg>
  `

  const buffer = Buffer.from(testSvg)
  const headers = new Headers()
  headers.set('Content-Type', 'image/svg+xml')
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')

  console.log(`✅ Test image served: ${filename}`)
  return new NextResponse(buffer, { headers })
}
