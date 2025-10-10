#!/usr/bin/env node

/**
 * Script para migrar imagens existentes do sistema de arquivos para o banco de dados
 * 
 * Uso: node scripts/migrate-images-to-db.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateImages() {
  console.log('🚀 Iniciando migração de imagens para o banco de dados...')
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Diretório de uploads não encontrado:', uploadsDir)
    return
  }

  const files = fs.readdirSync(uploadsDir)
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
  )

  console.log(`📁 Encontradas ${imageFiles.length} imagens para migrar`)

  let successCount = 0
  let errorCount = 0

  for (const filename of imageFiles) {
    try {
      const filePath = path.join(uploadsDir, filename)
      const fileBuffer = fs.readFileSync(filePath)
      const fileStats = fs.statSync(filePath)
      
      // Determinar MIME type baseado na extensão
      const extension = path.extname(filename).toLowerCase()
      let mimeType = 'application/octet-stream'
      
      switch (extension) {
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg'
          break
        case '.png':
          mimeType = 'image/png'
          break
        case '.gif':
          mimeType = 'image/gif'
          break
        case '.webp':
          mimeType = 'image/webp'
          break
        case '.svg':
          mimeType = 'image/svg+xml'
          break
      }

      console.log(`📤 Migrando: ${filename} (${fileStats.size} bytes, ${mimeType})`)

      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('ImageStorage')
        .insert({
          filename: filename,
          originalName: filename,
          mimeType: mimeType,
          size: fileStats.size,
          data: fileBuffer.toString('base64'),
          uploadedBy: null // Não sabemos quem fez upload originalmente
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Erro ao migrar ${filename}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Migrado com sucesso: ${filename} -> ID: ${data.id}`)
        successCount++
        
        // Opcional: remover arquivo original após migração bem-sucedida
        // fs.unlinkSync(filePath)
        // console.log(`🗑️ Arquivo original removido: ${filename}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${filename}:`, error.message)
      errorCount++
    }
  }

  console.log('\n📊 Resumo da migração:')
  console.log(`✅ Sucessos: ${successCount}`)
  console.log(`❌ Erros: ${errorCount}`)
  console.log(`📁 Total processado: ${imageFiles.length}`)
  
  if (successCount > 0) {
    console.log('\n🎯 Próximos passos:')
    console.log('1. Teste as imagens migradas acessando /api/images/[id]')
    console.log('2. Atualize os componentes para usar DatabaseImage')
    console.log('3. Remova os arquivos originais se tudo estiver funcionando')
  }
}

// Executar migração
migrateImages().catch(console.error)
