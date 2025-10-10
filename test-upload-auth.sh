#!/bin/bash

# Script para testar upload com autenticação
echo "🧪 Testando upload com autenticação..."
echo ""

# Criar uma imagem de teste
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-auth-upload.png

echo "📤 Testando upload sem autenticação..."
echo ""

# Testar upload sem autenticação
RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-auth-upload.png" \
  -H "Content-Type: multipart/form-data")

echo "📋 Resposta sem autenticação:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 Verificando se o arquivo foi criado..."
if [ -f "public/uploads/anonymous_"*"_test-auth-upload.png" ]; then
    echo "✅ Arquivo criado com sucesso"
    ls -la public/uploads/anonymous_*_test-auth-upload.png
else
    echo "❌ Arquivo não foi criado"
fi

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-auth-upload.png
rm -f public/uploads/anonymous_*_test-auth-upload.png

echo ""
echo "✅ Teste concluído!"
