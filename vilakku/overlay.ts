import { loadSave } from "./story";
import type { HudSnapshot } from "./types";

export type OverlayActions = {
  start?: (opts?: { continueSave?: boolean; qa?: boolean }) => Promise<void> | void;
  toggleLamp?: () => void;
  toggleCrouch?: () => void;
  interact?: () => void;
  closeInspect?: () => void;
  chooseEnding?: (kind: "burn" | "redirect") => void;
};

export function mountOverlay(host: HTMLElement, api: OverlayActions) {
  injectCss();
  const wrap = document.createElement("div");
  wrap.className = "vk-dom";
  wrap.innerHTML = `
    <section class="vk-title" aria-label="Vilakku">
      <div class="vk-title-inner">
        <p class="vk-mark">വിളക്ക്</p>
        <h1>Vilakku</h1>
        <p class="vk-lede">A tharavadu in the monsoon. Kerala, 1994.</p>
        <p class="vk-warn">Folk horror. A child in a locked house. The lamp is the only honest light.</p>
        <div class="vk-title-actions">
          <button type="button" class="vk-btn" data-act="start">Light the lamp</button>
          <button type="button" class="vk-btn vk-btn-ghost" data-act="continue" hidden>Continue the night</button>
        </div>
        <p class="vk-hint">Left: walk. Right: look. Lamp, crouch, and touch are on the right thumb.</p>
      </div>
    </section>
    <div class="vk-hud" hidden>
      <div class="vk-top">
        <p class="vk-night"></p>
        <p class="vk-obj"></p>
      </div>
      <div class="vk-meters">
        <div class="vk-meter"><span>Oil</span><i><b data-oil></b></i></div>
        <div class="vk-meter vk-meter-fear"><span>Pulse</span><i><b data-fear></b></i></div>
      </div>
      <p class="vk-sub" hidden></p>
    </div>
    <div class="vk-fabs" hidden>
      <button type="button" class="vk-fab" data-act="lamp" aria-label="Lamp"><span>flame</span><em>lamp</em></button>
      <button type="button" class="vk-fab" data-act="crouch" aria-label="Crouch"><span>low</span><em>crouch</em></button>
      <button type="button" class="vk-fab vk-fab-main" data-act="interact" aria-label="Interact"><span>hand</span><em>touch</em></button>
    </div>
    <div class="vk-prompts" hidden>
      <button type="button" class="vk-prompt" data-act="prompt"></button>
      <button type="button" class="vk-prompt vk-prompt-alt" data-act="prompt-alt" hidden></button>
    </div>
    <button type="button" class="vk-inspect" data-act="inspect" hidden>
      <img class="vk-inspect-img" alt="" hidden />
      <div class="vk-inspect-copy">
        <h2></h2>
        <p></p>
        <span>Close</span>
      </div>
    </button>
  `;
  host.appendChild(wrap);

  const title = wrap.querySelector(".vk-title") as HTMLElement;
  const startBtn = wrap.querySelector('[data-act="start"]') as HTMLButtonElement;
  const contBtn = wrap.querySelector('[data-act="continue"]') as HTMLButtonElement;
  const hud = wrap.querySelector(".vk-hud") as HTMLElement;
  const fabs = wrap.querySelector(".vk-fabs") as HTMLElement;
  const prompts = wrap.querySelector(".vk-prompts") as HTMLElement;
  const inspect = wrap.querySelector(".vk-inspect") as HTMLButtonElement;
  const night = wrap.querySelector(".vk-night") as HTMLElement;
  const obj = wrap.querySelector(".vk-obj") as HTMLElement;
  const sub = wrap.querySelector(".vk-sub") as HTMLElement;
  const oil = wrap.querySelector("[data-oil]") as HTMLElement;
  const fear = wrap.querySelector("[data-fear]") as HTMLElement;
  const promptBtn = wrap.querySelector('[data-act="prompt"]') as HTMLButtonElement;
  const promptAlt = wrap.querySelector('[data-act="prompt-alt"]') as HTMLButtonElement;
  const lampFab = wrap.querySelector('[data-act="lamp"]') as HTMLButtonElement;

  if (loadSave()) contBtn.hidden = false;

  startBtn.addEventListener("click", () => void api.start?.());
  contBtn.addEventListener("click", () => void api.start?.({ continueSave: true }));
  wrap.querySelector('[data-act="lamp"]')!.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    api.toggleLamp?.();
  });
  wrap.querySelector('[data-act="crouch"]')!.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    api.toggleCrouch?.();
  });
  wrap.querySelector('[data-act="interact"]')!.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    api.interact?.();
  });
  promptBtn.addEventListener("click", () => {
    if (promptBtn.textContent === "Burn the shed") api.chooseEnding?.("burn");
    else api.interact?.();
  });
  promptAlt.addEventListener("click", () => api.chooseEnding?.("redirect"));
  inspect.addEventListener("click", () => api.closeInspect?.());

  function update(s: HudSnapshot) {
    title.hidden = s.started;
    hud.hidden = !s.started;
    const showFabs = s.started && s.canMove;
    fabs.hidden = !showFabs;
    night.textContent = s.nightTitle;
    obj.textContent = s.objective;
    sub.textContent = s.subtitle;
    sub.hidden = !s.subtitle;
    oil.style.transform = `scaleX(${s.oil})`;
    fear.style.transform = `scaleX(${s.fear})`;
    lampFab.classList.toggle("is-on", s.lampMode !== "off");
    wrap.querySelector('[data-act="crouch"]')!.classList.toggle("is-on", s.crouching);
    lampFab.querySelector("em")!.textContent = s.lampMode;
    if (s.prompt) {
      prompts.hidden = false;
      promptBtn.textContent = s.prompt;
    } else {
      prompts.hidden = true;
    }
    promptAlt.hidden = !s.promptAlt;
    if (s.promptAlt) promptAlt.textContent = s.promptAlt;
    inspect.hidden = !s.inspect;
    if (s.inspect) {
      const img = inspect.querySelector("img") as HTMLImageElement;
      const h2 = inspect.querySelector("h2")!;
      const p = inspect.querySelector("p")!;
      h2.textContent = s.inspect.title;
      p.textContent = s.inspect.body;
      if (s.inspect.image) {
        img.hidden = false;
        img.src = s.inspect.image;
      } else {
        img.hidden = true;
      }
    }
  }

  return {
    update,
    dispose() {
      wrap.remove();
    },
  };
}

function injectCss() {
  if (document.getElementById("vk-css")) return;
  const s = document.createElement("style");
  s.id = "vk-css";
  s.textContent = `
    #vilakku-host,#vilakku-host *{box-sizing:border-box}
    .vk-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000;z-index:0}
    .vk-dom{position:absolute;inset:0;z-index:4;pointer-events:none;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;color:#e8e0d0}
    .vk-dom button,.vk-title{pointer-events:auto}
    .vk-title{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:28px 22px;
      background:linear-gradient(to top,#050403 8%,rgba(5,4,3,.55) 42%,#050403 100%),url("/textures/title-window.jpg") center/cover no-repeat,#050403}
    .vk-title[hidden]{display:none}
    .vk-mark{font-size:15px;letter-spacing:.38em;opacity:.55;margin:0 0 10px}
    .vk-title h1{font-weight:500;letter-spacing:.34em;font-size:clamp(2rem,8vw,3.4rem);text-transform:uppercase;margin:0 0 16px}
    .vk-lede{max-width:28ch;margin:0 auto 10px;font-size:1.05rem;line-height:1.5;opacity:.86}
    .vk-warn{max-width:34ch;margin:0 auto 28px;font-size:.88rem;color:#8a8274;line-height:1.45}
    .vk-title-actions{display:flex;flex-direction:column;gap:10px;align-items:center}
    .vk-btn,.vk-prompt{appearance:none;border:1px solid #d7cbb4;background:#0a0a0a;color:#d7cbb4;padding:12px 22px;letter-spacing:.18em;text-transform:uppercase;font-size:11px;font-family:inherit;min-height:44px}
    .vk-btn-ghost{border-color:rgba(215,203,180,.35);color:#8a8274}
    .vk-hint{margin:22px 0 0;font-size:.8rem;color:#8a8274}
    .vk-hud{position:absolute;inset:0;pointer-events:none}
    .vk-top{position:absolute;top:calc(12px + env(safe-area-inset-top));left:16px;right:130px}
    .vk-night{margin:0;font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;opacity:.78}
    .vk-obj{margin:6px 0 0;font-size:.95rem;max-width:28ch}
    .vk-meters{position:absolute;top:calc(12px + env(safe-area-inset-top));right:16px;width:108px;display:flex;flex-direction:column;gap:8px}
    .vk-meter span{display:block;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#8a8274;margin-bottom:3px}
    .vk-meter i{display:block;height:3px;background:rgba(232,224,208,.14);overflow:hidden}
    .vk-meter b{display:block;height:100%;width:100%;background:#d7cbb4;transform-origin:left center}
    .vk-meter-fear b{background:#9a3b2a}
    .vk-sub{position:absolute;left:16px;right:16px;bottom:calc(132px + env(safe-area-inset-bottom));text-align:center;font-size:1.02rem;line-height:1.45;margin:0 auto;max-width:34ch}
    .vk-fabs{position:absolute;right:14px;bottom:calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px;pointer-events:auto}
    .vk-fab{width:52px;height:52px;border-radius:999px;border:1px solid rgba(215,203,180,.45);background:rgba(5,4,3,.7);color:#d7cbb4;position:relative;padding:0}
    .vk-fab span{font-size:10px;letter-spacing:.08em;text-transform:uppercase}
    .vk-fab em{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;font-style:normal;color:#8a8274;white-space:nowrap}
    .vk-fab.is-on{background:rgba(215,203,180,.18)}
    .vk-fab-main{width:58px;height:58px}
    .vk-prompts{position:absolute;left:50%;bottom:calc(72px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:auto}
    .vk-inspect{position:absolute;inset:0;border:0;padding:28px 22px;background:rgba(5,4,3,.88);color:#e8e0d0;display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:inherit;width:100%;text-align:left;pointer-events:auto}
    .vk-inspect[hidden]{display:none}
    .vk-inspect-img{width:min(92vw,420px);height:auto;margin-bottom:18px;border:1px solid rgba(232,224,208,.18)}
    .vk-inspect-copy{max-width:38ch}
    .vk-inspect h2{font-size:1.4rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;margin:0 0 12px}
    .vk-inspect p{margin:0 0 22px;line-height:1.55;font-size:1.05rem}
    .vk-inspect span{letter-spacing:.18em;text-transform:uppercase;font-size:.72rem;color:#8a8274}
    .vk-zone{position:absolute;top:0;bottom:0;z-index:2;touch-action:none;pointer-events:auto}
    .vk-zone-left{left:0;width:48%}
    .vk-zone-right{right:0;width:52%}
    .vk-stick{position:absolute;z-index:3;width:108px;height:108px;margin:-54px 0 0 -54px;border:1px solid rgba(215,203,180,.4);border-radius:999px;pointer-events:none}
    .vk-knob{position:absolute;left:50%;top:50%;width:40px;height:40px;border-radius:999px;background:rgba(215,203,180,.42);transform:translate(-50%,-50%)}
  `;
  document.head.appendChild(s);
}
