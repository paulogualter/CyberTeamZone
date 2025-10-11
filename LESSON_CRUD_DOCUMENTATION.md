# 🎥 **CRUD Completo de Aulas com Upload de Vídeos**

## ✅ **Funcionalidades Implementadas**

### **🔧 Backend (APIs)**
- ✅ **Upload de Vídeos** - `/api/upload-video`
- ✅ **Servir Vídeos** - `/api/videos/[videoId]`
- ✅ **CRUD de Aulas** - `/api/lessons-crud`
- ✅ **Validação de Segurança** - Tipos, tamanhos, permissões
- ✅ **Autenticação** - ADMIN e INSTRUCTOR apenas

### **🎨 Frontend (Componentes)**
- ✅ **VideoUpload** - Upload com preview e controles
- ✅ **LessonModal** - Modal completo para criar/editar aulas
- ✅ **LessonList** - Lista organizada de aulas
- ✅ **useLessons** - Hook para gerenciamento de estado

### **🔒 Segurança**
- ✅ **Validação de Arquivos** - Tipos permitidos, tamanho máximo
- ✅ **Autenticação Obrigatória** - Sessão válida necessária
- ✅ **Controle de Permissões** - ADMIN e INSTRUCTOR apenas
- ✅ **Sanitização** - Dados limpos e seguros

## 🚀 **Como Usar**

### **1. Upload de Vídeos**

#### **Via Componente React:**
```tsx
import VideoUpload from '@/components/VideoUpload'

function MyComponent() {
  const handleVideoUploaded = (videoUrl: string, filename: string) => {
    console.log('Vídeo enviado:', videoUrl)
  }

  const handleVideoRemoved = () => {
    console.log('Vídeo removido')
  }

  return (
    <VideoUpload
      onVideoUploaded={handleVideoUploaded}
      onVideoRemoved={handleVideoRemoved}
      initialVideoUrl=""
    />
  )
}
```

#### **Via API Direta:**
```javascript
const formData = new FormData()
formData.append('video', videoFile)

const response = await fetch('/api/upload-video', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
console.log('Vídeo enviado:', result.videoUrl)
```

### **2. Gerenciar Aulas**

#### **Usando o Hook useLessons:**
```tsx
import { useLessons } from '@/hooks/useLessons'

function LessonManager({ moduleId }: { moduleId: string }) {
  const { 
    lessons, 
    isLoading, 
    error, 
    createLesson, 
    updateLesson, 
    deleteLesson 
  } = useLessons({ moduleId })

  const handleCreateLesson = async () => {
    await createLesson({
      title: 'Nova Aula',
      content: 'Conteúdo da aula',
      type: 'VIDEO',
      moduleId: moduleId,
      order: 1,
      isPublished: false
    })
  }

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {lessons.map(lesson => (
        <div key={lesson.id}>{lesson.title}</div>
      ))}
    </div>
  )
}
```

#### **Usando Componentes Prontos:**
```tsx
import LessonList from '@/components/LessonList'

function ModulePage({ moduleId }: { moduleId: string }) {
  return (
    <LessonList 
      moduleId={moduleId}
      moduleTitle="Módulo de Segurança"
    />
  )
}
```

### **3. Tipos de Aula Suportados**

```typescript
type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICAL' | 'CTF'
```

- **VIDEO** - Aulas em vídeo com upload ou URL externa
- **TEXT** - Aulas de texto com conteúdo HTML
- **QUIZ** - Questionários e exercícios
- **PRACTICAL** - Exercícios práticos
- **CTF** - Desafios Capture The Flag

### **4. Estrutura de Dados**

#### **Aula (Lesson):**
```typescript
interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  duration?: number
  order: number
  type: LessonType
  isPublished: boolean
  moduleId: string
  createdAt: string
  updatedAt: string
}
```

## 📋 **Especificações Técnicas**

### **Upload de Vídeos**
- **Tamanho Máximo:** 500MB
- **Formatos Suportados:** MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
- **Armazenamento:** Base64 data URL no banco de dados
- **Validação:** Tipo MIME, tamanho, extensão

### **Permissões**
- **ADMIN:** Pode criar/editar/excluir qualquer aula
- **INSTRUCTOR:** Pode criar/editar/excluir apenas suas próprias aulas
- **STUDENT:** Apenas visualização (não implementado neste CRUD)

### **Validações**
- ✅ Título obrigatório
- ✅ Conteúdo obrigatório
- ✅ Módulo deve existir
- ✅ Usuário deve ter permissão
- ✅ Ordem automática se não informada

## 🎯 **Exemplos de Uso**

### **1. Criar Nova Aula com Vídeo**
```tsx
const newLesson = {
  title: 'Introdução à Cibersegurança',
  content: '<h1>Bem-vindos!</h1><p>Nesta aula vamos aprender...</p>',
  type: 'VIDEO',
  moduleId: 'module_123',
  order: 1,
  isPublished: true,
  videoUrl: 'data:video/mp4;base64,AAAA...', // Do upload
  duration: 30
}

await createLesson(newLesson)
```

### **2. Atualizar Aula Existente**
```tsx
const updatedLesson = {
  ...existingLesson,
  title: 'Título Atualizado',
  isPublished: true
}

await updateLesson(updatedLesson)
```

### **3. Excluir Aula**
```tsx
await deleteLesson('lesson_123')
```

## 🔧 **Configuração**

### **Variáveis de Ambiente Necessárias:**
```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

### **Dependências do Banco:**
- Tabela `Lesson` com campos: id, title, content, videoUrl, duration, order, type, isPublished, moduleId
- Tabela `Module` com relação para `Course`
- Tabela `Course` com campo `instructorId`

## 🚨 **Limitações e Considerações**

### **Performance:**
- Vídeos são armazenados como Base64 (pode impactar performance)
- Para produção, considere usar CDN ou storage externo
- Limite de 500MB por vídeo

### **Segurança:**
- Validação de tipos MIME (pode ser contornada)
- Para produção, considere análise de conteúdo
- Rate limiting recomendado para uploads

### **Escalabilidade:**
- Base64 não é ideal para grandes volumes
- Considere migração para storage externo (AWS S3, etc.)
- Implementar compressão de vídeo

## 🎉 **Pronto para Usar!**

O sistema está completamente funcional e pronto para uso. Todos os componentes são responsivos, seguros e seguem as melhores práticas de desenvolvimento React/Next.js.

**Para testar:**
1. Faça login como ADMIN ou INSTRUCTOR
2. Acesse um módulo de curso
3. Use o componente `LessonList` para gerenciar aulas
4. Faça upload de vídeos usando o `VideoUpload`
5. Crie, edite e exclua aulas conforme necessário
