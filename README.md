# CyberTeam.Zone - LMS de Cibersegurança

Sistema de gerenciamento de aprendizado (LMS) especializado em cibersegurança, desenvolvido com Next.js 14, TypeScript e Prisma.

## 🚀 Funcionalidades

### 👥 Gestão de Usuários
- **Autenticação**: Login com Google OAuth e credenciais
- **Roles**: Estudante, Instrutor, Administrador
- **Perfis**: Gestão completa de usuários e instrutores
- **Sincronização**: Automática entre tabelas User e Instructor

### 📚 Sistema de Cursos
- **Tipos de Curso**: Gravado, Online, Híbrido
- **Data de Início**: Obrigatória para cursos Online/Híbridos
- **Categorias**: 15+ categorias de cibersegurança
- **Dificuldade**: Iniciante, Intermediário, Avançado, Expert
- **Conteúdo**: Módulos, aulas, anexos, avaliações

### 💰 Monetização
- **Planos**: Basic, Gold, Diamond
- **Escudos**: Moeda virtual do sistema
- **Pagamentos**: Stripe (cartão/PIX)
- **Assinaturas**: Mensais com benefícios diferenciados

### 🎯 Área do Instrutor
- **Dashboard**: Visão geral dos cursos
- **Criação**: Cursos, módulos, aulas
- **Gestão**: Edição e publicação de conteúdo
- **Estatísticas**: Alunos inscritos, progresso

### 👑 Área Administrativa
- **Usuários**: Gestão completa de usuários
- **Cursos**: Aprovação e moderação
- **Relatórios**: Estatísticas do sistema
- **Configurações**: Categorias, badges, planos

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: MySQL
- **Autenticação**: NextAuth.js
- **Pagamentos**: Stripe
- **UI**: Framer Motion, Heroicons
- **Deploy**: Vercel (recomendado)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/paulogualter/CyberTeamZone.git
cd CyberTeamZone
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Database (Hostinger exemplo)
DATABASE_URL="mysql://cyberteamlms:cyberteamLms@localhost:3306/cyberteamlms"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Configure o banco de dados
```bash
# Aplicar migrações
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Popular dados iniciais
node scripts/setup-database.js
node scripts/seed-secure-data.js
```

### 5. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas
- **User**: Usuários do sistema
- **Instructor**: Instrutores e seus perfis
- **Course**: Cursos e conteúdo
- **Module**: Módulos dos cursos
- **Lesson**: Aulas individuais
- **Enrollment**: Inscrições de usuários
- **Payment**: Transações financeiras
- **Category**: Categorias de cursos

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Configure o banco de dados MySQL
4. Execute as migrações no banco de produção

### Outras Plataformas
- **Railway**: Para banco de dados e deploy
- **PlanetScale**: Para banco de dados MySQL
- **Supabase**: Alternativa com PostgreSQL

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint

# Banco de dados
npx prisma studio
npx prisma db push
npx prisma generate

# Scripts personalizados
node scripts/setup-database.js
node scripts/seed-secure-data.js
node scripts/sync-instructors.js
node scripts/promote-to-instructor.js email@usuario.com
node scripts/make-user-admin.js email@usuario.com
```

## 🔐 Segurança

- **IDs Seguros**: CUIDs em vez de IDs sequenciais
- **Autenticação**: NextAuth.js com JWT
- **Autorização**: Middleware de proteção de rotas
- **Validação**: Validação de dados em todas as APIs
- **Criptografia**: Senhas com bcrypt

## 📊 Funcionalidades Avançadas

### Para Instrutores
- Criação automática de perfil na tabela Instructor
- Upload de imagens de capa dos cursos
- Gestão de módulos e aulas
- Anexos em aulas
- Avaliações e CTFs

### Para Administradores
- Acesso total sem restrições de planos
- Gestão completa de usuários
- Moderação de conteúdo
- Relatórios e estatísticas

### Para Estudantes
- Catálogo de cursos
- Área de membros unificada
- Progresso de cursos
- Sistema de escudos
- Certificados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Paulo Gualter**
- GitHub: [@paulogualter](https://github.com/paulogualter)
- LinkedIn: [Paulo Gualter](https://linkedin.com/in/paulogualter)

## 🙏 Agradecimentos

- Next.js Team
- Prisma Team
- Vercel Team
- Comunidade Open Source

---

**CyberTeam.Zone** - Transformando o futuro da cibersegurança através da educação! 🛡️