#!/bin/bash

# Script para testar upload de imagem
echo "🧪 Testando upload de imagem..."
echo ""

# Criar uma imagem de teste simples
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-upload.png

echo "📤 Testando upload..."
echo ""

# Testar upload
RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-upload.png" \
  -H "Content-Type: multipart/form-data")

echo "📋 Resposta da API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-upload.png

echo ""
echo "✅ Teste concluído!"
