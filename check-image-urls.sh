#!/bin/bash

# Script para verificar URLs das imagens no banco de dados
echo "🔍 Verificando URLs das imagens no banco de dados..."
echo ""

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3000/api/health/db > /dev/null; then
    echo "❌ Servidor não está rodando. Execute: npm run dev"
    exit 1
fi

echo "📊 Buscando cursos com imagens..."
curl -s http://localhost:3000/api/courses | jq '.courses[] | {id, title, coverImage}' | head -20

echo ""
echo "🔍 Verificando se as imagens existem..."

# Buscar URLs das imagens
curl -s http://localhost:3000/api/courses | jq -r '.courses[].coverImage' | grep -v null | while read url; do
    if [ ! -z "$url" ]; then
        echo "🔗 Testando: $url"
        if [[ $url == http* ]]; then
            # URL externa
            if curl -s -I "$url" | head -1 | grep -q "200"; then
                echo "✅ Acessível: $url"
            else
                echo "❌ Inacessível: $url"
            fi
        else
            # URL local
            if [ -f "public$url" ]; then
                echo "✅ Arquivo local existe: public$url"
            else
                echo "❌ Arquivo local não encontrado: public$url"
            fi
        fi
        echo ""
    fi
done

echo "✅ Verificação concluída!"
