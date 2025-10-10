#!/bin/bash

# Script para obter o token do Vercel Blob
echo "🔑 Obtendo token do Vercel Blob..."
echo ""

# Verificar se está logado
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Não está logado no Vercel. Execute: vercel login"
    exit 1
fi

echo "✅ Logado no Vercel como: $(vercel whoami)"
echo ""

# Obter informações do projeto
PROJECT_ID=$(vercel env ls --json | jq -r '.[0].projectId' 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Não foi possível obter o ID do projeto"
    exit 1
fi

echo "📋 ID do Projeto: $PROJECT_ID"
echo ""

# Tentar obter o token através da API
echo "🔍 Tentando obter token através da API do Vercel..."

# Obter token de acesso pessoal
ACCESS_TOKEN=$(vercel env ls --json | jq -r '.[0].accessToken' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Não foi possível obter token de acesso"
    echo ""
    echo "📝 Solução manual:"
    echo "1. Acesse: https://vercel.com/account/tokens"
    echo "2. Crie um novo token"
    echo "3. Execute: vercel env add BLOB_READ_WRITE_TOKEN"
    echo "4. Cole o token quando solicitado"
    exit 1
fi

echo "✅ Token de acesso obtido"
echo ""

# Tentar criar token do Blob
echo "🔧 Criando token do Vercel Blob..."

# Usar o token para criar um token do Blob
BLOB_TOKEN=$(curl -s -X POST "https://api.vercel.com/v1/blob/tokens" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"blob-upload-token","expiresIn":31536000}' | jq -r '.token' 2>/dev/null)

if [ -z "$BLOB_TOKEN" ] || [ "$BLOB_TOKEN" = "null" ]; then
    echo "❌ Não foi possível criar token do Blob automaticamente"
    echo ""
    echo "📝 Solução manual:"
    echo "1. Acesse: https://vercel.com/account/tokens"
    echo "2. Crie um novo token com escopo 'blob'"
    echo "3. Execute: vercel env add BLOB_READ_WRITE_TOKEN"
    echo "4. Cole o token quando solicitado"
    exit 1
fi

echo "✅ Token do Vercel Blob criado com sucesso!"
echo ""
echo "🔑 Token: $BLOB_TOKEN"
echo ""
echo "📋 Para adicionar ao projeto:"
echo "vercel env add BLOB_READ_WRITE_TOKEN"
echo ""
echo "💡 Cole o token acima quando solicitado"
