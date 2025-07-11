import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('builds')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching builds:', error);
      return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/builds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, ideaAttestationUID, title, description, buildUrl, githubUrl, timestamp, attester } = body;

    if (!uid || !ideaAttestationUID || !title || !description || !buildUrl || !attester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('builds')
      .insert([{
        uid,
        idea_attestation_uid: ideaAttestationUID,
        title,
        description,
        build_url: buildUrl,
        github_url: githubUrl || '',
        timestamp,
        attester,
        ratings: [],
        average_rating: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating build:', error);
      return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/builds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}