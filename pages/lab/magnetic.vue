<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Magnetic List — Lab', robots: 'noindex' })
const active = ref(-1)
const fx = ref(0), fy = ref(0)
function onFollow(e: PointerEvent) { fx.value = e.clientX; fy.value = e.clientY }
function magnet(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const mx = e.clientX - (r.left + r.width / 2)
  const my = e.clientY - (r.top + r.height / 2)
  el.style.transform = `translate(${mx * 0.14}px, ${my * 0.30}px)`
}
function reset(e: PointerEvent) { (e.currentTarget as HTMLElement).style.transform = '' }
</script>

<template>
  <LabFrame n="05" name="Magnetic List" hint="come closer">
    <div class="mg" @pointermove="onFollow">
      <span class="mg__eyebrow">Naveen Jose — Instructional Designer</span>
      <ul class="mg__list" @pointerleave="active = -1">
        <li v-for="(item, i) in LAB_NAV" :key="item.href">
          <NuxtLink :to="item.href" class="mg__link" @pointerenter="active = i" @pointermove="magnet" @pointerleave="reset" @focus="active = i">
            <span class="mg__idx">{{ item.n }}</span>{{ item.label }}
          </NuxtLink>
        </li>
      </ul>
      <div class="mg__follow" :class="{ on: active >= 0 }" :style="{ transform: `translate(${fx}px, ${fy}px)` }" aria-hidden="true">
        <img v-for="(item, i) in LAB_NAV" :key="i" :src="item.img" :alt="''" :style="{ opacity: active === i ? 1 : 0 }" />
      </div>
    </div>
  </LabFrame>
</template>

<style scoped>
.mg { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.mg__eyebrow { position: absolute; top: clamp(90rem, 15vh, 150rem); left: 50%; translate: -50% 0; font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.5; }
.mg__list { list-style: none; margin: 0; padding: 0; text-align: center; }
.mg__list:hover .mg__link { opacity: 0.35; }
.mg__link { position: relative; display: inline-block; padding: clamp(4rem, 1vh, 12rem) 20rem; font-family: var(--serif); font-weight: 400; font-size: clamp(44rem, 9vw, 118rem); line-height: 1.02; letter-spacing: -0.025em; text-decoration: none; color: var(--color-text); transition: opacity 0.3s ease, transform 0.35s cubic-bezier(.19,1,.22,1); will-change: transform; }
.mg__list .mg__link:hover { opacity: 1; }
.mg__link:focus-visible { outline: 2px solid var(--color-text); outline-offset: 6px; opacity: 1; }
.mg__idx { position: absolute; top: 12%; left: -6rem; font-size: 0.18em; opacity: 0.5; font-variant-numeric: tabular-nums; }
.mg__follow { position: fixed; top: 0; left: 0; width: 200rem; height: 250rem; margin: -125rem 0 0 -100rem; border-radius: 12rem; overflow: hidden; pointer-events: none; z-index: 5; opacity: 0; transition: opacity 0.3s ease; box-shadow: 0 30rem 60rem -30rem rgba(0,0,0,0.5); }
.mg__follow.on { opacity: 1; }
.mg__follow img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.35s ease; }
@media (hover: none) { .mg__follow { display: none; } .mg__list:hover .mg__link { opacity: 1; } }
</style>
