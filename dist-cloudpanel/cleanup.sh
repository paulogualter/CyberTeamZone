#!/bin/bash
set -euo pipefail

echo "🧹 Limpando arquivos desnecessários..."

# Remover arquivos de desenvolvimento
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf logs/*.log

# Remover arquivos temporários
find . -name "*.tmp" -delete
find . -name "*.temp" -delete

# Remover arquivos de backup
find . -name "*.backup" -delete
find . -name "*.bak" -delete

# Limpar logs antigos
find logs -name "*.log" -mtime +7 -delete

echo "✅ Limpeza concluída!"
