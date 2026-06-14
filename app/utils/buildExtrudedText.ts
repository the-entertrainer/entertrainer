import type { Font } from 'three/examples/jsm/loaders/FontLoader'

interface TextGeometryOptions {
  font: Font
  size?: number
  height?: number
  curveSegments?: number
  bevelEnabled?: boolean
  bevelThickness?: number
  bevelSize?: number
  bevelOffset?: number
  bevelSegments?: number
}

export async function buildExtrudedText(
  text: string,
  font: Font,
  options: TextGeometryOptions = {},
) {
  const THREE = await import('three')

  const {
    size = 1,
    height = 0.2,
    curveSegments = 8,
    bevelEnabled = true,
    bevelThickness = 0.03,
    bevelSize = 0.02,
    bevelOffset = 0,
    bevelSegments = 3,
  } = options

  const geometry = new THREE.TextGeometry(text, {
    font,
    size,
    height,
    curveSegments,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    bevelOffset,
    bevelSegments,
  })

  geometry.center()

  return geometry
}

export async function loadFont(url: string) {
  const THREE = await import('three')
  const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader')

  const loader = new FontLoader()
  return new Promise<Font>((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}
