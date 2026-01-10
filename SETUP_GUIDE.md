# Supabase Setup Guide for EstateNexus

Follow these steps to set up your Supabase database and get the app running.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign Up"**
3. Use your email or GitHub account to register
4. Verify your email address

## Step 2: Create a New Project

1. After logging in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `estatenexus` (or any name you prefer)
   - **Database Password**: Create a strong password and save it
   - **Region**: Choose the region closest to your location
   - **Pricing Plan**: Select "Free" tier to start

3. Click **"Create new project"**
4. Wait for the project to be initialized (this may take a few minutes)

## Step 3: Get Your API Keys

1. Once your project is created, go to **Settings** in the sidebar
2. Click **"API"** from the left menu
3. You'll see your credentials:
   - **Project URL** - This is your `VITE_SUPABASE_URL`
   - **Anon Key** - This is your `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** - Not needed for this app

## Step 4: Create Database Tables

The migration has already been set up in your project. Supabase will automatically create the tables when the app first tries to use them because we have Row Level Security (RLS) enabled.

However, you can manually run the migration:

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the SQL from `/supabase/migrations/20260104143728_create_real_estate_schema.sql`
4. Paste it into the editor
5. Click **"Run"**

The tables created will be:
- `company_settings` - Store company branding and info
- `projects` - Real estate projects
- `sites` - Individual units/properties
- `payment_records` - Payment history

## Step 5: Configure Your Environment

1. Open `.env.local` in your project root
2. Update with your Supabase credentials:

```env
# Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (from Step 3)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your-project-id` with your actual project ID
- `your_anon_key_here` with your actual Anonymous Key

## Step 6: Start the App

```bash
npm run dev
```

The app should now load and show the main interface!

## Troubleshooting

### Issue: "Missing Supabase Configuration" message
- **Solution**: Check that `.env.local` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure there are no spaces or typos
- Refresh the page after updating `.env.local`

### Issue: "Invalid supabaseUrl" error
- **Solution**: Ensure your URL starts with `https://` and ends with `.supabase.co`
- Format should be: `https://xxxxx.supabase.co`

### Issue: Cannot create projects or sites
- **Solution**: Go to your Supabase dashboard and check if the tables were created
- In **SQL Editor**, run this to verify:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  ```
- You should see: `company_settings`, `projects`, `sites`, `payment_records`

## Optional: Set Gemini API Key for AI Features

To enable AI-powered insights:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

## Testing Your Setup

1. Navigate to `http://localhost:3000`
2. Click **"START NEW PROJECT"** to create your first project
3. Add sites and manage them
4. All data will be saved to your Supabase database

That's it! You now have a fully functional cloud-based real estate management system.
