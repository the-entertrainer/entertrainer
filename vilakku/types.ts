export type Night = 1 | 2 | 3 | 4 | 5;

export type Phase =
  | "title"
  | "n1_hold"
  | "explore"
  | "inspect"
  | "caught"
  | "ending";

export type LampMode = "off" | "dim" | "bright";

export type Ending = "burn" | "redirect" | null;

export type EntityMode = "window" | "rafter" | "shed" | "hunt";

export type Flags = {
  lamp: boolean;
  doorTried: boolean;
  dumped: boolean;
  photo: boolean;
  chart: boolean;
  pact: boolean;
  sawRitual: boolean;
  sickle: boolean;
  ending: Ending;
};

export type HotspotId =
  | "lamp"
  | "door"
  | "cup"
  | "oil"
  | "photo"
  | "chart"
  | "pact"
  | "hatch"
  | "ritual"
  | "sickle"
  | "shed"
  | "parents";

export type Collider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  /** Inclusive night range this collider is solid. */
  nightMin?: number;
  nightMax?: number;
  tag?: string;
};

export type Hotspot = {
  id: HotspotId;
  x: number;
  y: number;
  z: number;
  r: number;
  nightMin: number;
  nightMax: number;
};

export type HudSnapshot = {
  phase: Phase;
  night: Night;
  nightTitle: string;
  subtitle: string;
  objective: string;
  prompt: string;
  promptAlt: string | null;
  oil: number;
  fear: number;
  lampMode: LampMode;
  crouching: boolean;
  canMove: boolean;
  lookLocked: boolean;
  inspect: { title: string; body: string; image: string | null } | null;
  ending: Ending;
  started: boolean;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __vilakku?: {
      beginNight: (n: Night) => void;
      getState: () => { night: Night; phase: Phase; yaw: number; x?: number; z?: number; canMove?: boolean };
      setYaw?: (y: number) => void;
    };
  }
}
