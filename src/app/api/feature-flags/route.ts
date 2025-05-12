import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase.from('feature_flags').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if ('description' in body) {
    // Update description only
    const { key, description } = body;
    const { error } = await supabase.from('feature_flags').update({ description }).eq('key', key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } else {
    // Update value (existing logic)
    const { key, value } = body;
    const { error } = await supabase.from('feature_flags').upsert([{ key, value }]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
}

export async function POST(req: NextRequest) {
  const { key, value, description } = await req.json();
  const { error } = await supabase.from('feature_flags').insert([{ key, value, description }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  // Accept key from query param or body
  let key = req.nextUrl.searchParams.get('key');
  if (!key) {
    const body = await req.json().catch(() => ({}));
    key = body.key;
  }
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  const { error } = await supabase.from('feature_flags').delete().eq('key', key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 