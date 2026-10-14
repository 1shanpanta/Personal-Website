const TOTAL = /([\d,]+)\s*\n?\s*contributions/;

/**
 * The year's contribution count from the public calendar, as GitHub prints it
 * ("7,825"). The site is a static export, so this runs once per build. No
 * token, no third-party proxy. Empty string on any failure, so the page drops
 * the figure rather than printing a wrong one.
 */
export async function getContributionTotal(user: string): Promise<string> {
  try {
    const res = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { accept: "text/html" },
    });
    if (!res.ok) return "";
    return TOTAL.exec(await res.text())?.[1] ?? "";
  } catch {
    return "";
  }
}
