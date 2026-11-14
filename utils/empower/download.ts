export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* Fall through to the selection path. */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  } catch {
    return false
  }
}

export async function saveBlob(filename: string, data: BlobPart, type: string): Promise<void> {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const { saveAs } = await import('file-saver')
  saveAs(blob, filename)
}

export async function saveText(filename: string, text: string): Promise<void> {
  await saveBlob(filename, text, 'text/plain;charset=utf-8')
}
