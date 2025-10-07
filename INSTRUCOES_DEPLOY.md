# 📋 Instruções de Deploy - Hostinger Hospedagem Compartilhada

## 🚀 Passos para Deploy

### 1. Upload dos Arquivos
- Faça upload de todos os arquivos para `public_html` no File Manager da Hostinger
- Certifique-se de que o arquivo `.env.production` está incluído

### 2. Configurar Banco de Dados
1. Acesse o hPanel da Hostinger
2. Vá em "Bancos de Dados MySQL"
3. Crie um banco de dados:
   - Nome: `cyberteamlms`
   - Usuário: `cyberteamlms`
   - Senha: `cyberteamLms`
4. Anote o host do banco (pode ser diferente de localhost)

### 3. Configurar Variáveis de Ambiente
1. Renomeie `.env.production` para `.env.local`
2. Edite o arquivo com suas credenciais reais:
   - Substitua `seu-dominio.com` pelo seu domínio
   - Substitua `seu-secret-super-seguro-aqui` por um secret forte
   - Configure suas chaves do Google OAuth
   - Configure suas chaves do Stripe

### 4. Configurar Node.js
1. No hPanel, vá em "Node.js"
2. Selecione a versão Node.js 18+
3. Configure:
   - Comando de start: `npm start`
   - Pasta raiz: `public_html`
   - Porta: `3000`

### 5. Executar Instalação
1. Acesse o terminal via SSH (se disponível) ou use o terminal do hPanel
2. Execute: `bash install-on-hostinger.sh`

### 6. Configurar SSL
1. No hPanel, vá em "SSL"
2. Ative o SSL para seu domínio
3. Configure redirecionamento HTTP para HTTPS

### 7. Configurar DNS (se necessário)
- Se usando subdomínio, configure CNAME apontando para seu domínio
- Se usando domínio principal, configure A record

## 🔧 Comandos Úteis

```bash
# Ver logs da aplicação
pm2 logs cyberteam-app

# Reiniciar aplicação
pm2 restart cyberteam-app

# Parar aplicação
pm2 stop cyberteam-app

# Ver status
pm2 status
```

## 🆘 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme se as variáveis de ambiente estão corretas

### Erro de Banco de Dados
- Verifique as credenciais no .env.local
- Confirme se o banco foi criado corretamente

### Erro de Permissões
- Verifique as permissões dos arquivos (644 para arquivos, 755 para pastas)
- Confirme se o .env.local tem as permissões corretas

### Erro de SSL
- Configure SSL no painel da Hostinger
- Verifique se o certificado está ativo
