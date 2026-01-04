<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EstateNexus - Real Estate Management Platform

A professional web-based real estate management application for tracking projects, sites, and financial details with cloud data persistence and AI-powered insights.

## Features

- Multi-project management with site/unit tracking
- Financial calculations and projections
- Payment ledger and tracking
- Status management (Sold, Booked, Unsold)
- AI-powered project insights using Google Gemini
- Cloud-based data storage with Supabase
- Responsive design for desktop and mobile
- Export functionality (PDF/CSV)

## Prerequisites

- Node.js (v16 or higher)
- A Supabase account and project
- A Google Gemini API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. The database schema will be automatically created when you run the migrations
4. Find your project credentials in Project Settings > API

### 3. Configure Environment Variables

Edit the `.env.local` file and add your credentials:

```env
# Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Database Schema

The application uses the following tables:
- `company_settings` - Company information and branding
- `projects` - Real estate projects
- `sites` - Individual units/sites within projects
- `payment_records` - Payment history for each site

All tables have Row Level Security (RLS) enabled with public access policies for this demo application.

## Technology Stack

- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for database and backend
- Google Gemini for AI insights
- Font Awesome for icons
