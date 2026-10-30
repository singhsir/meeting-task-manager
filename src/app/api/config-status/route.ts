import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  let openrouterKey = process.env.OPENROUTER_API_KEY || '';

  // Also check .env.local file directly on disk in case it was edited without restarting server
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
          const val = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
          if (val) supabaseUrl = val;
        } else if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
          const val = trimmed.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
          if (val) supabaseKey = val;
        } else if (trimmed.startsWith('OPENROUTER_API_KEY=')) {
          const val = trimmed.replace('OPENROUTER_API_KEY=', '').trim();
          if (val) openrouterKey = val;
        }
      }
    } catch (e) {
      console.error('Error reading .env.local:', e);
    }
  }

  const isSupabaseReady = Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey &&
    supabaseKey.length > 20 &&
    !supabaseUrl.includes('your_supabase_project_url')
  );

  const isOpenRouterReady = Boolean(
    openrouterKey &&
    openrouterKey.length > 10 &&
    !openrouterKey.includes('your_openrouter_api_key')
  );

  return NextResponse.json({
    supabaseReady: isSupabaseReady,
    openrouterReady: isOpenRouterReady,
    supabaseUrl: isSupabaseReady ? supabaseUrl : '',
    // Never send keys back to the client!
    hasAnonKey: Boolean(supabaseKey && supabaseKey.length > 20),
    hasOpenRouterKey: Boolean(openrouterKey && openrouterKey.length > 10),
  });
}

