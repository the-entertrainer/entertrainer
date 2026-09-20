<script setup lang="ts">
import type { Root } from "react-dom/client";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Velocity · Engage",
  description:
    "The speeds you already have — Earth spin, solar orbit, galactic ride, CMB frame.",
  ogUrl: "https://entertrainer.in/engage/velocity",
  ogImage: "https://entertrainer.in/og-velocity.jpg",
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: {
    style: "background:#02040c;height:100%;font-size:16px;color-scheme:dark",
  },
  bodyAttrs: {
    style: "background:#02040c;margin:0;height:100%;overscroll-behavior:none",
  },
  meta: [
    { name: "theme-color", content: "#02040c" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "/velocity-icon.svg" }],
});

const host = ref<HTMLElement | null>(null);
let root: Root | null = null;
let cancelled = false;
const mountError = ref(false);
let prevHtmlFontSize: string | null = null;
let prevHtmlFontSizePriority = "";
let prevNuxtHeight = "";
let prevNuxtMargin = "";
let prevNuxtBg = "";

onMounted(async () => {
  const html = document.documentElement;
  const existing = html.style.getPropertyValue("font-size");
  const existingPri = html.style.getPropertyPriority("font-size");
  if (existing && !(existing === "16px" && existingPri !== "important")) {
    prevHtmlFontSize = existing;
    prevHtmlFontSizePriority = existingPri;
  }
  html.classList.add("velocity-rem");
  html.style.setProperty("font-size", "16px", "important");
  const nuxt = document.getElementById("__nuxt");
  if (nuxt) {
    prevNuxtHeight = nuxt.style.height;
    prevNuxtMargin = nuxt.style.margin;
    prevNuxtBg = nuxt.style.background;
    nuxt.style.height = "100%";
    nuxt.style.margin = "0";
  }
  if (!host.value) return;
  try {
    const [{ createRoot }, { createElement }, { VelocityApp }] =
      await Promise.all([
        import("react-dom/client"),
        import("react"),
        import("@velocity/VelocityApp"),
      ]);
    if (cancelled || !host.value) return;
    root = createRoot(host.value);
    root.render(createElement(VelocityApp));
  } catch {
    if (!cancelled) mountError.value = true;
  }
});

onUnmounted(() => {
  cancelled = true;
  root?.unmount();
  root = null;
  const html = document.documentElement;
  html.classList.remove("velocity-rem");
  html.style.removeProperty("font-size");
  if (prevHtmlFontSize != null) {
    html.style.setProperty(
      "font-size",
      prevHtmlFontSize,
      prevHtmlFontSizePriority || undefined,
    );
  }
  const nuxt = document.getElementById("__nuxt");
  if (nuxt) {
    nuxt.style.height = prevNuxtHeight;
    nuxt.style.margin = prevNuxtMargin;
    nuxt.style.background = prevNuxtBg;
  }
});
</script>

<template>
  <div ref="host" id="velocity-host" class="velocity-host">
    <p class="velocity-fallback" role="status">
      {{
        mountError
          ? "Velocity could not load. Check your connection and reload this page."
          : "Loading Velocity…"
      }}
    </p>
  </div>
</template>

<style scoped>
.velocity-host {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  margin: 0;
  background: #02040c;
  overflow: visible;
  touch-action: pan-y;
}
.velocity-fallback {
  padding: 32px;
  color: #f6f5f0;
  font:
    16px/1.6 Archivo,
    sans-serif;
}
</style>
