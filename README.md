# Ifiok Udoma — personal website

Starter implementation based on the supplied `index.html` and confirmed content direction. Uses Next.js + TypeScript + Supabase. Contact email: **udomaifiok0@gmail.com**.

## Run locally
1. Install Node.js LTS.
2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and anon/publishable key. Never put a service-role key in browser-visible variables.
3. Run `npm install`, then `npm run dev`.

Without Supabase environment values, the public pages render using sample portfolio content; admin and live content management require Supabase setup.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. In Authentication, disable public signups; create your owner user manually with `udomaifiok0@gmail.com`.
4. In SQL Editor, replace `YOUR_OWNER_AUTH_USER_UUID` in the owner-policy section with the UUID shown for your user, then run that owner-policy block. Do not enable owner policies before replacing the placeholder.
5. Enable MFA in Supabase Auth settings where available and enroll your account.
6. Create a private Storage bucket named `site-media`; use the policies in `supabase/storage-policies.sql` after replacing the same UUID.
7. Add environment variables to the deployment provider.

## Deployment note
This starter is designed for Cloudflare Workers with the OpenNext adapter for Next.js. Follow current Cloudflare Next.js deployment documentation when deploying; do not deploy this as a static-only site because `/admin` and server-side auth need server functionality. A temporary `*.workers.dev` URL can be used before buying a domain.

## Security boundaries
- Supabase Row Level Security protects content writes and draft visibility.
- Never expose service-role keys.
- No public sign-up; create the owner account manually.
- Validate media type and size in the upload UI; keep the bucket private and use signed URLs for private files.
- MFA availability depends on project configuration and plan.
- Before public launch, test anonymous draft access, owner-only writes, upload restrictions, MFA, backups and production build.

## Initial content
Sample portfolio content is clearly marked by status (built / in progress / concept). Replace or edit it in the admin after backend setup. No fake articles are preloaded.

## Your image assets
- `/public/images/ifiok-udoma-logo.png` — supplied IU flame monogram.
- `/public/images/ifiok-udoma-portrait.jpg` — supplied professional portrait.

## Create the local environment file
In the project root (the same folder as `package.json`), copy `.env.local.template` to `.env.local`. Replace the URL and key placeholders with your own project's values from Supabase Project Settings → API. Keep `.env.local` local; it is ignored by Git. Never paste secrets into chat or commit `.env.local`.
