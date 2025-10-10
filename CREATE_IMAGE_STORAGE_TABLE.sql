-- ===============================================
-- SCRIPT SQL PARA CRIAR TABELA ImageStorage
-- ===============================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- Link: https://supabase.com/dashboard/project/[SEU_PROJECT]/sql

-- 1. Criar a tabela ImageStorage
CREATE TABLE IF NOT EXISTS "ImageStorage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "filename" TEXT UNIQUE NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "uploadedBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE UNIQUE INDEX IF NOT EXISTS "ImageStorage_filename_key" ON "ImageStorage"("filename");
CREATE INDEX IF NOT EXISTS "ImageStorage_uploadedBy_idx" ON "ImageStorage"("uploadedBy");
CREATE INDEX IF NOT EXISTS "ImageStorage_createdAt_idx" ON "ImageStorage"("createdAt");

-- 3. Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ImageStorage' 
ORDER BY ordinal_position;

-- 4. Testar inserção (opcional)
-- INSERT INTO "ImageStorage" (filename, originalName, mimeType, size, data) 
-- VALUES ('test.jpg', 'test.jpg', 'image/jpeg', 1000, 'dGVzdA==');

-- 5. Verificar se a inserção funcionou
-- SELECT * FROM "ImageStorage" WHERE filename = 'test.jpg';

-- ===============================================
-- INSTRUÇÕES:
-- ===============================================
-- 1. Copie todo este script
-- 2. Vá para: https://supabase.com/dashboard
-- 3. Selecione seu projeto
-- 4. Vá para: SQL Editor
-- 5. Cole o script e clique em "Run"
-- 6. Verifique se não há erros
-- ===============================================
