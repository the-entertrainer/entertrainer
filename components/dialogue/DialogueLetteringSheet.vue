<template>
  <div class="sheet lettering-sheet" :class="{ open }">
    <div class="grab" />
    <h2>Lettering</h2>
    <textarea v-model="local" placeholder="Say something" />
    <div style="display:flex;gap:8px;margin-top:12px">
      <button type="button" class="btn-primary" style="flex:1" @click="$emit('save', local)">Done</button>
      <button type="button" @click="$emit('close')">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; text: string }>()
defineEmits(['save', 'close'])
const local = ref(props.text)
watch(() => props.text, (t) => { local.value = t })
watch(() => props.open, (o) => { if (o) local.value = props.text })
</script>
