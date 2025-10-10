#!/bin/bash

# Script para configurar URLs de redirecionamento do Google OAuth
echo "🔧 Configuração de URLs de Redirecionamento do Google OAuth"
echo "=========================================================="
echo ""

# URLs que devem estar configuradas no Google Console
echo "📋 URLs que devem estar configuradas no Google Console:"
echo ""

echo "🔹 Desenvolvimento Local:"
echo "   http://localhost:3000/api/auth/callback/google"
echo "   http://localhost:3001/api/auth/callback/google"
echo "   http://localhost:3002/api/auth/callback/google"
echo "   http://localhost:3003/api/auth/callback/google"
echo "   http://localhost:3004/api/auth/callback/google"
echo "   http://localhost:3005/api/auth/callback/google"
echo ""

echo "🔹 Produção (Vercel):"
echo "   https://cyber-team-zone.vercel.app/api/auth/callback/google"
echo "   https://cyber-team-zone-git-main-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google"
echo "   https://cyber-team-zone-pz2phpqj0-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google"
echo "   https://cyber-team-zone-bigzydona-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google"
echo ""

echo "🔹 Domínio Personalizado:"
echo "   https://cyberteam.zone/api/auth/callback/google"
echo ""

echo "⚠️  PROBLEMAS IDENTIFICADOS:"
echo "   - URIs 9 e 12 estão truncadas no Google Console"
echo "   - Precisam ser completadas com '/api/auth/callback/google'"
echo ""

echo "📝 INSTRUÇÕES:"
echo "1. Acesse: https://console.cloud.google.com/apis/credentials"
echo "2. Selecione seu projeto"
echo "3. Clique no OAuth 2.0 Client ID"
echo "4. Em 'Authorized redirect URIs', adicione/corrija as URLs acima"
echo "5. Salve as alterações"
echo ""

echo "🔍 Para verificar a URL atual do Vercel:"
echo "   - Acesse: https://vercel.com/dashboard"
echo "   - Selecione o projeto 'cyber-team-zone'"
echo "   - Copie a URL de produção"
echo ""

echo "✅ Após configurar, teste o login OAuth novamente!"
