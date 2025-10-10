#!/bin/bash

# Script para atualizar Node.js para versão 22
echo "🚀 Atualizando Node.js para versão 22..."

# Verificar se nvm está instalado
if ! command -v nvm &> /dev/null; then
    echo "❌ NVM não encontrado. Instalando NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Instalar Node.js 22
echo "📦 Instalando Node.js 22..."
nvm install 22
nvm use 22
nvm alias default 22

# Verificar versão
echo "✅ Node.js atualizado para:"
node --version
npm --version

# Reinstalar dependências
echo "🔄 Reinstalando dependências..."
rm -rf node_modules package-lock.json
npm install

echo "🎉 Atualização concluída!"
echo "💡 Para usar Node.js 22 em novos terminais, execute: nvm use 22"
