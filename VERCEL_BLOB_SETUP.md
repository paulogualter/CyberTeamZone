# 🔧 Configuração do Vercel Blob para Upload de Imagens

## ❌ Problema Atual
- **Erro 503** ao tentar fazer upload de imagens em produção
- **Causa:** Configuração incorreta do Vercel Blob

## ✅ Solução Implementada

### 1. **API de Upload Melhorada**
- ✅ **Import dinâmico** do Vercel Blob
- ✅ **Tratamento de erros** específico
- ✅ **Logs detalhados** para debug
- ✅ **Fallback robusto** para desenvolvimento

### 2. **Configuração Necessária**

#### **Variável de Ambiente Obrigatória:**
```bash
BLOB_READ_WRITE_TOKEN=your_token_here
```

#### **Como Obter o Token:**
1. **Via CLI:**
   ```bash
   vercel login
   vercel env pull .env.local
   ```

2. **Via Dashboard:**
   - Acesse: https://vercel.com/dashboard
   - Selecione seu projeto
   - Vá em Settings > Environment Variables
   - Adicione: `BLOB_READ_WRITE_TOKEN`
   - Valor: Token do Vercel Blob

### 3. **Scripts de Teste**

#### **Verificar Configuração:**
```bash
./check-blob-config.sh
```

#### **Testar Upload em Produção:**
```bash
./test-production-upload.sh https://your-app.vercel.app
```

### 4. **Logs de Debug**
A API agora inclui logs detalhados:
- 🚀 **Início do upload**
- 📁 **Arquivo recebido**
- ✅ **Validação aprovada**
- 🌐 **Ambiente detectado**
- ✅ **Upload bem-sucedido**
- ❌ **Erros específicos**

### 5. **Tratamento de Erros**
- **503 Service Unavailable:** Configuração do Vercel Blob
- **401 Unauthorized:** Sessão não autenticada
- **400 Bad Request:** Arquivo inválido
- **500 Internal Server Error:** Erro no servidor

## 🎯 Próximos Passos

1. **Configure a variável de ambiente:**
   ```bash
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```

2. **Teste o upload:**
   ```bash
   ./test-production-upload.sh https://your-app.vercel.app
   ```

3. **Verifique os logs** no Vercel Dashboard

4. **Se ainda houver erro 503:**
   - Verifique se o token está correto
   - Confirme se o projeto tem acesso ao Vercel Blob
   - Verifique os logs de função no Vercel

## 🔍 Debug Information

### **Logs Esperados:**
```
🚀 Upload API called
📁 File received: { name: "image.jpg", type: "image/jpeg", size: 12345 }
✅ File validation passed
🌐 Production environment detected, using Vercel Blob
✅ Vercel Blob upload successful: https://blob.vercel-storage.com/...
✅ Upload successful: { fileUrl: "...", environment: "production" }
```

### **Erros Comuns:**
- **"Failed to upload to Vercel Blob":** Token incorreto
- **"Unauthorized":** Usuário não logado
- **"No file uploaded":** FormData incorreto

## 📚 Documentação
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Function Logs](https://vercel.com/docs/functions/logs)
