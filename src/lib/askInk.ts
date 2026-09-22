/**
 * Client-side retrieval for the ink AI assistant.
 * Loads precomputed embeddings (bge-m3, 1024-dim) and ranks chunks
 * by cosine similarity against the embedded query.
 */
export type Retrieved = {
  slug: string;
  title: string;
  published: boolean;
  text: string;
  score: number;
};

let cache: Promise<{ chunks: { slug: string; title: string; published: boolean; text: string; v: number[] }[] }> | null = null;

function load(): Promise<{ chunks: { slug: string; title: string; published: boolean; text: string; v: number[] }[] }> {
  if (!cache) {
    cache = fetch("/data/embeddings.json").then((r) => {
      if (!r.ok) throw new Error("embeddings load " + r.status);
      return r.json();
    });
  }
  return cache;
}

async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("/api/ai/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "BAAI/bge-m3", input: text.slice(0, 500) }),
  });
  if (!res.ok) throw new Error("embed " + res.status);
  const json = await res.json();
  return json.data[0].embedding;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function retrieve(query: string, k = 5): Promise<Retrieved[]> {
  const data = await load();
  const qv = await embedQuery(query);
  return data.chunks
    .map((c) => ({ slug: c.slug, title: c.title, published: c.published, text: c.text, score: cosine(qv, c.v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
