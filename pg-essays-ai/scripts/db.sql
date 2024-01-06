CREATE EXTENSION VECTOR;

CREATE TABLE paul_graham (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  essay_title TEXT,
  essay_url TEXT,
  essay_date TEXT,
  content TEXT,
  content_tokens BIGINT,
  embedding VECTOR (384)
);

CREATE OR REPLACE FUNCTION paul_graham_search (
  query_embedding VECTOR (384),
  similarity_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  essay_title TEXT,
  essay_url TEXT,
  essay_date TEXT,
  content TEXT,
  content_tokens BIGINT,
  similarity FLOAT
)
LANGUAGE PLPGSQL
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    paul_graham.id,
    paul_graham.essay_title,
    paul_graham.essay_url,
    paul_graham.essay_date,
    paul_graham.content,
    paul_graham.content_tokens,
    1 - paul_graham.embedding <=> query_embedding AS similarity
  FROM paul_graham
  WHERE (1 - paul_graham.embedding <=> query_embedding) > similarity_threshold
  ORDER BY paul_graham.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE INDEX ON paul_graham USING HNSW (embedding vector_ip_ops);