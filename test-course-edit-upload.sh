#!/bin/bash

# Script para testar upload durante edição de curso
echo "🧪 Testando upload durante edição de curso..."
echo ""

# Criar uma imagem de teste
echo "📸 Criando imagem de teste..."
echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-course-edit.png

echo "📤 Testando upload com diferentes field names..."
echo ""

# Testar com field name 'image' (usado em alguns formulários)
echo "🔍 Testando com field name 'image':"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "image=@test-course-edit.png" \
  -H "Content-Type: multipart/form-data")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 Testando com field name 'attachment':"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "attachment=@test-course-edit.png" \
  -H "Content-Type: multipart/form-data")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🧹 Limpando arquivo de teste..."
rm -f test-course-edit.png
rm -f public/uploads/anonymous_*_test-course-edit.png

echo ""
echo "✅ Teste concluído!"
