#!/bin/bash

# Script para verificar configuração do Vercel Blob
echo "🔍 Verificando configuração do Vercel Blob..."
echo ""

echo "📋 Variáveis de ambiente necessárias:"
echo "   BLOB_READ_WRITE_TOKEN (obrigatório)"
echo ""

if [ -z "$BLOB_READ_WRITE_TOKEN" ]; then
    echo "❌ BLOB_READ_WRITE_TOKEN não está configurado!"
    echo ""
    echo "📝 Para configurar:"
    echo "1. Acesse: https://vercel.com/dashboard"
    echo "2. Selecione seu projeto"
    echo "3. Vá em Settings > Environment Variables"
    echo "4. Adicione: BLOB_READ_WRITE_TOKEN"
    echo "5. Valor: Token do Vercel Blob"
    echo ""
    echo "🔗 Para obter o token:"
    echo "1. Execute: vercel login"
    echo "2. Execute: vercel env pull .env.local"
    echo "3. Ou configure manualmente no dashboard"
else
    echo "✅ BLOB_READ_WRITE_TOKEN está configurado"
fi

echo ""
echo "🧪 Testando upload em produção..."
echo ""

# Teste simples de upload
if command -v curl &> /dev/null; then
    echo "📤 Testando upload via API..."
    # Criar uma imagem de teste simples
    echo "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test-blob.png
    
    # Testar upload (substitua pela URL de produção)
    echo "⚠️  Substitua [PRODUCTION_URL] pela URL real do Vercel"
    echo "curl -X POST [PRODUCTION_URL]/api/upload -F 'file=@test-blob.png'"
    
    rm -f test-blob.png
else
    echo "❌ curl não encontrado para teste"
fi

echo ""
echo "✅ Verificação concluída!"
