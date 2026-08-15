<script setup lang="ts">
import { videoById } from '~/content/course/ai'

/**
 * A video block.
 *
 * The player is a facade: nothing is requested from YouTube until the learner
 * clicks. Embedding an iframe directly would contact Google on page load for
 * every video on the page, which contradicts what this site says about itself
 * on /colophon — and would also make a ten-video course load like a brochure.
 *
 * Everything a learner needs to decide whether to watch is printed before the
 * click: the exact title, the exact channel, the runtime, what to watch for,
 * and what is known about accessibility. `youtube-nocookie.com` is used for
 * the embed, and a direct link is always offered for anyone who would rather
 * watch it on YouTube with their own settings.
 */
const props = defineProps<{ id: string }>()
const v = computed(() => videoById(props.id))
const playing = ref(false)
const backup = computed(() => v.value?.backup ? videoById(v.value.backup) : undefined)

const src = computed(() => {
  if (!v.value) return ''
  const t = v.value.start ? `&start=${v.value.start}` : ''
  return `https://www.youtube-nocookie.com/embed/${v.value.yt}?rel=0&modestbranding=1&autoplay=1${t}`
})
const watchUrl = computed(() => v.value
  ? `https://www.youtube.com/watch?v=${v.value.yt}${v.value.start ? `&t=${v.value.start}s` : ''}` : '')
</script>

<template>
  <figure v-if="v" class="vid">
    <div class="vid__head">
      <p class="t-mono vid__kicker">Watch · {{ v.length }}</p>
      <a class="t-mono vid__out" :href="watchUrl" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a>
    </div>

    <h4 class="vid__title">{{ v.title }}</h4>
    <p class="vid__channel">{{ v.channel }}</p>

    <div class="vid__frame">
      <iframe v-if="playing" :src="src" :title="v.title" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen />
      <button v-else type="button" class="vid__play" @click="playing = true">
        <span class="vid__play-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
        <span class="vid__play-label">Play here</span>
        <span class="vid__play-note">Nothing is requested from YouTube until you press this.</span>
      </button>
    </div>

    <figcaption class="vid__meta">
      <p><b>Why this one.</b> {{ v.purpose }}</p>
      <p><b>Watch for.</b> {{ v.watchFor }}</p>
      <p v-if="v.start"><b>Start at.</b> {{ Math.floor(v.start / 60) }} minutes in — the link and the player both jump there.</p>
      <p class="vid__access"><b>Access.</b> {{ v.access }}</p>
      <p v-if="backup" class="vid__access">
        <b>If this link dies.</b> {{ backup.title }} — {{ backup.channel }} ({{ backup.length }}) covers the same ground.
      </p>
      <p class="t-mono vid__checked">Link verified {{ v.checked }}</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.vid {
  margin: clamp(22rem, 3vw, 32rem) 0;
  border: none;
  border-radius: var(--radius-l);
  background: var(--co-surface, var(--paper));
  box-shadow: var(--co-shadow, none);
  overflow: hidden;
}
.vid__head {
  display: flex; align-items: center; justify-content: space-between; gap: 12rem;
  padding: 12rem 18rem; border-bottom: var(--stroke) solid var(--line);
  background: var(--paper-2);
}
.vid__kicker { margin: 0; color: var(--muted); }
.vid__out { color: var(--muted); font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.vid__out:hover { color: var(--ink); }

.vid__title { margin: 16rem 18rem 4rem; font-size: clamp(17rem, 1.7vw, 20rem); line-height: 1.25; }
.vid__channel { margin: 0 18rem 14rem; font-family: var(--font-mono); font-size: 12rem; color: var(--muted); }

.vid__frame { position: relative; aspect-ratio: 16 / 9; background: var(--ink); border-top: var(--stroke) solid var(--line); border-bottom: var(--stroke) solid var(--line); }
.vid__frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.vid__play {
  position: absolute; inset: 0; width: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10rem;
  background: var(--paper-2); color: var(--ink); cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .vid__play:hover { background: var(--co-blue-tint, var(--yellow)); color: var(--blue); } }
.vid__play-icon {
  width: 60rem; height: 60rem; border-radius: 50%;
  border: var(--stroke) solid currentColor;
  display: flex; align-items: center; justify-content: center;
}
.vid__play-label { font-family: 'Lato', var(--font-ui), sans-serif; font-weight: 900; font-size: 20rem; letter-spacing: 0; }
.vid__play-note { font-size: 12.5rem; color: var(--muted); max-width: 34ch; text-align: center; }
.vid__play:hover .vid__play-note { color: inherit; }

.vid__meta { padding: 16rem 18rem 18rem; display: grid; gap: 8rem; }
.vid__meta p { margin: 0; font-size: 14.5rem; line-height: 1.55; color: var(--muted); }
.vid__meta b { color: var(--ink); font-weight: 700; }
.vid__access { font-size: 13.5rem; }
.vid__checked { color: var(--muted); opacity: 0.8; margin-top: 4rem; }
</style>
