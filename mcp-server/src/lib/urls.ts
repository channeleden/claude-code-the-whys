const GITHUB_BASE = 'https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main';
const GUIDE_SITE_BASE = 'https://cc.bruniaux.com/guide';

export function githubUrl(filePath: string, line?: number): string {
  const base = `${GITHUB_BASE}/${filePath}`;
  return line ? `${base}#L${line}` : base;
}

// Only ultimate-guide.md is rendered on the guide site
export function guideSiteUrl(filePath: string, line?: number): string | null {
  if (filePath !== 'guide/ultimate-guide.md') return null;
  // Line numbers don't map to anchors directly — link to the reader root
  // If a line is provided, append a hint as a hash comment (not a real anchor)
  return line ? `${GUIDE_SITE_BASE}/#L${line}` : GUIDE_SITE_BASE;
}

export function formatLinks(filePath: string, line?: number): string {
  const gh = githubUrl(filePath, line);
  const site = guideSiteUrl(filePath, line);
  const parts = [`GitHub: ${gh}`];
  if (site) parts.push(`Guide: ${site}`);
  return parts.join(' | ');
}
