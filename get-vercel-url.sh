#!/bin/bash

# Script para obter a URL atual do Vercel e configurar OAuth
echo "🔍 Obtendo URL atual do Vercel..."
echo ""

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Obter informações do projeto
echo "📋 Informações do Projeto Vercel:"
vercel ls 2>/dev/null | grep cyber-team-zone || echo "Projeto não encontrado ou não logado"

echo ""
echo "🔧 Para configurar OAuth corretamente:"
echo "1. Execute: vercel login"
echo "2. Execute: vercel ls"
echo "3. Copie a URL do projeto 'cyber-team-zone'"
echo "4. Adicione '/api/auth/callback/google' no final"
echo "5. Configure no Google Console"
echo ""

# Tentar obter a URL atual
CURRENT_URL=$(vercel ls 2>/dev/null | grep cyber-team-zone | head -1 | awk '{print $2}' | sed 's/.*https/https/')

if [ ! -z "$CURRENT_URL" ]; then
    echo "✅ URL atual encontrada: $CURRENT_URL"
    echo "🔗 URL de callback: ${CURRENT_URL}/api/auth/callback/google"
    echo ""
    echo "📝 Adicione esta URL no Google Console:"
    echo "   ${CURRENT_URL}/api/auth/callback/google"
else
    echo "⚠️  Não foi possível obter a URL automaticamente"
    echo "   Acesse: https://vercel.com/dashboard"
    echo "   Selecione: cyber-team-zone"
    echo "   Copie a URL de produção"
fi
