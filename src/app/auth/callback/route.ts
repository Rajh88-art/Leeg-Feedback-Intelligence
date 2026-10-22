import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`);
      }
      console.error('OAuth code exchange error:', error.message);
    } catch (err) {
      console.error('OAuth callback exception:', err);
    }
  }

  // Redirect back to login with error parameter if exchange fails
  return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_error`);
}
