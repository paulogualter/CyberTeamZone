#!/bin/bash

# Script para criar aulas usando o endpoint de debug simples
# Este script usa o endpoint que já sabemos que funciona

echo "🔍 Testando criação de aula usando endpoint de debug..."

# Primeiro, vamos verificar se o módulo existe
echo "📚 Verificando módulo..."
MODULE_RESPONSE=$(curl -s "https://www.cyberteam.zone/api/debug/simple?test=specific-module")

echo "📊 Resposta do módulo:"
echo "$MODULE_RESPONSE" | jq .

# Verificar se o módulo foi encontrado
MODULE_FOUND=$(echo "$MODULE_RESPONSE" | jq -r '.debug.tests.specificModule.found')

if [ "$MODULE_FOUND" = "true" ]; then
    echo "✅ Módulo encontrado!"
    
    # Agora vamos tentar criar uma aula usando o endpoint admin lessons
    echo "🔗 Tentando criar aula..."
    
    LESSON_DATA='{
        "title": "Aula de Teste",
        "description": "Descrição da aula de teste",
        "content": "Conteúdo da aula de teste",
        "moduleId": "module_1760134320837_r7frihu3"
    }'
    
    LESSON_RESPONSE=$(curl -s -X POST "https://www.cyberteam.zone/api/admin/lessons" \
        -H "Content-Type: application/json" \
        -d "$LESSON_DATA")
    
    echo "📊 Resposta da criação de aula:"
    echo "$LESSON_RESPONSE" | jq .
    
    # Verificar se foi criada com sucesso
    SUCCESS=$(echo "$LESSON_RESPONSE" | jq -r '.success // false')
    
    if [ "$SUCCESS" = "true" ]; then
        echo "✅ Aula criada com sucesso!"
        LESSON_ID=$(echo "$LESSON_RESPONSE" | jq -r '.lesson.id')
        echo "🆔 ID da aula: $LESSON_ID"
    else
        echo "❌ Erro ao criar aula:"
        echo "$LESSON_RESPONSE" | jq -r '.error // "Erro desconhecido"'
    fi
    
else
    echo "❌ Módulo não encontrado!"
fi

echo "🏁 Script concluído."
