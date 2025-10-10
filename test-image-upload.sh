#!/bin/bash

# Script para testar upload de imagem e verificar URLs
echo "🧪 Testando upload de imagem..."
echo ""

# Criar uma imagem de teste simples
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

echo "📤 Testando upload..."
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.png" \
  -H "Content-Type: multipart/form-data" \
  | jq '.'

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-image.png

echo ""
echo "✅ Teste concluído!"
