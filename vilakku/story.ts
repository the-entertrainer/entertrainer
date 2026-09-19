import type { Flags, Night } from "./types";

export const NIGHT_TITLES: Record<Night, string> = {
  1: "Night 1 — The Window",
  2: "Night 2 — The Medicine",
  3: "Night 3 — The Pact",
  4: "Night 4 — The Betrayal",
  5: "Night 5 — Amavasi",
};

export const COPY = {
  wake: "You cannot move. Rain hits the terracotta. The vilakku is out.",
  flash1: "Lightning. The wood shed is empty.",
  flash2: "Something is standing by the shed. It is looking at the window.",
  flash3: "It is on the bars.",
  free: "Breath returns. The door is still locked from the outside.",
  lamp: "Brass. Warm. The only honest light in this house.",
  door: "Padlocked. The bolt is on the other side. They do not want you walking.",
  kashayam: "Mother’s kashayam. Bitter. Your tongue still remembers last night.",
  dumped: "You pour it into the monsoon drain. The cup looks innocent again.",
  photo:
    "1958. A woman’s face is clawed out of the emulsion. Your birth star is inked in the margin: Rohini.",
  chart:
    "An astrological chart. Rohini, the red one. A boy’s birth marked in lamp-black. The next line is a date: Amavasi, 1994.",
  rafter: "It hangs from the rafters like wet rope that learned a spine.",
  granary:
    "Palm leaf, 1958. Boundless wealth for thirty-six years. Collateral: a great-aunt starved until a male heir was born under Rohini. Vessel: you.",
  ritual:
    "In the nadumuttam they stand in black water. Paint on skin. They are not praying for you.",
  hatch: "The floorboard under the bed is loose. The courtyard is loud with rain.",
  amavasi: "No one left in the rooms. The shed is waiting. The sickle is rusted. The lamp is not.",
  sickle: "Rust. A curve meant for coconut, not for this.",
  burn: "You feed the pact to the flame. The shed takes the debt.",
  redirect: "You turn the light on the ones who signed. The thing in the shed remembers who starved it.",
  oil: "Coconut oil. Enough to keep the wick honest until Amavasi.",
  caught: "A hand on your nape. The courtyard tilts. You are back under the bed.",
  seen: "It tasted the wick. Dim the lamp. Stay small.",
  n2start: "The kashayam is already on the chest. They will come to watch you drink.",
  n5choice: "The sickle is in your other hand. The pact is dry enough to catch.",
};

export function objectiveFor(night: Night, flags: Flags, canMove: boolean): string {
  if (!canMove && night === 1) return "Do not look away.";
  if (night === 1) {
    if (!flags.lamp) return "Take the vilakku.";
    if (!flags.doorTried) return "Try the door.";
    return "The night is not finished with you.";
  }
  if (night === 2) {
    if (!flags.dumped) return "Dump the kashayam.";
    if (!flags.photo || !flags.chart) return "Father’s study. The photograph. The chart.";
    return "Lie down before they count the cups.";
  }
  if (night === 3) {
    if (!flags.pact) return "Stay under it. Reach the nellara.";
    return "The courtyard is filling.";
  }
  if (night === 4) {
    if (!flags.sawRitual) return "Under the floor. Do not let Appa see you.";
    return "Back. Before the chant finds a name.";
  }
  if (night === 5) {
    if (!flags.sickle) return "The rusted sickle by the shed.";
    return "Burn the debt, or turn the lamp on them.";
  }
  return "";
}

export function advanceReady(night: Night, flags: Flags): string | null {
  if (night === 1 && flags.lamp && flags.doorTried) return "Lie down. Night 2.";
  if (night === 2 && flags.dumped && flags.photo && flags.chart) return "The rafters creak. Night 3.";
  if (night === 3 && flags.pact) return "The courtyard fills. Night 4.";
  if (night === 4 && flags.sawRitual) return "Amavasi. Walk to the shed.";
  return null;
}

export const SAVE_KEY = "vilakku-save-v1";

export type SaveBlob = {
  v: 1;
  night: Night;
  flags: Flags;
  oil: number;
};

export function emptyFlags(): Flags {
  return {
    lamp: false,
    doorTried: false,
    dumped: false,
    photo: false,
    chart: false,
    pact: false,
    sawRitual: false,
    sickle: false,
    ending: null,
  };
}

export function loadSave(): SaveBlob | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveBlob;
    if (parsed?.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSave(blob: SaveBlob) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
}

export const PHOTO_INSPECT = {
  title: "A photograph, 1958",
  body: "The emulsion is clawed to the paper. A woman’s face is missing. In the margin, in lamp-black: Rohini. A boy. A date still thirty-six years away.",
};

export const CHART_INSPECT = {
  title: "Janma nakshatra",
  body: "Rohini, the red one, carted by Prajapati. The house of the heir is circled until the ink ate the paper. Amavasi, 1994 is the only line that is not old.",
};

export const PACT_INSPECT = {
  title: "Ola, 1958",
  body: "Wealth without famine for thirty-six years. Collateral: the father’s sister, starved in the shed as an Odiyan’s surety. When a male heir is born under Rohini, the vessel walks to the shed on Amavasi. The leaf names you without naming you.",
};
