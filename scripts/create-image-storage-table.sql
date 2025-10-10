-- Script SQL para criar a tabela ImageStorage no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar a tabela ImageStorage
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

-- Criar índice para busca rápida por filename
CREATE UNIQUE INDEX IF NOT EXISTS "ImageStorage_filename_key" ON "ImageStorage"("filename");

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS "ImageStorage_uploadedBy_idx" ON "ImageStorage"("uploadedBy");

-- Criar índice para busca por data de criação
CREATE INDEX IF NOT EXISTS "ImageStorage_createdAt_idx" ON "ImageStorage"("createdAt");

-- Comentários para documentação
COMMENT ON TABLE "ImageStorage" IS 'Tabela para armazenar imagens como BLOB no banco de dados';
COMMENT ON COLUMN "ImageStorage"."id" IS 'ID único da imagem';
COMMENT ON COLUMN "ImageStorage"."filename" IS 'Nome do arquivo gerado pelo sistema';
COMMENT ON COLUMN "ImageStorage"."originalName" IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN "ImageStorage"."mimeType" IS 'Tipo MIME da imagem (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN "ImageStorage"."size" IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN "ImageStorage"."data" IS 'Dados binários da imagem';
COMMENT ON COLUMN "ImageStorage"."uploadedBy" IS 'ID do usuário que fez o upload';

-- Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'ImageStorage' 
ORDER BY ordinal_position;