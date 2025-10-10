# 🔑 Como Obter o Token do Vercel Blob

## ✅ Status Atual
- ✅ **Vercel CLI instalado** e configurado
- ✅ **Projeto conectado:** cyber-team-zone-new
- ✅ **Login realizado** com sucesso
- ❌ **Token do Blob:** Não configurado

## 🎯 Solução: Configurar Token Manualmente

### **Passo 1: Acesse o Dashboard do Vercel**
```
https://vercel.com/account/tokens
```

### **Passo 2: Crie um Novo Token**
1. Clique em **"Create Token"**
2. Nome: `blob-upload-token`
3. Expiration: `1 year` (ou conforme necessário)
4. Clique em **"Create"**

### **Passo 3: Copie o Token**
- O token será exibido apenas uma vez
- Copie o token completo (começa com `vercel_blob_`)

### **Passo 4: Adicione ao Projeto**
Execute o comando abaixo e cole o token quando solicitado:

```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

### **Passo 5: Verifique a Configuração**
```bash
vercel env ls
```

## 🔍 Token Esperado
O token deve ter o formato:
```
vercel_blob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📋 Comandos Úteis

### **Verificar Variáveis de Ambiente:**
```bash
vercel env ls
```

### **Fazer Deploy com Nova Configuração:**
```bash
vercel --prod
```

### **Testar Upload:**
```bash
./test-production-upload.sh https://cyber-team-zone-new-paulogualter-gmailcoms-projects.vercel.app
```

## ⚠️ Importante
- O token é sensível e não deve ser compartilhado
- Mantenha o token seguro
- O token expira conforme configurado

## 🎯 Próximos Passos
1. **Acesse:** https://vercel.com/account/tokens
2. **Crie o token** com nome `blob-upload-token`
3. **Execute:** `vercel env add BLOB_READ_WRITE_TOKEN`
4. **Cole o token** quando solicitado
5. **Teste o upload** em produção
