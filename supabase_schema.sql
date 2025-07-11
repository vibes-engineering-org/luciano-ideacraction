-- Database schema for Built It Mini App
-- This schema should be executed in your Supabase database

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    miniapp_url TEXT DEFAULT '',
    timestamp BIGINT NOT NULL,
    attester VARCHAR(255) NOT NULL,
    upvotes INTEGER DEFAULT 0,
    remixes JSONB DEFAULT '[]',
    claims JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create builds table
CREATE TABLE IF NOT EXISTS builds (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    idea_attestation_uid VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    build_url TEXT NOT NULL,
    github_url TEXT DEFAULT '',
    timestamp BIGINT NOT NULL,
    attester VARCHAR(255) NOT NULL,
    ratings JSONB DEFAULT '[]',
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_uid ON ideas(uid);
CREATE INDEX IF NOT EXISTS idx_ideas_attester ON ideas(attester);
CREATE INDEX IF NOT EXISTS idx_ideas_timestamp ON ideas(timestamp);
CREATE INDEX IF NOT EXISTS idx_builds_uid ON builds(uid);
CREATE INDEX IF NOT EXISTS idx_builds_idea_attestation_uid ON builds(idea_attestation_uid);
CREATE INDEX IF NOT EXISTS idx_builds_attester ON builds(attester);
CREATE INDEX IF NOT EXISTS idx_builds_timestamp ON builds(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- RLS policies for ideas table
-- Allow everyone to read ideas
CREATE POLICY "Anyone can read ideas" ON ideas
    FOR SELECT USING (true);

-- Allow authenticated users to insert ideas
CREATE POLICY "Authenticated users can insert ideas" ON ideas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own ideas
CREATE POLICY "Users can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid()::text = attester);

-- RLS policies for builds table
-- Allow everyone to read builds
CREATE POLICY "Anyone can read builds" ON builds
    FOR SELECT USING (true);

-- Allow authenticated users to insert builds
CREATE POLICY "Authenticated users can insert builds" ON builds
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own builds
CREATE POLICY "Users can update their own builds" ON builds
    FOR UPDATE USING (auth.uid()::text = attester);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();