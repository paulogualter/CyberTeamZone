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
