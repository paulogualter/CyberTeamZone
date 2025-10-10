# Google OAuth Configuration

## URLs de Redirecionamento Necessárias

### Desenvolvimento Local
- http://localhost:3000/api/auth/callback/google
- http://localhost:3001/api/auth/callback/google
- http://localhost:3002/api/auth/callback/google
- http://localhost:3003/api/auth/callback/google
- http://localhost:3004/api/auth/callback/google
- http://localhost:3005/api/auth/callback/google

### Produção (Vercel)
- https://cyber-team-zone.vercel.app/api/auth/callback/google
- https://cyber-team-zone-git-main-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google
- https://cyber-team-zone-pz2phpqj0-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google
- https://cyber-team-zone-bigzydona-paulogualter-gmailcoms-projects.vercel.app/api/auth/callback/google

### Domínio Personalizado
- https://cyberteam.zone/api/auth/callback/google

## Problemas Identificados

1. **URIs 9 e 12 estão truncadas** no Google Console
2. **Faltam as URLs completas** com `/api/auth/callback/google`
3. **URLs do Vercel podem mudar** a cada deploy

## Solução

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu projeto
3. Clique no OAuth 2.0 Client ID
4. Em 'Authorized redirect URIs', adicione/corrija as URLs acima
5. **IMPORTANTE**: Complete as URLs truncadas (9 e 12) com `/api/auth/callback/google`
6. Salve as alterações

## Verificação da URL Atual do Vercel

Para obter a URL atual do seu projeto no Vercel:
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto 'cyber-team-zone'
3. Copie a URL de produção
4. Adicione `/api/auth/callback/google` no final
5. Configure no Google Console

## Teste

Após configurar, teste o login OAuth em:
- Desenvolvimento: http://localhost:3000/auth/signin
- Produção: https://[sua-url-vercel]/auth/signin
