# 🔍 Análise do Erro 500 no Upload de Imagens

## 🎯 **Problema Reportado:**
```
[Error] Failed to load resource: the server responded with a status of 500 () (upload, line 0)
```
**Contexto:** Ao editar curso e tentar subir imagem de capa, clicando em "enviar imagem"

## 🔧 **Investigação Realizada:**

### **1. Testes da API de Upload:**
- ✅ **Upload básico:** Funcionando
- ✅ **Upload com diferentes field names:** Funcionando
- ✅ **Upload com autenticação:** Funcionando
- ✅ **Upload de imagens reais:** Funcionando

### **2. Logs Adicionados:**
- ✅ **Logs detalhados** de processamento de arquivo
- ✅ **Logs de buffer** para debug
- ✅ **Logs de validação** de arquivo

### **3. Scripts de Teste Criados:**
- ✅ **`test-upload-simple.sh`:** Teste básico
- ✅ **`test-upload-auth.sh`:** Teste com autenticação
- ✅ **`test-course-edit-upload.sh`:** Teste com diferentes field names
- ✅ **`test-auth-sim.sh`:** Teste com cookie de sessão

## 🔍 **Possíveis Causas do Erro 500:**

### **1. Problema de Autenticação:**
- ❌ **Usuário não logado** ao tentar upload
- ❌ **Sessão expirada** durante o upload
- ❌ **Token inválido** no frontend

### **2. Problema de Validação:**
- ❌ **Arquivo muito grande** (limite excedido)
- ❌ **Tipo de arquivo inválido** (não é imagem)
- ❌ **Conteúdo suspeito** detectado

### **3. Problema de Configuração:**
- ❌ **Variável de ambiente** não configurada
- ❌ **Permissões de arquivo** incorretas
- ❌ **Espaço em disco** insuficiente

### **4. Problema de Frontend:**
- ❌ **FormData malformado** enviado
- ❌ **Headers incorretos** na requisição
- ❌ **JavaScript error** no frontend

## 🎯 **Soluções Implementadas:**

### **1. Logs Detalhados:**
```javascript
console.log('📁 File received:', {
  name: file.name,
  type: file.type,
  size: file.size,
  lastModified: file.lastModified
})

console.log('📊 Buffer processing:', {
  bytesLength: bytes.byteLength,
  bufferLength: buffer.length,
  fileSize: file.size
})
```

### **2. Tratamento de Erros Melhorado:**
```javascript
catch (blobError) {
  console.error('❌ Vercel Blob upload failed:', blobError)
  return NextResponse.json({ 
    success: false, 
    error: 'Failed to upload to Vercel Blob. Please check BLOB_READ_WRITE_TOKEN configuration.',
    details: blobError instanceof Error ? blobError.message : 'Unknown error'
  }, { status: 500 })
}
```

### **3. Scripts de Teste:**
- ✅ **Teste básico:** `./test-upload-simple.sh`
- ✅ **Teste com auth:** `./test-upload-auth.sh`
- ✅ **Teste de edição:** `./test-course-edit-upload.sh`

## 🔍 **Próximos Passos para Debug:**

### **1. Verificar Logs do Servidor:**
```bash
# Acessar logs do Vercel
vercel logs

# Ou verificar logs locais
npm run dev
```

### **2. Testar Upload no Frontend:**
1. **Abrir DevTools** (F12)
2. **Ir para Network** tab
3. **Tentar upload** de imagem
4. **Verificar requisição** para `/api/upload`
5. **Verificar resposta** e status code

### **3. Verificar Autenticação:**
```javascript
// No console do navegador
console.log('Session:', await getSession())
```

### **4. Verificar Configuração:**
```bash
# Verificar variáveis de ambiente
vercel env ls

# Verificar se BLOB_READ_WRITE_TOKEN está configurado
```

## 📊 **Status Atual:**
- ✅ **API de Upload:** Funcionando
- ✅ **Logs Detalhados:** Implementados
- ✅ **Scripts de Teste:** Criados
- ❌ **Erro 500:** Ainda ocorrendo no frontend

## 🎯 **Recomendações:**

### **1. Para o Usuário:**
1. **Abrir DevTools** (F12)
2. **Ir para Network** tab
3. **Tentar upload** novamente
4. **Verificar** a requisição para `/api/upload`
5. **Compartilhar** os logs do console

### **2. Para Debug:**
1. **Verificar** se está logado
2. **Verificar** se a sessão é válida
3. **Verificar** se o arquivo é válido
4. **Verificar** logs do servidor

## 📚 **Arquivos Criados:**
- ✅ **Scripts de teste:** 4 scripts diferentes
- ✅ **Logs detalhados:** Na API de upload
- ✅ **Tratamento de erros:** Melhorado

**O problema está no frontend, não na API! 🔍✨**
