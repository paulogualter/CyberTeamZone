import { NextRequest } from 'next/server'
import { fileUploadSchema } from './validation'

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES: Record<'images' | 'videos' | 'documents', readonly string[]> = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/x-png', 'image/heic', 'image/heif', 'image/avif'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: [
    'application/pdf',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  images: 5 * 1024 * 1024, // 5MB
  videos: 100 * 1024 * 1024, // 100MB
  documents: 50 * 1024 * 1024 // 50MB (PDFs, DOCX, PPTX, etc.)
} as const

// Dangerous file extensions to block
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1'
]

// Validate file upload
export function validateFileUpload(file: File, category: keyof typeof ALLOWED_FILE_TYPES): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > MAX_FILE_SIZES[category]) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZES[category] / (1024 * 1024)}MB`
    }
  }

  // Check MIME type or fallback to extension for images
  const allowed = ALLOWED_FILE_TYPES[category] as readonly string[]
  const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.avif']
  const mimeOk = allowed.includes(file.type)
  const extOk = category === 'images' && imageExtensions.includes(extension)
  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowed.join(', ')} ou extensões ${imageExtensions.join(', ')}`
    }
  }

  // Check file extension against dangerous list
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Extensão de arquivo perigosa não permitida'
    }
  }

  // Do not block by original filename; we sanitize on save

  return { valid: true }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 255) // Limit length
}

// Generate secure filename
export function generateSecureFilename(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  const sanitizedName = sanitizeFilename(originalName.split('.')[0])
  
  return `${userId}_${timestamp}_${random}_${sanitizedName}.${extension}`
}

// Check file content for malicious patterns
export async function scanFileContent(file: File): Promise<{
  safe: boolean
  threats?: string[]
}> {
  const threats: string[] = []
  
  try {
    // Read file content as text for scanning
    const content = await file.text()
    
    // Check for script tags
    if (/<script[^>]*>.*?<\/script>/gi.test(content)) {
      threats.push('Script tags detected')
    }
    
    // Check for javascript: protocol
    if (/javascript:/gi.test(content)) {
      threats.push('JavaScript protocol detected')
    }
    
    // Check for event handlers
    if (/on\w+\s*=/gi.test(content)) {
      threats.push('Event handlers detected')
    }
    
    // Check for SQL injection patterns
    if (/(union|select|insert|update|delete|drop|create|alter)\s+.*(from|into|table|database)/gi.test(content)) {
      threats.push('SQL injection patterns detected')
    }
    
    // Check for PHP tags
    if (/<\?php|<\?=/gi.test(content)) {
      threats.push('PHP tags detected')
    }
    
    // Check for executable patterns
    if (/#!/gi.test(content)) {
      threats.push('Executable patterns detected')
    }
    
    return {
      safe: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined
    }
  } catch (error) {
    return {
      safe: false,
      threats: ['Error scanning file content']
    }
  }
}

// Validate image file
export async function validateImageFile(file: File): Promise<{
  valid: boolean
  error?: string
  dimensions?: { width: number; height: number }
}> {
  const validation = validateFileUpload(file, 'images')
  if (!validation.valid) {
    return validation
  }

  try {
    // For server-side validation, we'll skip detailed image dimension checking
    // since Image() constructor is not available in Node.js
    // Basic validation is already done in validateFileUpload
    
    // Check file extension as additional validation
    const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.avif']
    
    if (!imageExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Extensão de arquivo não permitida para imagens'
      }
    }

    return {
      valid: true,
      dimensions: { width: 0, height: 0 } // We can't get dimensions server-side easily
    }
  } catch (error) {
    console.error('Error validating image file:', error)
    return {
      valid: false,
      error: 'Erro ao validar imagem'
    }
  }
}

// Get file category from MIME type
export function getFileCategory(mimeType: string): keyof typeof ALLOWED_FILE_TYPES | null {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimeType)) {
      return category as keyof typeof ALLOWED_FILE_TYPES
    }
  }
  return null
}
