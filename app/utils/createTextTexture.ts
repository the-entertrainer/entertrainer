export interface TextureOptions {
  width?: number
  height?: number
  fontSize?: number
  lineHeight?: number
  padding?: number
  color?: string
  bgColor?: string
}

export async function createTextTexture(
  text: string,
  options: TextureOptions = {},
) {
  const THREE = await import('three')

  const {
    width = 512,
    height = 512,
    fontSize = 24,
    lineHeight = 1.4,
    padding = 20,
    color = '#000000',
    bgColor = '#ffffff',
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = color
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  const lines = text.split('\n')
  let y = padding

  for (const line of lines) {
    if (y + fontSize > height - padding) break
    ctx.fillText(line, padding, y)
    y += fontSize * lineHeight
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter

  return texture
}
