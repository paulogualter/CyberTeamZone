#!/bin/bash

# Script para testar upload em produção
echo "🧪 Testando upload em produção..."
echo ""

# Verificar se a URL de produção foi fornecida
if [ -z "$1" ]; then
    echo "❌ Uso: $0 [URL_PRODUCAO]"
    echo "   Exemplo: $0 https://cyberteamzone.vercel.app"
    exit 1
fi

PRODUCTION_URL="$1"
echo "🌐 URL de produção: $PRODUCTION_URL"
echo ""

# Criar uma imagem de teste simples
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-production.png

echo "📤 Testando upload..."
echo ""

# Testar upload
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/upload" \
  -F "file=@test-production.png" \
  -H "Content-Type: multipart/form-data")

echo "📋 Resposta da API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-production.png

echo ""
echo "✅ Teste concluído!"
