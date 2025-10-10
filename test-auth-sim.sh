#!/bin/bash

# Script para testar upload com autenticação simulada
echo "🧪 Testando upload com autenticação simulada..."
echo ""

# Criar uma imagem de teste
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-auth-sim.png

echo "📤 Testando upload com cookie de sessão..."
echo ""

# Testar upload com cookie de sessão (simulando usuário logado)
RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-auth-sim.png" \
  -H "Content-Type: multipart/form-data" \
  -H "Cookie: next-auth.session-token=test")

echo "📋 Resposta com cookie:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 Verificando se o arquivo foi criado..."
if [ -f "public/uploads/anonymous_"*"_test-auth-sim.png" ]; then
    echo "✅ Arquivo criado com sucesso"
    ls -la public/uploads/anonymous_*_test-auth-sim.png
else
    echo "❌ Arquivo não foi criado"
fi

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-auth-sim.png
rm -f public/uploads/anonymous_*_test-auth-sim.png

echo ""
echo "✅ Teste concluído!"
