# 🚀 CyberTeam.Zone - Deploy CloudPanel

## 📋 Arquivos Incluídos

-  - Build da aplicação Next.js
-  - Arquivos estáticos
-  - Páginas da aplicação
-  - Componentes React
-  - Bibliotecas e utilitários
-  - React hooks customizados
-  - Definições TypeScript
-  - Schema do banco de dados
-  - Configuração Apache
-  - Configuração PM2
-  - Configuração Nginx
-  - Dependências Node.js

## 🚀 Deploy Rápido no CloudPanel

### 1. Upload dos Arquivos


### 2. Configurar no CloudPanel
1. **Criar Site**: Vá em "Sites" → "Add Site"
2. **Configurar Node.js**: Vá em "Node.js" → "Add Node.js App"
3. **Criar Banco**: Vá em "Databases" → "Add Database"
4. **Configurar SSL**: Ative SSL no painel

### 3. Executar Instalação


### 4. Configurar Nginx


## 🔧 Comandos Úteis

```bash
# Instalar dependências
bash install-cloudpanel.sh

# Deploy completo
bash deploy-complete.sh

# Verificar deployment
bash verify-deployment.sh

# Limpeza
bash cleanup.sh

# Ver logs
pm2 logs cyberteam-app

# Reiniciar
pm2 restart cyberteam-app

# Status
pm2 status
```

## 📞 Suporte

Para problemas específicos do CloudPanel:
1. Consulte a documentação oficial do CloudPanel
2. Verifique os logs: `pm2 logs cyberteam-app`
3. Verifique o Nginx: `sudo nginx -t`
4. Entre em contato com o suporte do CloudPanel

## ⚠️ Importante

- O CloudPanel gerencia SSL e Nginx automaticamente
- Use PM2 para gerenciar o processo Node.js
- Monitore os logs regularmente
- Faça backup do banco de dados
- Mantenha o sistema atualizado
