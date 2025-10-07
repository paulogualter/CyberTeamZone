# 🚀 Deploy Estático no Apache - Hostinger Hospedagem Compartilhada

## 📋 Pré-requisitos

- Hospedagem compartilhada Hostinger com Apache
- Acesso ao File Manager (hPanel)
- Banco de dados MySQL (se disponível)
- Domínio configurado

## ⚠️ Limitações da Hospedagem Compartilhada

- **Sem Node.js/npm**: Não é possível executar aplicações Next.js
- **Sem acesso SSH**: Apenas File Manager
- **Sem PM2**: Sem gerenciamento de processos
- **Apenas Apache**: Sem Nginx ou configurações avançadas
- **Recursos limitados**: CPU e memória compartilhados

## 🔄 Estratégia de Deploy Estático

Como não podemos executar Next.js, vamos criar uma versão estática que funcione apenas com Apache:

### 1. **Páginas Estáticas**: HTML/CSS/JS puros
### 2. **API Externa**: Usar Vercel/Netlify para APIs
### 3. **Banco de Dados**: MySQL via PHP (se disponível)
### 4. **Autenticação**: Via API externa

## 🚀 Opções de Deploy

### **Opção 1: Deploy Híbrido (Recomendado)**

1. **Frontend Estático**: Na Hostinger (Apache)
2. **Backend/API**: No Vercel (gratuito)
3. **Banco de Dados**: PlanetScale (gratuito)

### **Opção 2: Deploy Completo no Vercel**

1. **Toda aplicação**: No Vercel
2. **Domínio personalizado**: Apontar para Vercel
3. **Banco de Dados**: PlanetScale

### **Opção 3: Deploy Estático Puro**

1. **Páginas estáticas**: HTML/CSS/JS
2. **Funcionalidades limitadas**: Sem autenticação dinâmica
3. **Formulários**: Via serviços externos (Formspree, Netlify Forms)

## 🔧 Implementação da Opção 1 (Híbrida)

### Passo 1: Deploy do Backend no Vercel

1. **Conectar repositório ao Vercel**:
   - Acesse [Vercel](https://vercel.com)
   - Conecte sua conta GitHub
   - Importe o repositório `paulogualter/CyberTeamZone`

2. **Configurar variáveis de ambiente no Vercel**:
   ```env
   DATABASE_URL="mysql://usuario:senha@host:porta/database"
   NEXTAUTH_URL="https://seu-app.vercel.app"
   NEXTAUTH_SECRET="seu-secret-aqui"
   GOOGLE_CLIENT_ID="seu-google-client-id"
   GOOGLE_CLIENT_SECRET="seu-google-client-secret"
   STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. **Deploy automático**: O Vercel fará o build e deploy automaticamente

### Passo 2: Criar Frontend Estático para Hostinger

Vou criar um frontend estático que se comunica com a API do Vercel:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberTeam.Zone</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body class="bg-gray-900 text-white">
    <!-- Header -->
    <header class="bg-slate-800 shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-blue-400">CyberTeam.Zone</h1>
                <nav class="hidden md:flex space-x-6">
                    <a href="#cursos" class="hover:text-blue-400">Cursos</a>
                    <a href="#sobre" class="hover:text-blue-400">Sobre</a>
                    <a href="#contato" class="hover:text-blue-400">Contato</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-5xl font-bold mb-6">Aprenda Cibersegurança</h2>
            <p class="text-xl mb-8">Cursos especializados em segurança da informação</p>
            <a href="https://seu-app.vercel.app/auth/signin" 
               class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                Começar Agora
            </a>
        </div>
    </section>

    <!-- Cursos Section -->
    <section id="cursos" class="py-20">
        <div class="container mx-auto px-4">
            <h3 class="text-3xl font-bold text-center mb-12">Nossos Cursos</h3>
            <div class="grid md:grid-cols-3 gap-8" id="cursos-container">
                <!-- Os cursos serão carregados via JavaScript -->
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-800 py-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2024 CyberTeam.Zone. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script>
        // Configuração da API
        const API_URL = 'https://seu-app.vercel.app/api';
        
        // Carregar cursos
        async function loadCursos() {
            try {
                const response = await fetch(`${API_URL}/courses`);
                const cursos = await response.json();
                
                const container = document.getElementById('cursos-container');
                container.innerHTML = cursos.map(curso => `
                    <div class="bg-slate-700 rounded-lg p-6">
                        <h4 class="text-xl font-semibold mb-2">${curso.title}</h4>
                        <p class="text-gray-300 mb-4">${curso.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-blue-400 font-bold">R$ ${curso.price}</span>
                            <a href="https://seu-app.vercel.app/course/${curso.id}" 
                               class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                Ver Curso
                            </a>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
            }
        }
        
        // Carregar cursos quando a página carregar
        document.addEventListener('DOMContentLoaded', loadCursos);
    </script>
</body>
</html>
```

### Passo 3: Configurar Domínio Personalizado

1. **No Vercel**:
   - Vá em Settings → Domains
   - Adicione seu domínio da Hostinger
   - Configure os DNS

2. **Na Hostinger**:
   - Configure DNS para apontar para o Vercel
   - Ou use redirecionamento 301

## 🔧 Script de Geração de Frontend Estático

Vou criar um script que gera o frontend estático:

```bash
#!/bin/bash
set -euo pipefail

echo "🚀 Gerando Frontend Estático para Apache"
echo "========================================"

# Criar diretório para frontend estático
mkdir -p static-frontend

# Criar index.html
cat > static-frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberTeam.Zone - Cibersegurança</title>
    <meta name="description" content="Aprenda cibersegurança com cursos especializados">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body class="bg-gray-900 text-white">
    <!-- Header -->
    <header class="bg-slate-800 shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <h1 class="text-2xl font-bold text-blue-400">CyberTeam.Zone</h1>
                </div>
                <nav class="hidden md:flex space-x-6">
                    <a href="#cursos" class="hover:text-blue-400 transition-colors">Cursos</a>
                    <a href="#sobre" class="hover:text-blue-400 transition-colors">Sobre</a>
                    <a href="#contato" class="hover:text-blue-400 transition-colors">Contato</a>
                    <a href="https://seu-app.vercel.app/auth/signin" 
                       class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Entrar
                    </a>
                </nav>
                <button class="md:hidden" onclick="toggleMobileMenu()">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-5xl font-bold mb-6">Aprenda Cibersegurança</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto">
                Cursos especializados em segurança da informação, 
                hacking ético e proteção de dados
            </p>
            <div class="space-x-4">
                <a href="https://seu-app.vercel.app/auth/signin" 
                   class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                    Começar Agora
                </a>
                <a href="#cursos" 
                   class="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
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
        const API_URL = 'https://seu-app.vercel.app/api';
        
        // Função para alternar menu mobile
        function toggleMobileMenu() {
            // Implementar toggle do menu mobile
        }
        
        // Carregar cursos
        async function loadCursos() {
            try {
                const response = await fetch(`${API_URL}/courses`);
                if (!response.ok) throw new Error('Erro ao carregar cursos');
                
                const data = await response.json();
                const cursos = data.courses || data;
                
                const container = document.getElementById('cursos-container');
                container.innerHTML = cursos.map(curso => `
                    <div class="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors">
                        <h4 class="text-xl font-semibold mb-2">${curso.title}</h4>
                        <p class="text-gray-300 mb-4 line-clamp-3">${curso.description || curso.shortDescription || 'Descrição não disponível'}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-blue-400 font-bold">R$ ${curso.price || '0,00'}</span>
                            <a href="https://seu-app.vercel.app/course/${curso.id}" 
                               class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
                                Ver Curso
                            </a>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                const container = document.getElementById('cursos-container');
                container.innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        <p>Erro ao carregar cursos. Tente novamente mais tarde.</p>
                        <a href="https://seu-app.vercel.app" 
                           class="text-blue-400 hover:underline mt-2 inline-block">
                            Acessar aplicação completa
                        </a>
                    </div>
                `;
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

# Criar .htaccess
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
EOF

# Criar página 404
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

echo "✅ Frontend estático gerado em: static-frontend/"
echo "📋 Próximos passos:"
echo "1. Faça upload da pasta static-frontend/ para public_html na Hostinger"
echo "2. Configure o domínio para apontar para o Vercel (backend)"
echo "3. Atualize a URL da API no index.html"
echo "4. Configure SSL no painel da Hostinger"
EOF

chmod +x static-frontend.sh
```

## 🚀 Deploy Rápido

### 1. **Deploy do Backend no Vercel** (5 minutos)
- Conecte o repositório ao Vercel
- Configure as variáveis de ambiente
- Deploy automático

### 2. **Deploy do Frontend na Hostinger** (2 minutos)
- Faça upload da pasta `static-frontend/` para `public_html`
- Configure SSL no painel
- Pronto!

## 💡 Vantagens desta Abordagem

- ✅ **Funciona na Hostinger**: Apenas Apache necessário
- ✅ **Performance**: Frontend estático é muito rápido
- ✅ **SEO**: Páginas estáticas são ótimas para SEO
- ✅ **Custo**: Vercel gratuito + Hostinger barato
- ✅ **Escalabilidade**: Fácil de escalar
- ✅ **Manutenção**: Simples de manter

## 🔧 Próximos Passos

1. **Execute o script de geração**:
   ```bash
   bash static-frontend.sh
   ```

2. **Deploy no Vercel**:
   - Conecte o repositório
   - Configure as variáveis
   - Deploy automático

3. **Deploy na Hostinger**:
   - Upload da pasta `static-frontend/`
   - Configure SSL
   - Atualize a URL da API

Quer que eu crie o script de geração do frontend estático agora?
