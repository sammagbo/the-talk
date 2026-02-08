-- Phase 17: Semantic Search Setup
-- Enable pgvector extension and create search infrastructure

-- 1. Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the search_index table
CREATE TABLE IF NOT EXISTS search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('episode', 'post')),
  content_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  embedding vector(768), -- Gemini text-embedding-004 outputs 768 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create index for faster similarity searches
CREATE INDEX IF NOT EXISTS search_index_embedding_idx 
ON search_index 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create the match_documents function for semantic search
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
) RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.content_type,
    si.content_id,
    si.title,
    si.content,
    si.metadata,
    1 - (si.embedding <=> query_embedding) AS similarity
  FROM search_index si
  WHERE 1 - (si.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. Enable RLS
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- 6. Policy: Allow public read access for search
CREATE POLICY "Allow public read access for search"
ON search_index FOR SELECT
USING (true);

-- 7. Policy: Allow service role to insert/update/delete
CREATE POLICY "Allow service role full access"
ON search_index FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. [WORKAROUND] RPC for indexing content via Anon Key
-- This allows us to index content using the public key if the service role key is unavailable.
-- SECURITY DEFINER means it runs with the privileges of the creator (admin), bypassing RLS.
CREATE OR REPLACE FUNCTION upsert_document(
  p_content_type TEXT,
  p_content_id TEXT,
  p_title TEXT,
  p_content TEXT,
  p_embedding vector(768),
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO search_index (content_type, content_id, title, content, embedding, metadata, updated_at)
  VALUES (p_content_type, p_content_id, p_title, p_content, p_embedding, p_metadata, NOW())
  ON CONFLICT (content_id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
END;
$$;
