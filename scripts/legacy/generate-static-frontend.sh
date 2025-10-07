#!/bin/bash
set -euo pipefail

echo "🚀 Gerando Frontend Estático para Apache (Hostinger)"
echo "===================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Variáveis de configuração
API_URL="${1:-https://seu-app.vercel.app/api}"
DOMAIN="${2:-seu-dominio.com}"

echo "📋 Configuração:"
echo "  - API URL: $API_URL"
echo "  - Domínio: $DOMAIN"
echo ""

# 1. Criar diretório para frontend estático
echo "📁 Criando diretório para frontend estático..."
rm -rf static-frontend
mkdir -p static-frontend

# 2. Criar index.html principal
echo "📄 Criando index.html..."
cat > static-frontend/index.html << EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberTeam.Zone - Cibersegurança</title>
    <meta name="description" content="Aprenda cibersegurança com cursos especializados em segurança da informação, hacking ético e proteção de dados">
    <meta name="keywords" content="cibersegurança, segurança da informação, hacking ético, cursos online, cyberteam">
    <meta name="author" content="CyberTeam.Zone">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://$DOMAIN/">
    <meta property="og:title" content="CyberTeam.Zone - Cibersegurança">
    <meta property="og:description" content="Aprenda cibersegurança com cursos especializados">
    <meta property="og:image" content="https://$DOMAIN/images/og-image.jpg">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://$DOMAIN/">
    <meta property="twitter:title" content="CyberTeam.Zone - Cibersegurança">
    <meta property="twitter:description" content="Aprenda cibersegurança com cursos especializados">
    <meta property="twitter:image" content="https://$DOMAIN/images/og-image.jpg">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    
    <!-- CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    
    <!-- Custom CSS -->
    <style>
        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .gradient-text {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Header -->
    <header class="bg-slate-800 shadow-lg sticky top-0 z-50" x-data="{ mobileMenuOpen: false }">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <h1 class="text-2xl font-bold gradient-text">CyberTeam.Zone</h1>
                </div>
                <nav class="hidden md:flex space-x-6">
                    <a href="#cursos" class="hover:text-blue-400 transition-colors duration-200">Cursos</a>
                    <a href="#sobre" class="hover:text-blue-400 transition-colors duration-200">Sobre</a>
                    <a href="#contato" class="hover:text-blue-400 transition-colors duration-200">Contato</a>
                    <a href="$API_URL/../auth/signin" 
                       class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        Entrar
                    </a>
                </nav>
                <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
            <!-- Mobile Menu -->
            <div x-show="mobileMenuOpen" x-transition class="md:hidden mt-4 pb-4">
                <div class="flex flex-col space-y-2">
                    <a href="#cursos" class="hover:text-blue-400 transition-colors duration-200">Cursos</a>
                    <a href="#sobre" class="hover:text-blue-400 transition-colors duration-200">Sobre</a>
                    <a href="#contato" class="hover:text-blue-400 transition-colors duration-200">Contato</a>
                    <a href="$API_URL/../auth/signin" 
                       class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-center">
                        Entrar
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-5xl font-bold mb-6 animate-fade-in">Aprenda Cibersegurança</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto animate-fade-in">
                Cursos especializados em segurança da informação, 
                hacking ético e proteção de dados
            </p>
            <div class="space-x-4 animate-fade-in">
                <a href="$API_URL/../auth/signin" 
                   class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block">
                    Começar Agora
                </a>
                <a href="#cursos" 
                   class="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block">
                    Ver Cursos
                </a>
            </div>
        </div>
    </section>

    <!-- Cursos Section -->
    <section id="cursos" class="py-20">
        <div class="container mx-auto px-4">
            <h3 class="text-3xl font-bold text-center mb-12">Nossos Cursos</h3>
            <div class="grid md:grid-cols-3 gap-8" id="cursos-container">
                <!-- Loading skeleton -->
                <div class="bg-slate-700 rounded-lg p-6 animate-pulse">
                    <div class="h-4 bg-gray-600 rounded mb-2"></div>
                    <div class="h-3 bg-gray-600 rounded mb-4"></div>
                    <div class="h-8 bg-gray-600 rounded"></div>
                </div>
                <div class="bg-slate-700 rounded-lg p-6 animate-pulse">
                    <div class="h-4 bg-gray-600 rounded mb-2"></div>
                    <div class="h-3 bg-gray-600 rounded mb-4"></div>
                    <div class="h-8 bg-gray-600 rounded"></div>
                </div>
                <div class="bg-slate-700 rounded-lg p-6 animate-pulse">
                    <div class="h-4 bg-gray-600 rounded mb-2"></div>
                    <div class="h-3 bg-gray-600 rounded mb-4"></div>
                    <div class="h-8 bg-gray-600 rounded"></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Sobre Section -->
    <section id="sobre" class="py-20 bg-slate-800">
        <div class="container mx-auto px-4">
            <h3 class="text-3xl font-bold text-center mb-12">Sobre Nós</h3>
            <div class="max-w-4xl mx-auto text-center">
                <p class="text-lg mb-6">
                    O CyberTeam.Zone é uma plataforma especializada em educação em cibersegurança, 
                    oferecendo cursos práticos e atualizados para profissionais e entusiastas da área.
                </p>
                <div class="grid md:grid-cols-3 gap-8 mt-12">
                    <div class="text-center">
                        <div class="text-4xl font-bold text-blue-400 mb-2">50+</div>
                        <div class="text-gray-300">Cursos Disponíveis</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                        <div class="text-gray-300">Alunos Ativos</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-blue-400 mb-2">98%</div>
                        <div class="text-gray-300">Satisfação</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contato Section -->
    <section id="contato" class="py-20">
        <div class="container mx-auto px-4">
            <h3 class="text-3xl font-bold text-center mb-12">Entre em Contato</h3>
            <div class="max-w-2xl mx-auto text-center">
                <p class="text-lg mb-8">
                    Tem dúvidas? Quer saber mais sobre nossos cursos? 
                    Entre em contato conosco!
                </p>
                <div class="space-y-4">
                    <div class="flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                        </svg>
                        <span>contato@cyberteam.zone</span>
                    </div>
                    <div class="flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Brasil</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-800 py-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 CyberTeam.Zone. Todos os direitos reservados.</p>
            <p class="text-sm text-gray-400 mt-2">
                Desenvolvido com ❤️ para a comunidade de cibersegurança
            </p>
        </div>
    </footer>

    <script>
        // Configuração da API
        const API_URL = '$API_URL';
        
        // Carregar cursos
        async function loadCursos() {
            try {
                const response = await fetch(\`\${API_URL}/courses\`);
                if (!response.ok) throw new Error('Erro ao carregar cursos');
                
                const data = await response.json();
                const cursos = data.courses || data;
                
                const container = document.getElementById('cursos-container');
                container.innerHTML = cursos.map(curso => \`
                    <div class="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors duration-200 animate-fade-in">
                        <h4 class="text-xl font-semibold mb-2">\${curso.title}</h4>
                        <p class="text-gray-300 mb-4 line-clamp-3">\${curso.description || curso.shortDescription || 'Descrição não disponível'}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-blue-400 font-bold">R$ \${curso.price || '0,00'}</span>
                            <a href="\${API_URL}/../course/\${curso.id}" 
                               class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200">
                                Ver Curso
                            </a>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                const container = document.getElementById('cursos-container');
                container.innerHTML = \`
                    <div class="col-span-full text-center text-gray-400">
                        <p>Erro ao carregar cursos. Tente novamente mais tarde.</p>
                        <a href="\${API_URL}/.." 
                           class="text-blue-400 hover:underline mt-2 inline-block">
                            Acessar aplicação completa
                        </a>
                    </div>
                \`;
            }
        }
        
        // Carregar cursos quando a página carregar
        document.addEventListener('DOMContentLoaded', loadCursos);
        
        // Smooth scroll para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>
EOF

# 3. Criar .htaccess
echo "🔐 Criando .htaccess..."
cat > static-frontend/.htaccess << 'EOF'
# Apache configuration for static site
RewriteEngine On

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Custom error pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html

# Prevent access to sensitive files
<Files ".env*">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>
EOF

# 4. Criar página 404
echo "📄 Criando página 404..."
cat > static-frontend/404.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Não Encontrada - CyberTeam.Zone</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-blue-400 mb-4">404</h1>
            <h2 class="text-2xl font-semibold mb-4">Página Não Encontrada</h2>
            <p class="text-gray-400 mb-8">A página que você está procurando não existe.</p>
            <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                Voltar ao Início
            </a>
        </div>
    </div>
</body>
</html>
EOF

# 5. Criar página 500
echo "📄 Criando página 500..."
cat > static-frontend/500.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro Interno - CyberTeam.Zone</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-red-400 mb-4">500</h1>
            <h2 class="text-2xl font-semibold mb-4">Erro Interno do Servidor</h2>
            <p class="text-gray-400 mb-8">Algo deu errado. Tente novamente mais tarde.</p>
            <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                Voltar ao Início
            </a>
        </div>
    </div>
</body>
</html>
EOF

# 6. Criar robots.txt
echo "🤖 Criando robots.txt..."
cat > static-frontend/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://seu-dominio.com/sitemap.xml
EOF

# 7. Criar sitemap.xml
echo "🗺️ Criando sitemap.xml..."
cat > static-frontend/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://seu-dominio.com/</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://seu-dominio.com/#cursos</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://seu-dominio.com/#sobre</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://seu-dominio.com/#contato</loc>
        <lastmod>2024-01-01</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>
EOF

# 8. Criar README para deploy
echo "📖 Criando README para deploy..."
cat > static-frontend/README-DEPLOY.md << 'EOF'
# 🚀 Deploy Frontend Estático - Hostinger

## 📋 Arquivos Incluídos

- `index.html` - Página principal
- `404.html` - Página de erro 404
- `500.html` - Página de erro 500
- `.htaccess` - Configuração Apache
- `robots.txt` - Configuração para buscadores
- `sitemap.xml` - Mapa do site

## 🚀 Deploy Rápido

### 1. Upload dos Arquivos
- Faça upload de **TODOS** os arquivos para `public_html` na Hostinger
- Mantenha a estrutura de pastas

### 2. Configurar Domínio
- Configure o domínio no painel da Hostinger
- Ative SSL (HTTPS)

### 3. Atualizar URLs
- Edite `index.html` e atualize a URL da API
- Substitua `https://seu-app.vercel.app/api` pela URL real da sua API

### 4. Testar
- Acesse o domínio no navegador
- Verifique se os cursos carregam corretamente
- Teste os links de navegação

## 🔧 Configuração da API

A aplicação se conecta com uma API externa (Vercel) para carregar os cursos dinamicamente.

### URLs que precisam ser atualizadas:
- `API_URL` no JavaScript
- Links para autenticação
- Links para cursos individuais

## 📱 Recursos Incluídos

- ✅ Design responsivo
- ✅ Carregamento dinâmico de cursos
- ✅ Navegação suave
- ✅ SEO otimizado
- ✅ Headers de segurança
- ✅ Cache otimizado
- ✅ Compressão Gzip
- ✅ Páginas de erro personalizadas

## 🆘 Troubleshooting

### Cursos não carregam
- Verifique se a URL da API está correta
- Verifique se a API está funcionando
- Verifique o console do navegador para erros

### Erro 404
- Verifique se o arquivo `index.html` está na raiz
- Verifique as permissões dos arquivos

### Erro 500
- Verifique se o `.htaccess` está correto
- Verifique os logs do servidor

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs do servidor
2. Teste a API externa
3. Verifique as configurações do Apache
EOF

# 9. Criar script de atualização
echo "📝 Criando script de atualização..."
cat > static-frontend/update-api-url.sh << 'EOF'
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
EOF

chmod +x static-frontend/update-api-url.sh

# 10. Criar arquivo de configuração
echo "⚙️ Criando arquivo de configuração..."
cat > static-frontend/config.json << EOF
{
  "apiUrl": "$API_URL",
  "domain": "$DOMAIN",
  "version": "1.0.0",
  "lastUpdated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "features": {
    "dynamicCourses": true,
    "responsiveDesign": true,
    "seoOptimized": true,
    "securityHeaders": true,
    "caching": true,
    "compression": true
  }
}
EOF

echo "✅ Frontend estático gerado com sucesso!"
echo ""
echo "📁 Arquivos criados em: static-frontend/"
echo "📋 Próximos passos:"
echo "1. Faça upload da pasta static-frontend/ para public_html na Hostinger"
echo "2. Configure o domínio e SSL no painel da Hostinger"
echo "3. Atualize a URL da API: ./update-api-url.sh https://sua-api-real.com/api"
echo "4. Teste a aplicação no navegador"
echo ""
echo "📁 Arquivos incluídos:"
echo "  - index.html (página principal)"
echo "  - 404.html (página de erro 404)"
echo "  - 500.html (página de erro 500)"
echo "  - .htaccess (configuração Apache)"
echo "  - robots.txt (configuração SEO)"
echo "  - sitemap.xml (mapa do site)"
echo "  - update-api-url.sh (script de atualização)"
echo "  - config.json (configuração)"
echo "  - README-DEPLOY.md (instruções de deploy)"
echo ""
echo "🌐 Para mais detalhes, consulte: APACHE_STATIC_DEPLOY.md"
