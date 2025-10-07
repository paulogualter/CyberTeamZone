# CyberTeam Zone

## Deploy Status
- ✅ Next.js 14.0.4
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Supabase Integration
- ✅ Stripe Integration
- ✅ NextAuth.js

## Build Configuration
- Root Directory: `.` (raiz)
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

## Project Structure
```
/
├── package.json          # ← Root package.json
├── next.config.js
├── vercel.json
├── app/
├── components/
├── lib/
└── public/
```

**Last Updated**: $(date)# Force Vercel to use latest commit
