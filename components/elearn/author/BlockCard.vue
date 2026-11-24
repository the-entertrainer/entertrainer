<script setup lang="ts">
import type { Block } from '~/types/lesson'
import { blockLabel } from '~/utils/elearn/document'

defineProps<{ block: Block; index: number }>()

const {
  selectedId,
  draggingId,
  dropIndex,
  openMenu,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  addStep,
  removeStep,
  addOption,
  removeOption,
  addCard,
  removeCard,
  addAccordionItem,
  removeAccordionItem,
  addSource,
  removeSource,
} = useCourseStudio()
</script>

<template>
  <article
    :id="`block-card-${block.id}`"
    class="cs-card"
    :data-block-id="block.id"
    :class="{ 'is-selected': selectedId === block.id, 'is-drop': dropIndex === index, 'is-dragging': draggingId === block.id }"
    @click="selectedId = block.id"
    @dragover="onDragOver(index, $event)"
    @drop="onDrop(index, $event)"
  >
    <header class="cs-card-bar">
      <span
        class="cs-drag"
        draggable="true"
        aria-hidden="true"
        @dragstart.stop="onDragStart(block.id, $event)"
        @dragend="onDragEnd"
      >Drag</span>
      <span class="cs-type">{{ blockLabel(block.type) }}</span>
      <button v-if="selectedId === block.id" type="button" class="cs-inline" @click.stop="openMenu(index + 1)">Insert below</button>
    </header>

    <template v-if="block.type === 'heading'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-text`">Heading</label>
        <input :id="`${block.id}-text`" v-model="block.text" class="cs-input" type="text" placeholder="Heading">
      </div>
    </template>

    <template v-else-if="block.type === 'text'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-content`">Paragraph</label>
        <textarea :id="`${block.id}-content`" v-model="block.content" class="cs-area" rows="4" placeholder="Write the paragraph" />
      </div>
    </template>

    <template v-else-if="block.type === 'statement'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-text`">Statement</label>
        <textarea :id="`${block.id}-text`" v-model="block.text" class="cs-area" rows="3" placeholder="The line you want set apart" />
      </div>
    </template>

    <template v-else-if="block.type === 'quote'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-text`">Quotation</label>
        <textarea :id="`${block.id}-text`" v-model="block.text" class="cs-area" rows="3" placeholder="Quotation" />
      </div>
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-by`">Attribution</label>
        <input :id="`${block.id}-by`" v-model="block.attribution" class="cs-input" type="text" placeholder="Who said it">
      </div>
    </template>

    <template v-else-if="block.type === 'image'">
      <figure v-if="block.src" class="cs-figure">
        <EdEditorialImage :src="block.src" :alt="block.alt || ''" />
      </figure>
      <p v-else class="cs-empty">No image address yet.</p>
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-src`">Image address</label>
        <input :id="`${block.id}-src`" v-model="block.src" class="cs-input" type="text" spellcheck="false" placeholder="/images/example.jpg">
      </div>
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-alt`">Alt text</label>
        <input :id="`${block.id}-alt`" v-model="block.alt" class="cs-input" type="text" placeholder="Describe the image for someone who cannot see it">
      </div>
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-cap`">Caption</label>
        <input :id="`${block.id}-cap`" v-model="block.caption" class="cs-input" type="text">
      </div>
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-credit`">Credit</label>
        <input :id="`${block.id}-credit`" v-model="block.credit" class="cs-input" type="text">
      </div>
    </template>

    <template v-else-if="block.type === 'process'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-title`">Process title</label>
        <input :id="`${block.id}-title`" v-model="block.title" class="cs-input" type="text">
      </div>
      <div v-for="(step, stepIndex) in block.steps" :key="stepIndex" class="cs-stack">
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-step-${stepIndex}`">Step {{ stepIndex + 1 }}</label>
          <input :id="`${block.id}-step-${stepIndex}`" v-model="step.label" class="cs-input" type="text">
        </div>
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-detail-${stepIndex}`">Detail {{ stepIndex + 1 }}</label>
          <textarea :id="`${block.id}-detail-${stepIndex}`" v-model="step.detail" class="cs-area" rows="2" />
        </div>
        <button type="button" @click="removeStep(block.id, stepIndex)">Remove step {{ stepIndex + 1 }}</button>
      </div>
      <button type="button" @click="addStep(block.id)">Add step</button>
    </template>

    <template v-else-if="block.type === 'knowledgeCheck'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-question`">Question</label>
        <textarea :id="`${block.id}-question`" v-model="block.question" class="cs-area" rows="3" />
      </div>
      <div v-for="(option, optionIndex) in block.options" :key="option.id" class="cs-stack">
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-opt-${option.id}`">Option {{ optionIndex + 1 }}</label>
          <input :id="`${block.id}-opt-${option.id}`" v-model="option.text" class="cs-input" type="text">
        </div>
        <button type="button" @click="removeOption(block.id, optionIndex)">Remove option {{ optionIndex + 1 }}</button>
      </div>
      <button type="button" @click="addOption(block.id)">Add option</button>
    </template>

    <template v-else-if="block.type === 'flashcards'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-title`">Deck title</label>
        <input :id="`${block.id}-title`" v-model="block.title" class="cs-input" type="text">
      </div>
      <div v-for="(card, cardIndex) in block.cards" :key="card.id" class="cs-stack">
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-front-${card.id}`">Card {{ cardIndex + 1 }} front</label>
          <textarea :id="`${block.id}-front-${card.id}`" v-model="card.front" class="cs-area" rows="2" />
        </div>
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-back-${card.id}`">Card {{ cardIndex + 1 }} back</label>
          <textarea :id="`${block.id}-back-${card.id}`" v-model="card.back" class="cs-area" rows="2" />
        </div>
        <button type="button" @click="removeCard(block.id, cardIndex)">Remove card {{ cardIndex + 1 }}</button>
      </div>
      <button type="button" @click="addCard(block.id)">Add card</button>
    </template>

    <template v-else-if="block.type === 'accordion'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-title`">Accordion title</label>
        <input :id="`${block.id}-title`" v-model="block.title" class="cs-input" type="text">
      </div>
      <div v-for="(item, itemIndex) in block.items" :key="itemIndex" class="cs-stack">
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-item-${itemIndex}`">Item {{ itemIndex + 1 }} title</label>
          <input :id="`${block.id}-item-${itemIndex}`" v-model="item.title" class="cs-input" type="text">
        </div>
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-body-${itemIndex}`">Item {{ itemIndex + 1 }} body</label>
          <textarea :id="`${block.id}-body-${itemIndex}`" v-model="item.content" class="cs-area" rows="3" />
        </div>
        <button type="button" @click="removeAccordionItem(block.id, itemIndex)">Remove item {{ itemIndex + 1 }}</button>
      </div>
      <button type="button" @click="addAccordionItem(block.id)">Add item</button>
    </template>

    <template v-else-if="block.type === 'reflection'">
      <div class="cs-row">
        <label class="cs-label" :for="`${block.id}-prompt`">Prompt</label>
        <textarea :id="`${block.id}-prompt`" v-model="block.prompt" class="cs-area" rows="3" />
      </div>
    </template>

    <template v-else-if="block.type === 'sources'">
      <div v-for="(item, itemIndex) in block.items" :key="item.id" class="cs-stack">
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-title-${item.id}`">Source {{ itemIndex + 1 }} title</label>
          <input :id="`${block.id}-title-${item.id}`" v-model="item.title" class="cs-input" type="text">
        </div>
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-source-${item.id}`">Source {{ itemIndex + 1 }} detail</label>
          <input :id="`${block.id}-source-${item.id}`" v-model="item.source" class="cs-input" type="text">
        </div>
        <div class="cs-row">
          <label class="cs-label" :for="`${block.id}-href-${item.id}`">Source {{ itemIndex + 1 }} link</label>
          <input :id="`${block.id}-href-${item.id}`" v-model="item.href" class="cs-input" type="text" spellcheck="false" placeholder="https://">
        </div>
        <button type="button" @click="removeSource(block.id, itemIndex)">Remove source {{ itemIndex + 1 }}</button>
      </div>
      <button type="button" @click="addSource(block.id)">Add source</button>
    </template>
  </article>
</template>
