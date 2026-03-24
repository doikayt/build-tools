import GithubSlugger from "github-slugger";

/**
 * Converts a heading's raw text to a GitHub-style anchor slug.
 *
 * A new GithubSlugger instance must be passed per document so that
 * duplicate-heading counters are scoped correctly to that document.
 */
export function slugHeading(rawText: string, slugger: GithubSlugger): string {
  return slugger.slug(rawText);
}
