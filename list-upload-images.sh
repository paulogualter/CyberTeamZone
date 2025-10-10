#!/bin/bash

echo "🔍 Listando imagens disponíveis na pasta /public/uploads..."

UPLOADS_DIR="public/uploads"

if [ ! -d "$UPLOADS_DIR" ]; then
  echo "❌ Pasta $UPLOADS_DIR não encontrada!"
  exit 1
fi

echo "📁 Pasta encontrada: $UPLOADS_DIR"
echo ""

# Contar total de arquivos
TOTAL_FILES=$(find "$UPLOADS_DIR" -type f | wc -l)
echo "📊 Total de arquivos: $TOTAL_FILES"
echo ""

# Listar apenas imagens
echo "🖼️ Imagens encontradas:"
echo "----------------------------------------"

find "$UPLOADS_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.svg" -o -iname "*.avif" \) | while read -r file; do
  filename=$(basename "$file")
  size=$(du -h "$file" | cut -f1)
  echo "📸 $filename ($size)"
done

echo ""
echo "📄 Outros arquivos encontrados:"
echo "----------------------------------------"

find "$UPLOADS_DIR" -type f ! \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.svg" -o -iname "*.avif" \) | while read -r file; do
  filename=$(basename "$file")
  size=$(du -h "$file" | cut -f1)
  echo "📄 $filename ($size)"
done

echo ""
echo "🧪 Para testar uma imagem específica:"
echo "curl -I https://www.cyberteam.zone/api/uploads/[FILENAME]"
echo ""
echo "🌐 Para acessar diretamente:"
echo "https://www.cyberteam.zone/api/uploads/[FILENAME]"
echo ""
echo "📋 Exemplos de URLs:"
echo "https://www.cyberteam.zone/api/uploads/1757777271763-atacandoMainframes.png"
echo "https://www.cyberteam.zone/api/uploads/user_1759784766958_lmeujhddh_1759832737604_ea8yt2_Atacando_PIPE_CICD.webp"
