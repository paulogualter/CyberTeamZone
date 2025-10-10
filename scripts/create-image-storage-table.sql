-- Script SQL para criar a tabela ImageStorage no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela ImageStorage
CREATE TABLE IF NOT EXISTS "ImageStorage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "filename" TEXT UNIQUE NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL, -- Armazenamento binário
  "uploadedBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS "ImageStorage_filename_idx" ON "ImageStorage"("filename");
CREATE INDEX IF NOT EXISTS "ImageStorage_uploadedBy_idx" ON "ImageStorage"("uploadedBy");
CREATE INDEX IF NOT EXISTS "ImageStorage_createdAt_idx" ON "ImageStorage"("createdAt");

-- Adicionar foreign key para User (se a tabela User existir)
-- ALTER TABLE "ImageStorage" 
-- ADD CONSTRAINT "ImageStorage_uploadedBy_fkey" 
-- FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL;

-- Comentários da tabela
COMMENT ON TABLE "ImageStorage" IS 'Armazenamento de imagens como BLOB no banco de dados';
COMMENT ON COLUMN "ImageStorage"."id" IS 'ID único da imagem';
COMMENT ON COLUMN "ImageStorage"."filename" IS 'Nome do arquivo gerado pelo sistema';
COMMENT ON COLUMN "ImageStorage"."originalName" IS 'Nome original do arquivo enviado';
COMMENT ON COLUMN "ImageStorage"."mimeType" IS 'Tipo MIME da imagem (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN "ImageStorage"."size" IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN "ImageStorage"."data" IS 'Dados binários da imagem';
COMMENT ON COLUMN "ImageStorage"."uploadedBy" IS 'ID do usuário que fez upload (opcional)';

-- Trigger para atualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_image_storage_updated_at 
    BEFORE UPDATE ON "ImageStorage" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Política RLS (Row Level Security) - opcional
-- ALTER TABLE "ImageStorage" ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública das imagens
-- CREATE POLICY "Images are publicly readable" ON "ImageStorage"
--     FOR SELECT USING (true);

-- Política para permitir upload apenas para usuários autenticados
-- CREATE POLICY "Authenticated users can upload images" ON "ImageStorage"
--     FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir usuários deletarem suas próprias imagens
-- CREATE POLICY "Users can delete their own images" ON "ImageStorage"
--     FOR DELETE USING (auth.uid()::text = "uploadedBy");

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ImageStorage' 
ORDER BY ordinal_position;
