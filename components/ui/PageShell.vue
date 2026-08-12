<script setup lang="ts">
/**
 * The frame every content page sits in.
 *
 * Before this, five sub pages placed their content at five different left
 * edges — measured at 1440x900: /about 186, /my-work 190, /tools 190,
 * /my-work/sewa-chronicles 284, /instructional-design 354. A 168px spread,
 * so the text physically slid sideways as you moved between pages. Each page
 * had invented its own max-width too (1180 / 920 / 1240 / 760) and three of
 * them hand-rolled a masthead instead of using UiPageHead, which is why the
 * same eyebrow was set at three different trackings.
 *
 * The fix is not "one width for everything" — a case study genuinely wants a
 * narrower column than a deck landing page. It is one *frame* with one gutter,
 * and measure controlled inside it by the type itself (--measure-deck,
 * --measure-body). The page box is constant; the column within it varies with
 * intent. That is how the left edge stays put while the content breathes
 * differently page to page.
 *
 * `bleed` opts a child out of the frame for a full-width band (a hero glow, a
 * deck that wants the whole viewport) without opting out of the page.
 */
withDefaults(defineProps<{
  /** Render the calm backdrop. Off for pages that bring their own ground. */
  backdrop?: boolean
  /** Extra top room, for pages that open on a hero rather than a masthead. */
  hero?: boolean
}>(), { backdrop: true, hero: false })
</script>

<template>
  <div class="shell">
    <UiGlassBackdrop v-if="backdrop" calm />
    <UiPageOptics />
    <div class="shell__inner" :class="{ 'shell__inner--hero': hero }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.shell {
  position: fixed; inset: 0;
  overflow-y: auto; overflow-x: clip;
  z-index: 1;
}
.shell__inner {
  position: relative; z-index: 1;
  max-width: var(--shell-max);
  margin: 0 auto;
  padding:
    calc(var(--page-top) + 20rem)
    var(--shell-gutter)
    calc(90rem + var(--safe-bottom));
}
.shell__inner--hero { padding-top: calc(var(--page-top) + 40rem); }

@media (max-width: 640px) {
  .shell__inner { padding-top: var(--page-top); padding-bottom: calc(60rem + var(--safe-bottom)); }
  .shell__inner--hero { padding-top: calc(var(--page-top) + 12rem); }
}
</style>
