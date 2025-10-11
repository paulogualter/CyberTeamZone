# 🔍 Guia de Teste - Endpoints de Debug

## ✅ Endpoints de Debug Disponíveis

### 1. **Debug Simples** - Teste básico de conectividade
```
GET https://www.cyberteam.zone/api/debug/simple?test=all
```

**Testa:**
- ✅ Conectividade básica
- ✅ Sessão do usuário
- ✅ Conexão com Supabase
- ✅ Queries de módulos e aulas
- ✅ Módulo específico

### 2. **Debug de Criação de Aulas** - Teste de permissões
```
GET https://www.cyberteam.zone/api/debug/create-lesson-direct?moduleId=module_1760134320837_r7frihu3
```

**Verifica:**
- ✅ Se você está logado
- ✅ Se tem permissão (ADMIN ou INSTRUCTOR)
- ✅ Se o módulo existe
- ✅ Se você tem acesso ao curso
- ✅ Quantas aulas já existem

### 3. **Criação Direta de Aulas** - Criar aula via API
```bash
curl -X POST https://www.cyberteam.zone/api/debug/create-lesson-direct \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "module_1760134320837_r7frihu3",
    "title": "Minha Nova Aula",
    "description": "Descrição da aula",
    "content": "Conteúdo da aula"
  }'
```

### 4. **Debug Completo de Endpoints Admin** - Teste todos os endpoints
```
GET https://www.cyberteam.zone/api/debug/test-admin-endpoints?test=all&moduleId=module_1760134320837_r7frihu3&courseId=course_1760131262324_j54dte5i
```

## 🎯 Como Testar

### **Passo 1: Teste Básico**
1. Acesse: `https://www.cyberteam.zone/api/debug/simple?test=all`
2. Verifique se retorna dados de sessão, Supabase e módulos
3. Se der erro, há problema de conectividade

### **Passo 2: Teste de Permissões**
1. Acesse: `https://www.cyberteam.zone/api/debug/create-lesson-direct?moduleId=module_1760134320837_r7frihu3`
2. Verifique se `canCreateLesson: true`
3. Se `canCreateLesson: false`, há problema de permissões

### **Passo 3: Criação de Aula**
1. Use o comando curl acima
2. Verifique se retorna `success: true`
3. Se der erro, verifique os logs no servidor

### **Passo 4: Debug Completo**
1. Acesse o endpoint de debug completo
2. Verifique todos os testes
3. Identifique qual endpoint está falhando

## 🔍 Interpretando os Resultados

### **✅ Sucesso:**
```json
{
  "success": true,
  "debug": {
    "sessionExists": true,
    "userRole": "ADMIN",
    "canCreateLesson": true
  }
}
```

### **❌ Erro de Sessão:**
```json
{
  "error": "No session found",
  "debug": {
    "sessionExists": false
  }
}
```

### **❌ Erro de Permissão:**
```json
{
  "error": "Insufficient permissions",
  "debug": {
    "userRole": "STUDENT",
    "requiredRoles": ["ADMIN", "INSTRUCTOR"]
  }
}
```

### **❌ Erro de Módulo:**
```json
{
  "error": "Module not found",
  "debug": {
    "moduleId": "module_xxx",
    "moduleError": "No rows found"
  }
}
```

## 🚨 Problemas Comuns

### **1. CSP Violations**
- **Sintoma**: "Refused to load script"
- **Solução**: Use os endpoints de debug diretamente
- **Bypass**: Teste via curl ou Postman

### **2. 500 Internal Server Error**
- **Sintoma**: Endpoint retorna 500
- **Solução**: Verifique logs do servidor
- **Debug**: Use `/api/debug/simple` primeiro

### **3. 401 Unauthorized**
- **Sintoma**: "No session found"
- **Solução**: Faça login primeiro
- **Verificação**: Teste `/api/debug/simple?test=session`

### **4. 403 Forbidden**
- **Sintoma**: "Insufficient permissions"
- **Solução**: Verifique se é ADMIN ou INSTRUCTOR
- **Verificação**: Teste `/api/debug/simple?test=session`

## 📊 Logs do Servidor

Os endpoints de debug mostram logs detalhados no console do servidor:

```
🔍 Debug endpoint called
📋 Session exists: true
👤 User role: ADMIN
📊 Supabase result: {...}
✅ Operation completed successfully
```

## 🎯 Próximos Passos

1. **Teste o debug simples primeiro**
2. **Se funcionar, teste as permissões**
3. **Se as permissões estiverem OK, teste a criação**
4. **Se der erro, verifique os logs específicos**

## 📞 Suporte

Se ainda houver problemas:
1. Teste todos os endpoints de debug
2. Copie os logs do servidor
3. Informe qual endpoint está falhando
4. Inclua a resposta JSON completa
