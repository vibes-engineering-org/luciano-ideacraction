import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('ideas')
      .update(body)
      .eq('uid', uid)
      .select()
      .single();

    if (error) {
      console.error('Error updating idea:', error);
      return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/ideas/[uid]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error) {
      console.error('Error fetching idea:', error);
      return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/ideas/[uid]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}