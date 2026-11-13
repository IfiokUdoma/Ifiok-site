# Deployment checklist

- [ ] Configure Supabase project, owner account and RLS policies.
- [ ] Add environment variables to deployment platform.
- [ ] Use Cloudflare Workers + OpenNext adapter for server-rendered Next.js; follow current official Cloudflare guide.
- [ ] Deploy preview and verify `/admin` redirects when logged out.
- [ ] Verify anonymous users cannot read drafts or write content.
- [ ] Enable MFA and test recovery before publishing.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
- [ ] Add original portrait/logo assets and check licensing/alt text.
- [ ] Connect public published-content queries to Insight and Build before treating CMS publishing as fully end-to-end.
- [ ] Test backups and restore path.
