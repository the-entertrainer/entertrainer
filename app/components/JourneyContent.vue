<script setup lang="ts">
import { computed } from 'vue'
import { site } from '~/content/site'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
})

const visibleClass = computed(() => ({
  'journey-content--hidden': !props.visible,
}))
</script>

<template>
  <div :class="['journey-content', visibleClass]">
    <main>
      <section
        v-for="section in site.sections"
        :key="section.id"
        :id="section.id"
        class="journey-section"
      >
        <div class="section-header">
          <p v-if="section.eyebrow" class="section-eyebrow">{{ section.eyebrow }}</p>
          <h2 class="section-title">{{ section.title }}</h2>
        </div>

        <div v-if="section.body" class="section-body">
          {{ section.body }}
        </div>

        <!-- Skills section -->
        <div v-if="section.kind === 'skills' && section.items" class="skills-list">
          <div v-for="(skill, idx) in section.items" :key="idx" class="skill-item">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-bar">
              <div class="skill-fill" :style="{ width: skill.level + '%' }" />
            </div>
          </div>
        </div>

        <!-- Experience section -->
        <div v-if="section.kind === 'experience' && section.items" class="experience-list">
          <div v-for="(exp, idx) in section.items" :key="idx" class="experience-item">
            <div class="exp-year">{{ exp.year }}</div>
            <div class="exp-content">
              <div class="exp-role">{{ exp.role }}</div>
              <div class="exp-org">{{ exp.org }}</div>
            </div>
          </div>
        </div>

        <!-- Projects section -->
        <div v-if="section.kind === 'projects' && section.items" class="projects-grid">
          <div v-for="(proj, idx) in section.items" :key="idx" class="project-card">
            <div class="project-icon">{{ proj.icon }}</div>
            <div class="project-title">{{ proj.title }}</div>
            <div class="project-tag">{{ proj.tag }}</div>
          </div>
        </div>

        <!-- Testimonials section -->
        <div v-if="section.kind === 'testimonials' && section.items" class="testimonials-list">
          <div v-for="(testi, idx) in section.items" :key="idx" class="testimonial-item">
            <blockquote class="testimonial-quote">{{ testi.quote }}</blockquote>
            <p class="testimonial-author">— {{ testi.author }}</p>
          </div>
        </div>

        <!-- About facts -->
        <div v-if="section.kind === 'about' && section.items" class="facts-list">
          <div v-for="(fact, idx) in section.items" :key="idx" class="fact-item">
            {{ fact.fact }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.journey-content {
  position: relative;
  z-index: 10;
  background: white;
  color: black;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.journey-content--hidden {
  display: none;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.journey-section {
  margin-bottom: 80px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.journey-section:last-child {
  border-bottom: none;
}

.section-header {
  margin-bottom: 30px;
}

.section-eyebrow {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  margin: 0 0 8px 0;
}

.section-title {
  font-size: clamp(24px, 5vw, 48px);
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.section-body {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  max-width: 600px;
  margin-bottom: 30px;
}

/* Skills */
.skills-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-name {
  font-size: 14px;
  font-weight: 600;
}

.skill-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: #000;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Experience */
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.experience-item {
  display: flex;
  gap: 20px;
}

.exp-year {
  font-weight: 600;
  min-width: 100px;
}

.exp-role {
  font-weight: 600;
  margin-bottom: 4px;
}

.exp-org {
  font-size: 14px;
  color: #999;
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.project-card {
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  text-align: center;
}

.project-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.project-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.project-tag {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Testimonials */
.testimonials-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.testimonial-item {
  padding-left: 20px;
  border-left: 3px solid #000;
}

.testimonial-quote {
  font-style: italic;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.testimonial-author {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Facts */
.facts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fact-item {
  padding-left: 20px;
  position: relative;
}

.fact-item::before {
  content: '→';
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  main {
    padding: 20px 16px;
  }

  .journey-section {
    margin-bottom: 40px;
  }

  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
