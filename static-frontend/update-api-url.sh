#!/bin/bash
set -euo pipefail

echo "🔄 Atualizando URL da API..."

# Verificar se foi fornecido um argumento
if [ $# -eq 0 ]; then
    echo "❌ Erro: Forneça a nova URL da API"
    echo "Uso: ./update-api-url.sh https://nova-api-url.com/api"
    exit 1
fi

NEW_API_URL="$1"
OLD_API_URL="https://seu-app.vercel.app/api"

echo "📝 Atualizando de: $OLD_API_URL"
echo "📝 Para: $NEW_API_URL"

# Atualizar index.html
sed -i.bak "s|$OLD_API_URL|$NEW_API_URL|g" index.html

# Atualizar sitemap.xml
sed -i.bak "s|seu-dominio.com|$(echo $NEW_API_URL | sed 's|https://||' | sed 's|/api||')|g" sitemap.xml

# Atualizar robots.txt
sed -i.bak "s|seu-dominio.com|$(echo $NEW_API_URL | sed 's|https://||' | sed 's|/api||')|g" robots.txt

echo "✅ URLs atualizadas com sucesso!"
echo "📋 Arquivos modificados:"
echo "  - index.html"
echo "  - sitemap.xml"
echo "  - robots.txt"
echo ""
echo "🔄 Faça upload dos arquivos atualizados para o servidor"
