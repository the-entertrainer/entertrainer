import * as THREE from "three";

function canvasTex(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d");
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function makeNoiseWood(): THREE.CanvasTexture {
  return canvasTex((ctx, size) => {
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = hash(x * 0.07, y * 0.018) * 0.55 + hash(x * 0.2, y * 0.04) * 0.45;
        const v = Math.floor(18 + n * 48);
        const i = (y * size + x) * 4;
        img.data[i] = v;
        img.data[i + 1] = v - 2;
        img.data[i + 2] = v - 6;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, 256);
}

export function makeNoisePlaster(): THREE.CanvasTexture {
  return canvasTex((ctx, size) => {
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = hash(x * 0.11, y * 0.11);
        const v = Math.floor(10 + n * 28);
        const i = (y * size + x) * 4;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v + 2;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, 256);
}

export function makePhotoTexture(): THREE.CanvasTexture {
  const tex = canvasTex((ctx, size) => {
    ctx.fillStyle = "#1a1610";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#2a2418";
    ctx.fillRect(18, 18, size - 36, size - 36);
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(36, 40, size - 72, size * 0.58);
    ctx.strokeStyle = "#d8d0c0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      ctx.moveTo(size * 0.32 + Math.random() * 40, size * 0.22);
      ctx.lineTo(size * 0.28 + Math.random() * 90, size * 0.62);
    }
    ctx.stroke();
    ctx.fillStyle = "#cfc6a8";
    ctx.font = "20px Georgia, serif";
    ctx.fillText("1958", 40, size - 48);
    ctx.font = "14px Georgia, serif";
    ctx.fillText("Rohini  ·  the heir", 40, size - 28);
    const cx = size * 0.72;
    const cy = size * 0.78;
    ctx.strokeStyle = "#a39880";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28);
      ctx.stroke();
    }
  }, 512);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function makeChartTexture(): THREE.CanvasTexture {
  const tex = canvasTex((ctx, size) => {
    ctx.fillStyle = "#14110c";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#cfc6a8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.lineTo(size / 2 + Math.cos(a) * size * 0.38, size / 2 + Math.sin(a) * size * 0.38);
      ctx.stroke();
    }
    ctx.fillStyle = "#9a3b2a";
    ctx.beginPath();
    ctx.arc(size / 2 + size * 0.16, size / 2 - size * 0.12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cfc6a8";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("ROHINI", size * 0.38, size * 0.9);
    ctx.font = "12px Georgia, serif";
    ctx.fillText("Amavasi  1994", size * 0.34, size * 0.96);
  }, 512);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function loadFile(url: string): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 4;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
  });
}

export type GameTextures = {
  wood: THREE.Texture;
  plaster: THREE.Texture;
  photo: THREE.Texture;
  chart: THREE.Texture;
  palm: THREE.Texture | null;
  title: string;
};

export async function loadGameTextures(): Promise<GameTextures> {
  const [woodFile, plasterFile, palm] = await Promise.all([
    loadFile("/textures/wood.jpg"),
    loadFile("/textures/plaster.jpg"),
    loadFile("/textures/palmleaf.jpg"),
  ]);
  const wood = woodFile ?? makeNoiseWood();
  const plaster = plasterFile ?? makeNoisePlaster();
  wood.repeat.set(2, 2);
  plaster.repeat.set(2, 2);
  if (palm) {
    palm.wrapS = palm.wrapT = THREE.ClampToEdgeWrapping;
  }
  return {
    wood,
    plaster,
    photo: makePhotoTexture(),
    chart: makeChartTexture(),
    palm,
    title: "/textures/title-window.jpg",
  };
}
