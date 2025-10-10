#!/bin/bash

# Script para verificar o build do Vercel
echo "🔍 Verificando configuração do build do Vercel..."
echo ""

echo "📋 Arquivos de configuração:"
echo ""

echo "📄 vercel.json:"
cat vercel.json | jq '.' 2>/dev/null || cat vercel.json

echo ""
echo "📄 package.json (engines):"
grep -A 3 "engines" package.json

echo ""
echo "📄 .nvmrc:"
cat .nvmrc 2>/dev/null || echo "Arquivo não encontrado"

echo ""
echo "📄 .vercelignore (últimas linhas):"
tail -5 .vercelignore

echo ""
echo "🧪 Testando build local..."
if npm run build; then
    echo "✅ Build local bem-sucedido!"
else
    echo "❌ Build local falhou!"
fi

echo ""
echo "✅ Verificação concluída!"
