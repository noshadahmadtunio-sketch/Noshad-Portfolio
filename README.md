# Noshad Ali — Portfolio Website

A responsive React + Vite portfolio with a private Google-login admin panel.

## Requirements
- Node.js 20.19+ or 22.12+
- A Supabase project
- A Google account for the site administrator

## 1. Install
Open this folder in VS Code, then open its terminal:

```bash
npm install
```

## 2. Create Supabase project
1. Create a project at https://supabase.com/
2. Open **Project Settings → API** and copy the Project URL and `anon` / publishable key.
3. Copy `.env.example` to a new file named `.env`.
4. Add your Supabase URL and anon key to `.env`. Keep the anon key; NEVER put a `service_role` key in frontend code.
5. Set `VITE_SITE_URL=http://localhost:5173` while testing.

## 3. Set up database and secure admin access
1. In Supabase, open **SQL Editor**.
2. Paste and run all SQL from `supabase/schema.sql`.
3. In **Authentication → Providers**, enable Google.
4. Configure Google OAuth credentials in Google Cloud Console and paste the Client ID and Client Secret into Supabase's Google provider settings.
5. In Supabase **Authentication → URL Configuration**, add:
   - `http://localhost:5173` to Site URL / allowed redirect URLs.
   - Your eventual deployed URL (for example `https://your-site.vercel.app`) to allowed redirect URLs.
6. Start the app and sign in once with your Google account.
7. In Supabase **Authentication → Users**, copy the UUID for your Google account.
8. In SQL Editor, run this, replacing the example UUID:
   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR-AUTH-USER-UUID');
   ```
   Only this allowlisted account can edit the website. Do not add anyone else's UUID.

## 4. Run locally
```bash
npm run dev
```
Open the local address Vite prints (usually http://localhost:5173).

## 5. Publish with Vercel
1. Push this project to a private or public GitHub repository.
2. Import the repository at https://vercel.com/
3. Add these Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (your deployed URL)
4. Deploy.
5. Add the deployed URL to Supabase Authentication → URL Configuration → Redirect URLs.
6. Test Google login and confirm an unapproved Google account cannot edit content.

## Admin dashboard
Click **Admin** in the navigation. Once signed in with the allowlisted Google account, you can:
- Edit the About Me text
- Add and remove skills
- Add and remove projects
- Upload a profile photo

## Important notes
- The contact button currently uses `hello@example.com`. Change it in `src/App.jsx` when you decide which public contact email to show.
- Social links are intentionally not invented; add your own later.
- The current portfolio content starts with the details supplied by Noshad.
- Keep `.env` private. Never publish OAuth client secrets, Supabase service-role keys, or passwords.
- This is a starter project. Before publishing, test the admin permissions and add any extra fields you want.
