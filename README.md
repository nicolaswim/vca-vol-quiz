# NEN 3140 & VCA Quiz App

This is a Progressive Web App (PWA) built with Next.js, Tailwind CSS, and Prisma. It uses the Leitner Spaced Repetition system to help you memorize safety legislation.

## Local Development
1. Install dependencies: \`npm install\`
2. Set up database: \`npx prisma db push\`
3. Seed the database: \`node prisma/seed.mjs\`
4. Run the development server: \`npm run dev\`

## Deployment to Vercel
1. Push this repository to GitHub.
2. Import the repository in your Vercel Dashboard.
3. In the Vercel project settings, go to **Storage** and create a new **Postgres** database.
4. Update your `prisma/schema.prisma` to use \`provider = "postgresql"\` and use the Vercel connection string.
5. Deploy the app.
