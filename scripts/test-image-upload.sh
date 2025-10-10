#!/bin/bash

echo "🧪 Testing Image Upload to Database"
echo "=================================="

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set."
  echo "Please ensure these environment variables are configured."
  exit 1
fi

echo "✅ Environment variables configured"

# Criar uma imagem de teste simples (SVG)
TEST_IMAGE="test-image.svg"
cat > "$TEST_IMAGE" << 'EOF'
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#374151"/>
  <text x="50%" y="50%" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="16">
    Test Image
  </text>
  <text x="50%" y="65%" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="12">
    Database Upload Test
  </text>
</svg>
EOF

echo "✅ Test image created: $TEST_IMAGE"

# Testar upload via API
echo "🚀 Testing upload API..."

UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@$TEST_IMAGE" \
  -H "Content-Type: multipart/form-data")

echo "📤 Upload Response:"
echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"

# Extrair imageId da resposta
IMAGE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.imageId' 2>/dev/null)

if [ "$IMAGE_ID" != "null" ] && [ "$IMAGE_ID" != "" ]; then
  echo "✅ Image uploaded successfully with ID: $IMAGE_ID"
  
  # Testar se a imagem pode ser servida
  echo "🖼️ Testing image serving..."
  
  IMAGE_RESPONSE=$(curl -s -I "http://localhost:3000/api/images/$IMAGE_ID")
  
  if echo "$IMAGE_RESPONSE" | grep -q "200 OK"; then
    echo "✅ Image served successfully from database"
    echo "🔗 Image URL: http://localhost:3000/api/images/$IMAGE_ID"
  else
    echo "❌ Failed to serve image from database"
    echo "Response: $IMAGE_RESPONSE"
  fi
else
  echo "❌ Upload failed or no imageId returned"
fi

# Limpar arquivo de teste
rm -f "$TEST_IMAGE"
echo "🧹 Test image cleaned up"

echo ""
echo "📋 Test Summary:"
echo "- Upload API: $([ "$IMAGE_ID" != "null" ] && [ "$IMAGE_ID" != "" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "- Image Serving: $(echo "$IMAGE_RESPONSE" | grep -q "200 OK" && echo "✅ PASS" || echo "❌ FAIL")"

if [ "$IMAGE_ID" != "null" ] && [ "$IMAGE_ID" != "" ]; then
  echo ""
  echo "🎯 Next Steps:"
  echo "1. Test the image URL in your browser: http://localhost:3000/api/images/$IMAGE_ID"
  echo "2. Use DatabaseImage component in your React components"
  echo "3. Update CourseCard to use imageId instead of src"
fi
