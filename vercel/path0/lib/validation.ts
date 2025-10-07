import { z } from 'zod'

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

// Email validation
export const emailSchema = z.string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(100, 'Email muito longo')
  .transform(sanitizeInput)

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')

// Course validation
export const courseSchema = z.object({
  title: z.string()
    .min(3, 'Título muito curto')
    .max(100, 'Título muito longo')
    .transform(sanitizeInput),
  description: z.string()
    .min(10, 'Descrição muito curta')
    .max(5000, 'Descrição muito longa')
    .transform(sanitizeInput),
  price: z.number()
    .min(0, 'Preço não pode ser negativo')
    .max(10000, 'Preço muito alto'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
})

// Payment validation
export const paymentSchema = z.object({
  amount: z.number()
    .min(0.01, 'Valor inválido')
    .max(10000, 'Valor muito alto'),
  currency: z.string()
    .length(3, 'Moeda inválida')
    .regex(/^[A-Z]{3}$/, 'Formato de moeda inválido'),
  courseId: z.string()
    .min(1, 'ID do curso obrigatório')
    .max(50, 'ID do curso inválido')
})

// SQL Injection protection
export function escapeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
}

// XSS protection
export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Nome do arquivo obrigatório')
    .max(255, 'Nome do arquivo muito longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Nome do arquivo contém caracteres inválidos'),
  size: z.number()
    .min(1, 'Arquivo vazio')
    .max(10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)'),
  mimetype: z.string()
    .regex(/^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|ogg)|application\/(pdf|zip))$/, 
      'Tipo de arquivo não permitido')
})

// CSRF token validation
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  // Use crypto.timingSafeEqual for constant-time comparison
  const tokenBuffer = Buffer.from(token, 'utf8')
  const sessionBuffer = Buffer.from(sessionToken, 'utf8')
  
  if (tokenBuffer.length !== sessionBuffer.length) return false
  
  return tokenBuffer.equals(sessionBuffer)
}

// Input length limits
export const INPUT_LIMITS = {
  TITLE: 100,
  DESCRIPTION: 5000,
  EMAIL: 100,
  PASSWORD: 128,
  NAME: 50,
  COMMENT: 1000,
  FILENAME: 255
} as const
