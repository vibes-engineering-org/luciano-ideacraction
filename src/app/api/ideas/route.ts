import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, title, description, miniappUrl, timestamp, attester } = body;

    if (!uid || !title || !description || !attester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert([{
        uid,
        title,
        description,
        miniapp_url: miniappUrl || '',
        timestamp,
        attester,
        upvotes: 0,
        remixes: [],
        claims: []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}