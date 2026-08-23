export type Census = {
  publicCount: number;
  kilobytes: number;
  languages: { name: string; count: number }[];
};

type ApiRepo = { language: string | null; size: number };

/**
 * Public repositories only, unauthenticated. Returns null on any failure so the
 * caller can drop the panel rather than print zeroes as if they were the truth.
 */
export async function getCensus(user: string): Promise<Census | null> {
  let repos: ApiRepo[];
  try {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&type=owner`,
      {
        headers: { accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    repos = await res.json();
  } catch {
    return null;
  }
  if (!Array.isArray(repos) || repos.length === 0) return null;

  const tally = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    tally.set(repo.language, (tally.get(repo.language) ?? 0) + 1);
  }

  return {
    publicCount: repos.length,
    kilobytes: repos.reduce((sum, repo) => sum + (repo.size || 0), 0),
    languages: [...tally]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}
