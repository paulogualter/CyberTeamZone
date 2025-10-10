#!/bin/bash

# Script para testar upload em produção
echo "🧪 Testando upload em produção..."
echo ""

# Verificar se a URL de produção foi fornecida
if [ -z "$1" ]; then
    echo "❌ Uso: $0 [URL_PRODUCAO]"
    echo "   Exemplo: $0 https://cyber-team-zone-new-paulogualter-gmailcoms-projects.vercel.app"
    exit 1
fi

PRODUCTION_URL="$1"
echo "🌐 URL de produção: $PRODUCTION_URL"
echo ""

# Criar uma imagem de teste simples
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-production-upload.png

echo "📤 Testando upload em produção..."
echo ""

# Testar upload
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/upload" \
  -F "file=@test-production-upload.png" \
  -H "Content-Type: multipart/form-data")

echo "📋 Resposta da API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 Verificando se o upload foi bem-sucedido..."
if echo "$RESPONSE" | grep -q '"success": true'; then
    echo "✅ Upload bem-sucedido!"
    
    # Extrair URL da imagem
    IMAGE_URL=$(echo "$RESPONSE" | jq -r '.fileUrl // .url' 2>/dev/null)
    if [ "$IMAGE_URL" != "null" ] && [ ! -z "$IMAGE_URL" ]; then
        echo "🔗 URL da imagem: $IMAGE_URL"
        echo "🌐 URL completa: $PRODUCTION_URL$IMAGE_URL"
        
        # Testar se a imagem é acessível
        echo "🔍 Testando acesso à imagem..."
        if curl -s -I "$PRODUCTION_URL$IMAGE_URL" | head -1 | grep -q "200"; then
            echo "✅ Imagem acessível!"
        else
            echo "❌ Imagem não acessível"
        fi
    fi
else
    echo "❌ Upload falhou!"
fi

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-production-upload.png

echo ""
echo "✅ Teste concluído!"
