const fs = require('fs')
const path = require('path')

// Criar imagens placeholder simples
const createPlaceholderImage = (filename, width = 400, height = 300, color = '4F46E5') => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#${color}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${filename.replace('.jpg', '').replace('-', ' ').toUpperCase()}</text>
  </svg>`
  
  const filePath = path.join(__dirname, '..', 'public', 'images', filename)
  fs.writeFileSync(filePath, svg)
  console.log(`✅ Criada imagem: ${filename}`)
}

// Criar as imagens que estão faltando
const images = [
  'network-defense.jpg',
  'curso-basico.jpg', 
  'web-app-security.jpg'
]

console.log('🖼️ Criando imagens placeholder...')

images.forEach(image => {
  createPlaceholderImage(image)
})

console.log('✅ Todas as imagens placeholder foram criadas!')
