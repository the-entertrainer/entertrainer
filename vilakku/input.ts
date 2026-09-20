import { clamp, radialDeadzone } from "./math";

export type InputState = {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  crouch: boolean;
  interact: boolean;
  lamp: boolean;
};

type Forced = Set<string>;

export class TouchInput {
  readonly state: InputState = {
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0,
    crouch: false,
    interact: false,
    lamp: false,
  };

  keys = new Set<string>();
  forced: Forced = new Set();
  lookSens = 0.0046;
  private host: HTMLElement;
  private stick: HTMLElement;
  private knob: HTMLElement;
  private left: HTMLElement;
  private right: HTMLElement;
  private stickId: number | null = null;
  private lookId: number | null = null;
  private lastLookX = 0;
  private lastLookY = 0;
  private edges = { interact: false, lamp: false, crouch: false };

  constructor(host: HTMLElement) {
    this.host = host;
    this.left = el("div", "vk-zone vk-zone-left");
    this.right = el("div", "vk-zone vk-zone-right");
    this.stick = el("div", "vk-stick");
    this.knob = el("div", "vk-knob");
    this.stick.appendChild(this.knob);
    this.stick.hidden = true;
    host.append(this.left, this.right, this.stick);

    this.left.addEventListener("pointerdown", this.onStickDown);
    this.left.addEventListener("pointermove", this.onStickMove);
    this.left.addEventListener("pointerup", this.onStickUp);
    this.left.addEventListener("pointercancel", this.onStickUp);

    this.right.addEventListener("pointerdown", this.onLookDown);
    this.right.addEventListener("pointermove", this.onLookMove);
    this.right.addEventListener("pointerup", this.onLookUp);
    this.right.addEventListener("pointercancel", this.onLookUp);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clearKeys);
    document.addEventListener("visibilitychange", this.onVis);
  }

  consumeLook(): { dx: number; dy: number } {
    const dx = this.state.lookX;
    const dy = this.state.lookY;
    this.state.lookX = 0;
    this.state.lookY = 0;
    return { dx, dy };
  }

  consumeEdges(): { interact: boolean; lamp: boolean; crouchToggle: boolean } {
    const out = {
      interact: this.edges.interact,
      lamp: this.edges.lamp,
      crouchToggle: this.edges.crouch,
    };
    this.edges.interact = false;
    this.edges.lamp = false;
    this.edges.crouch = false;
    return out;
  }

  pulseInteract() {
    this.edges.interact = true;
  }
  pulseLamp() {
    this.edges.lamp = true;
  }
  pulseCrouch() {
    this.edges.crouch = true;
  }

  sampleMove(): { x: number; y: number } {
    const active = this.forced.size ? this.forced : this.keys;
    let x = this.state.moveX;
    let y = this.state.moveY;
    if (active.has("KeyA") || active.has("ArrowLeft")) x -= 1;
    if (active.has("KeyD") || active.has("ArrowRight")) x += 1;
    if (active.has("KeyW") || active.has("ArrowUp")) y -= 1;
    if (active.has("KeyS") || active.has("ArrowDown")) y += 1;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    return { x, y };
  }

  holdingCrouch(): boolean {
    const active = this.forced.size ? this.forced : this.keys;
    return this.state.crouch || active.has("KeyC") || active.has("ShiftLeft") || active.has("ControlLeft");
  }

  setForced(codes: string[]) {
    this.forced = new Set(codes);
  }

  private onStickDown = (e: PointerEvent) => {
    this.stickId = e.pointerId;
    this.left.setPointerCapture(e.pointerId);
    this.stick.hidden = false;
    this.placeStick(e.clientX, e.clientY);
    this.dragStick(e);
  };

  private onStickMove = (e: PointerEvent) => {
    if (e.pointerId !== this.stickId) return;
    this.dragStick(e);
  };

  private onStickUp = (e: PointerEvent) => {
    if (this.stickId != null && e.pointerId !== this.stickId) return;
    this.stickId = null;
    this.state.moveX = 0;
    this.state.moveY = 0;
    this.stick.hidden = true;
    this.knob.style.transform = "translate(-50%, -50%)";
  };

  private placeStick(x: number, y: number) {
    const r = this.host.getBoundingClientRect();
    this.stick.style.left = `${x - r.left}px`;
    this.stick.style.top = `${y - r.top}px`;
  }

  private dragStick(e: PointerEvent) {
    const r = this.stick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let x = (e.clientX - cx) / (r.width * 0.5);
    let y = (e.clientY - cy) / (r.height * 0.5);
    const dz = radialDeadzone(x, y, 0.12);
    x = dz.x;
    y = dz.y;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    this.state.moveX = x;
    this.state.moveY = y;
    this.knob.style.transform = `translate(calc(-50% + ${x * 28}px), calc(-50% + ${y * 28}px))`;
  }

  private onLookDown = (e: PointerEvent) => {
    this.lookId = e.pointerId;
    this.right.setPointerCapture(e.pointerId);
    this.lastLookX = e.clientX;
    this.lastLookY = e.clientY;
  };

  private onLookMove = (e: PointerEvent) => {
    if (e.pointerId !== this.lookId) return;
    const dx = e.clientX - this.lastLookX;
    const dy = e.clientY - this.lastLookY;
    this.lastLookX = e.clientX;
    this.lastLookY = e.clientY;
    this.state.lookX += dx;
    this.state.lookY += dy;
  };

  private onLookUp = (e: PointerEvent) => {
    if (this.lookId != null && e.pointerId !== this.lookId) return;
    this.lookId = null;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.keys.add(e.code);
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "KeyE" || e.code === "Space") this.edges.interact = true;
    if (e.code === "KeyF") this.edges.lamp = true;
    if (e.code === "KeyC" || e.code === "ControlLeft") this.edges.crouch = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private clearKeys = () => {
    this.keys.clear();
    this.state.moveX = 0;
    this.state.moveY = 0;
  };

  private onVis = () => {
    if (document.hidden) this.clearKeys();
  };

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clearKeys);
    document.removeEventListener("visibilitychange", this.onVis);
    this.left.remove();
    this.right.remove();
    this.stick.remove();
  }
}

function el(tag: string, cls: string): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  return n;
}

export function attachPointerLock(target: HTMLElement, onDelta: (dx: number, dy: number) => void): () => void {
  const onMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== target) return;
    onDelta(e.movementX, e.movementY);
  };
  const onClick = () => {
    if (document.pointerLockElement) return;
    const maybe = target.requestPointerLock();
    if (maybe && typeof (maybe as Promise<void>).catch === "function") {
      (maybe as Promise<void>).catch(() => undefined);
    }
  };
  target.addEventListener("click", onClick);
  document.addEventListener("mousemove", onMove);
  return () => {
    target.removeEventListener("click", onClick);
    document.removeEventListener("mousemove", onMove);
  };
}

export function clampPitch(p: number): number {
  return clamp(p, -1.15, 1.05);
}
