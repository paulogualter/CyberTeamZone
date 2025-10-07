#!/bin/bash
echo "🔍 Verificando deployment no CloudPanel..."

# Verificar se a aplicação está rodando
echo "📊 Status da aplicação:"
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

# Verificar arquivos essenciais
echo "📁 Verificando arquivos essenciais:"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f ".htaccess" ] && echo "✅ .htaccess" || echo "❌ .htaccess"
[ -f ".env.local" ] && echo "✅ .env.local" || echo "❌ .env.local"
[ -d ".next" ] && echo "✅ .next" || echo "❌ .next"
[ -d "public" ] && echo "✅ public" || echo "❌ public"

# Verificar permissões
echo "🔐 Verificando permissões:"
[ -r ".htaccess" ] && echo "✅ .htaccess legível" || echo "❌ .htaccess não legível"
[ -w "public/uploads" ] && echo "✅ public/uploads gravável" || echo "❌ public/uploads não gravável"

echo "✅ Verificação concluída!"
