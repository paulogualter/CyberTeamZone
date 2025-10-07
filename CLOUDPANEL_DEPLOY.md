# 🚀 Deploy no CloudPanel - CyberTeam.Zone

## 📋 Pré-requisitos

- Conta CloudPanel ativa
- Acesso SSH ao servidor
- Domínio configurado
- Banco de dados MySQL/MariaDB criado

## 🔧 Configuração no CloudPanel

### 1. Criar Site no CloudPanel

1. **Acesse o CloudPanel**
2. **Vá em "Sites"** → **"Add Site"**
3. **Configure o site:**
   - **Domain**: `seu-dominio.com`
   - **Document Root**: `/home/cyberteam/htdocs/seu-dominio.com`
   - **PHP Version**: Desabilitado (não precisamos de PHP)
   - **SSL**: Ativado

### 2. Configurar Node.js

1. **Vá em "Node.js"** no CloudPanel
2. **Clique em "Add Node.js App"**
3. **Configure:**
   - **App Name**: `cyberteam-app`
   - **Domain**: `seu-dominio.com`
   - **Port**: `3000`
   - **Node Version**: `18.x` ou superior
   - **App Directory**: `/home/cyberteam/htdocs/seu-dominio.com`

### 3. Criar Banco de Dados

1. **Vá em "Databases"** → **"Add Database"**
2. **Configure:**
   - **Database Name**: `cyberteamlms`
   - **Username**: `cyberteamlms`
   - **Password**: `cyberteamLms` (ou uma senha forte)
   - **Host**: `localhost`

## 🚀 Deploy da Aplicação

### 1. Upload dos Arquivos

```bash
# Via SCP (do seu computador local)
scp -r dist/* usuario@seu-servidor:/home/cyberteam/htdocs/seu-dominio.com/

# Ou via SFTP usando FileZilla
# Host: seu-servidor
# Username: seu-usuario
# Password: sua-senha
# Port: 22
# Remote Directory: /home/cyberteam/htdocs/seu-dominio.com/
```

### 2. Configurar Variáveis de Ambiente

```bash
# Acesse o servidor via SSH
ssh usuario@seu-servidor

# Navegue para o diretório do site
cd /home/cyberteam/htdocs/seu-dominio.com

# Criar arquivo .env.local
nano .env.local
```

**Conteúdo do .env.local:**
```env
# Database
DATABASE_URL="mysql://cyberteamlms:cyberteamLms@localhost:3306/cyberteamlms"

# NextAuth
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui-minimo-32-caracteres"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN="seu-mercadopago-token"
MERCADOPAGO_WEBHOOK_SECRET="seu-mercadopago-webhook-secret"
```

### 3. Instalar Dependências e Configurar

```bash
# Instalar dependências
npm ci --omit=dev

# Gerar cliente Prisma
npx prisma generate --schema=prisma/schema.prisma

# Aplicar migrações
npx prisma db push --schema=prisma/schema.prisma

# Criar diretório de uploads
mkdir -p public/uploads
chmod 755 public/uploads

# Configurar permissões
chmod 644 .htaccess
chmod 644 package.json
```

### 4. Configurar PM2

```bash
# Instalar PM2 globalmente (se não estiver instalado)
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
```

### 5. Configurar Nginx (CloudPanel)

O CloudPanel usa Nginx. Crie um arquivo de configuração personalizado:

```bash
# Criar arquivo de configuração Nginx
sudo nano /home/cyberteam/conf/nginx/conf.d/seu-dominio.com.conf
```

**Conteúdo do arquivo Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # SSL Configuration (CloudPanel gerencia automaticamente)
    ssl_certificate /home/cyberteam/conf/ssl/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /home/cyberteam/conf/ssl/seu-dominio.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /_next/static/ {
        alias /home/cyberteam/htdocs/seu-dominio.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /public/ {
        alias /home/cyberteam/htdocs/seu-dominio.com/public/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Upload size limit
    client_max_body_size 20M;
}
```

### 6. Recarregar Nginx

```bash
# Recarregar configuração Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Scripts de Automação

### Script de Deploy Completo

```bash
#!/bin/bash
set -euo pipefail

echo "🚀 Deploy no CloudPanel - CyberTeam.Zone"

# Variáveis
DOMAIN="seu-dominio.com"
APP_DIR="/home/cyberteam/htdocs/$DOMAIN"
APP_NAME="cyberteam-app"

# 1. Navegar para o diretório
cd "$APP_DIR"

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm ci --omit=dev

# 3. Gerar cliente Prisma
echo "🗄️ Configurando banco de dados..."
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma

# 4. Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p public/uploads
mkdir -p logs

# 5. Configurar permissões
echo "🔐 Configurando permissões..."
chmod 755 public/uploads
chmod 644 .htaccess
chmod 644 package.json

# 6. Iniciar/Reiniciar aplicação
echo "🚀 Iniciando aplicação..."
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js

# 7. Salvar configuração PM2
pm2 save

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: https://$DOMAIN"
```

### Script de Verificação

```bash
#!/bin/bash
echo "🔍 Verificando deployment no CloudPanel..."

# Verificar se a aplicação está rodando
pm2 status

# Verificar logs
echo "📋 Últimos logs:"
pm2 logs cyberteam-app --lines 10

# Verificar conectividade
echo "🌐 Testando conectividade:"
curl -I https://seu-dominio.com || echo "❌ Erro de conectividade"

# Verificar banco de dados
echo "🗄️ Testando banco de dados:"
npx prisma db pull --schema=prisma/schema.prisma || echo "❌ Erro de banco de dados"

echo "✅ Verificação concluída!"
```

## 🔧 Comandos Úteis

### Gerenciamento da Aplicação

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs cyberteam-app

# Reiniciar
pm2 restart cyberteam-app

# Parar
pm2 stop cyberteam-app

# Iniciar
pm2 start cyberteam-app

# Remover
pm2 delete cyberteam-app
```

### Gerenciamento do Banco de Dados

```bash
# Aplicar migrações
npx prisma db push --schema=prisma/schema.prisma

# Resetar banco (CUIDADO!)
npx prisma db push --schema=prisma/schema.prisma --force-reset

# Abrir Prisma Studio
npx prisma studio --schema=prisma/schema.prisma
```

### Logs e Monitoramento

```bash
# Logs da aplicação
pm2 logs cyberteam-app --lines 100

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
```

## 🆘 Troubleshooting

### Erro 502 Bad Gateway
- Verifique se o Node.js está rodando: `pm2 status`
- Verifique se a porta 3000 está correta
- Verifique os logs: `pm2 logs cyberteam-app`

### Erro de Banco de Dados
- Verifique as credenciais no `.env.local`
- Teste a conexão: `npx prisma db pull`
- Verifique se o banco existe no CloudPanel

### Erro de Permissões
- Verifique as permissões: `ls -la`
- Corrija: `chmod 755 public/uploads`
- Verifique o proprietário: `chown -R cyberteam:cyberteam .`

### Erro de SSL
- Verifique se o SSL está ativo no CloudPanel
- Verifique o certificado: `sudo certbot certificates`
- Renove se necessário: `sudo certbot renew`

## 📞 Suporte

Para problemas específicos do CloudPanel:
1. Consulte a documentação oficial do CloudPanel
2. Verifique os logs do sistema
3. Entre em contato com o suporte do CloudPanel
4. Consulte os logs da aplicação via PM2

## ⚠️ Importante

- O CloudPanel gerencia automaticamente SSL e Nginx
- Use PM2 para gerenciar o processo Node.js
- Monitore os logs regularmente
- Faça backup do banco de dados
- Mantenha o sistema atualizado
