import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey, openrouterKey } = await req.json();

    const cleanUrl = (supabaseUrl || '').trim();
    const cleanAnon = (supabaseAnonKey || '').trim();
    const cleanOpenRouter = (openrouterKey || '').trim();

    // 1. Update in-memory environment variables immediately
    if (cleanUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = cleanUrl;
    if (cleanAnon) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = cleanAnon;
    if (cleanOpenRouter) process.env.OPENROUTER_API_KEY = cleanOpenRouter;

    // 2. Format the .env.local file content
    const envContent = `# Meeting Task Manager - Local Environment Configuration
NEXT_PUBLIC_SUPABASE_URL=${cleanUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${cleanAnon}
OPENROUTER_API_KEY=${cleanOpenRouter}
`;

    // 3. Write to local project directory
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent, 'utf8');

    // 4. Also write to Google Drive project path if exists
    const gdriveEnvPath = `E:\\Google_Drives_Hub\\Streaming_10x.ai\\My Drive\\My AI Courses\\Workbook Tasks\\Antigravity Projects\\Meeting Task Manager\\.env.local`;
    try {
      if (fs.existsSync(path.dirname(gdriveEnvPath))) {
        fs.writeFileSync(gdriveEnvPath, envContent, 'utf8');
      }
    } catch {
      // Ignore if drive path inaccessible
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials saved securely to local environment!',
      supabaseReady: Boolean(cleanUrl && cleanAnon),
      openrouterReady: Boolean(cleanOpenRouter),
    });
  } catch (err: any) {
    console.error('Error saving credentials:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to write credentials.' },
      { status: 500 }
    );
  }
}

