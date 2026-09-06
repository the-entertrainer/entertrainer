/** Browser/Node helper shape — JSZip injected by caller for .dialogue archives */
export async function projectZip(
  zip: any,
  bundle: {
    project: unknown;
    pages: unknown[];
    panels: unknown[];
    nodes: unknown[];
    assets?: Array<{ id: string; mime?: string; name?: string; dataURL?: string; blob?: Blob | Uint8Array | Buffer }>;
  },
  coverPng?: Blob | Uint8Array | Buffer | null,
  onProgress?: (n: number) => void,
) {
  const projectJson = {
    version: 1,
    project: bundle.project,
    pages: bundle.pages,
    panels: bundle.panels,
    nodes: bundle.nodes,
    assetIndex: (bundle.assets || []).map((a) => ({ id: a.id, mime: a.mime, name: a.name })),
  };
  zip.file('project.json', JSON.stringify(projectJson, null, 2));
  const assetsFolder = zip.folder('assets');
  const assets = bundle.assets || [];
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const ext = ((a.mime || 'image/png').split('/')[1] || 'png').replace('jpeg', 'jpg');
    if (a.blob) assetsFolder.file(a.id + '.' + ext, a.blob);
    else if (a.dataURL) {
      const b64 = a.dataURL.split(',')[1] || '';
      assetsFolder.file(a.id + '.' + ext, b64, { base64: true });
    }
    if (onProgress) onProgress(((i + 1) / Math.max(assets.length, 1)) * 0.7);
  }
  if (coverPng) zip.file('cover.png', coverPng);
  if (onProgress) onProgress(1);
  return zip.generateAsync({ type: 'nodebuffer' in Buffer ? 'nodebuffer' : 'blob' });
}
