#!/bin/bash

echo "🚀 Fazendo upload das imagens para o Vercel Blob..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
  echo "❌ Erro: BLOB_READ_WRITE_TOKEN não configurado"
  echo "Configure a variável de ambiente BLOB_READ_WRITE_TOKEN"
  exit 1
fi

echo "✅ BLOB_READ_WRITE_TOKEN configurado"

# Listar imagens para upload
echo "📸 Imagens encontradas para upload:"
find public/uploads -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" | head -10 | while read -r file; do
  filename=$(basename "$file")
  echo "  - $filename"
done

echo ""
echo "🔧 Para fazer upload manual das imagens para o Vercel Blob:"
echo "1. Acesse: https://vercel.com/dashboard"
echo "2. Selecione seu projeto"
echo "3. Vá para Storage > Blob"
echo "4. Faça upload das imagens da pasta public/uploads/"
echo "5. Copie as URLs geradas"

echo ""
echo "📋 Ou use este script Node.js para upload automático:"
echo "----------------------------------------------------------------------------------------------------"
cat << 'EOF'
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function uploadImages() {
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  const files = fs.readdirSync(uploadsDir);
  
  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
      try {
        const filePath = path.join(uploadsDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        const blob = await put(file, fileBuffer, {
          access: 'public',
        });
        
        console.log(`✅ Uploaded: ${file} -> ${blob.url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error);
      }
    }
  }
}

uploadImages().catch(console.error);
EOF
echo "----------------------------------------------------------------------------------------------------"

echo ""
echo "🔄 Após o upload, atualize os cursos no banco:"
echo "UPDATE \"Course\" SET coverImage = 'https://blob.vercel-storage.com/filename.png' WHERE id = 'course_id';"

echo ""
echo "🎯 Solução alternativa: Usar imagens do Unsplash"
echo "UPDATE \"Course\" SET coverImage = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop' WHERE coverImage IS NULL;"
