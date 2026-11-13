# Update: public publishing and media uploads

This update connects published Supabase content to the public website and adds media uploads to the admin editor.

## Before using media uploads
1. Open Supabase Dashboard → SQL Editor.
2. Open `supabase/media-public-read.sql` from this project and run it.
3. This makes `site-media` a public bucket so media in published content can be viewed. Anyone with a file URL can view/download that file. Uploads/updates/deletes should remain restricted by your existing owner-only Storage policies.
4. Confirm `site-media` has the owner-only upload policy you already configured. Do not remove those policies.

## Install this update
1. Stop your local server with Ctrl+C.
2. Make a backup copy of your current project folder.
3. Extract this ZIP into a new folder, or copy its `src` and `supabase` folders over your existing project. Keep your existing `.env.local` file; it is intentionally not included.
4. Keep your existing `node_modules` and `package-lock.json` if present.
5. Run `npm run dev` and open `http://localhost:3000`.

## Where published content appears
- `article` and `publication`: `/insight`
- `teaching`: `/insight`, under Faith-based teaching
- `project` and `engineering`: `/build`, under Published updates
- Latest six published items: Home page
- Every published item also has a page at `/content/your-slug`

Only items with status `published` are queried for public pages. Draft and archived entries remain hidden.

## Media in the editor
Choose a file in the Media library section. Supported: images, video, audio and PDFs. Images/audio/PDFs are limited in the interface to 20 MB; videos to 50 MB. Uploads are inserted into the body automatically. Image uploads also populate the cover-image URL field. Save the content after uploading.

Markdown body syntax used by uploaded media:
- Images: `![alt text](PUBLIC_URL)`
- Video: `@[video](PUBLIC_URL)`
- Audio: `@[audio](PUBLIC_URL)`
- PDF: `[PDF: filename.pdf](PUBLIC_URL)`

## Verification
`npm run lint` (TypeScript check) passed in the prepared project. A full Next.js production build could not be completed in the preparation environment because Next.js attempted to download its Linux SWC binary and network access was unavailable. Run `npm run build` on your Windows machine after applying the update if you want to verify the production build there.
