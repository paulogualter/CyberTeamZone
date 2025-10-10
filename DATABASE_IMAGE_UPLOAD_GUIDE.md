# 🖼️ Upload de Imagens de Capa no Banco de Dados

## 🎯 **Objetivo:**
Implementar upload de imagens de capa diretamente no banco de dados Supabase, resolvendo definitivamente o problema de upload.

## 📋 **Passos para Implementação:**

### **1. Criar Tabela ImageStorage no Supabase**

#### **Execute este SQL no Supabase Dashboard:**

1. **Acesse:** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá para:** SQL Editor
3. **Execute o script:** `scripts/create-image-storage-table.sql`

```sql
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

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS "ImageStorage_filename_key" ON "ImageStorage"("filename");
CREATE INDEX IF NOT EXISTS "ImageStorage_uploadedBy_idx" ON "ImageStorage"("uploadedBy");
CREATE INDEX IF NOT EXISTS "ImageStorage_createdAt_idx" ON "ImageStorage"("createdAt");
```

### **2. Verificar Configuração do Supabase**

#### **Variáveis de Ambiente Necessárias:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **3. Testar o Sistema**

#### **Execute o script de teste:**
```bash
./scripts/test-image-upload.sh
```

#### **Teste manual via curl:**
```bash
# Criar uma imagem de teste
echo '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#374151"/><text x="50%" y="50%" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="16">Test Image</text></svg>' > test.svg

# Fazer upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.svg" \
  -H "Content-Type: multipart/form-data"

# Testar se a imagem é servida
curl -I http://localhost:3000/api/images/[IMAGE_ID_RETURNED]
```

## 🔧 **Arquivos Implementados:**

### **✅ APIs Criadas:**
- `app/api/upload/route.ts` - Upload para banco de dados
- `app/api/images/[imageId]/route.ts` - Servir imagens do banco
- `app/api/uploads/[filename]/route.ts` - Fallback para imagens antigas

### **✅ Componentes Criados:**
- `components/DatabaseImage.tsx` - Componente para imagens do banco
- `components/RobustImage.tsx` - Componente com fallback

### **✅ Scripts Criados:**
- `scripts/create-image-storage-table.sql` - SQL para criar tabela
- `scripts/test-image-upload.sh` - Teste de upload

## 🚀 **Como Usar:**

### **1. No Componente CourseCard:**

```tsx
import DatabaseImage from '@/components/DatabaseImage'

// Substituir:
<Image src={course.coverImage} alt={course.title} />

// Por:
<DatabaseImage 
  imageId={course.coverImageId} 
  src={course.coverImage} // fallback
  alt={course.title}
  width={300}
  height={200}
/>
```

### **2. No Formulário de Upload:**

```tsx
const handleImageUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  if (result.success) {
    // Usar result.imageId para salvar no curso
    setCourseData({
      ...courseData,
      coverImageId: result.imageId,
      coverImage: result.fileUrl // fallback
    })
  }
}
```

### **3. No Banco de Dados:**

```sql
-- Adicionar coluna imageId na tabela Course
ALTER TABLE "Course" ADD COLUMN "coverImageId" TEXT;

-- Criar índice para busca rápida
CREATE INDEX "Course_coverImageId_idx" ON "Course"("coverImageId");
```

## 📊 **Fluxo de Funcionamento:**

### **1. Upload:**
```
Usuário seleciona imagem
    ↓
API /api/upload recebe arquivo
    ↓
Converte para base64
    ↓
Salva na tabela ImageStorage
    ↓
Retorna imageId
```

### **2. Exibição:**
```
Componente DatabaseImage
    ↓
Tenta carregar /api/images/{imageId}
    ↓
API busca no banco de dados
    ↓
Converte base64 para buffer
    ↓
Retorna imagem com headers corretos
```

### **3. Fallback:**
```
Se imagem do banco falhar
    ↓
Tenta /api/uploads/{filename}
    ↓
Se falhar, mostra placeholder SVG
```

## 🧪 **Testes:**

### **1. Teste de Upload:**
```bash
./scripts/test-image-upload.sh
```

### **2. Teste Manual:**
```bash
# Upload
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg"

# Servir imagem
curl -I http://localhost:3000/api/images/[IMAGE_ID]
```

### **3. Teste no Frontend:**
- Abrir DevTools (F12)
- Tentar fazer upload de uma imagem
- Verificar se retorna imageId
- Verificar se a imagem é exibida

## 🎯 **Vantagens da Solução:**

### **✅ Benefícios:**
- **Armazenamento seguro** - Imagens no banco de dados
- **Backup automático** - Incluído no backup do Supabase
- **Controle de acesso** - RLS pode ser aplicado
- **Fallback robusto** - Múltiplas camadas de fallback
- **Cache otimizado** - Headers de cache configurados
- **Logs detalhados** - Debugging facilitado

### **✅ Funciona em:**
- **Desenvolvimento** - Local + banco
- **Produção** - Apenas banco (mais seguro)
- **Vercel** - Sem problemas de sistema de arquivos
- **Qualquer hosting** - Independente do sistema de arquivos

## 🚨 **Troubleshooting:**

### **Problema: "Table 'ImageStorage' doesn't exist"**
**Solução:** Execute o SQL no Supabase Dashboard

### **Problema: "Failed to save image to database"**
**Solução:** Verificar SUPABASE_SERVICE_ROLE_KEY

### **Problema: "Image not found"**
**Solução:** Verificar se imageId está correto

### **Problema: "Upload 500"**
**Solução:** Verificar logs do servidor

## 🎉 **Resultado Final:**

### **✅ Sistema Completo:**
- **Upload:** Funciona em dev e produção
- **Armazenamento:** Banco de dados Supabase
- **Exibição:** Componente robusto com fallback
- **Cache:** Otimizado para performance
- **Logs:** Detalhados para debugging

**Agora você pode fazer upload de imagens de capa que serão salvas diretamente no banco de dados! 🎯✨**

**Execute os passos acima e teste o sistema! 💪**
