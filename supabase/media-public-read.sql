-- Run this in Supabase SQL Editor after confirming the site-media bucket exists.
-- Media uploaded here is intended for use in public, published website content.
-- Anyone who has a file URL can view/download that file; only your existing owner policies allow uploads/changes/deletion.
update storage.buckets set public = true where id = 'site-media';
