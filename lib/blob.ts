import { put, del, head } from '@vercel/blob'

// Configuração do Vercel Blob
const blobConfig = {
  access: 'public' as const,
  addRandomSuffix: true,
}

export { put, del, head, blobConfig }
