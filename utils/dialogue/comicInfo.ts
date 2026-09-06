export function comicInfo(project: { title?: string }) {
  const title = project?.title || 'Untitled';
  const esc = (s: string) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<?xml version="1.0" encoding="utf-8"?>\n<ComicInfo>\n  <Title>${esc(title)}</Title>\n  <Series>${esc(title)}</Series>\n  <LanguageISO>en</LanguageISO>\n  <Manga>No</Manga>\n</ComicInfo>`;
}
