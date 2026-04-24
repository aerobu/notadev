export default {
  label: 'SaaS App',
  frontend: 'Next.js 14 (App Router)',
  backend: 'Next.js API Routes',
  database: 'PostgreSQL',
  orm: 'Prisma',
  auth: 'NextAuth.js',
  deployment: 'Vercel (frontend + API) + Neon (PostgreSQL)',
  rationale: 'Standard SaaS stack. Stripe handles billing. NextAuth handles multi-provider login. Vercel handles scaling.',
};
