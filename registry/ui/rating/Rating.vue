<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Highest score. */
    max?: number
    /** Show a score without letting it be changed. Fractions are drawn as part-filled stars. */
    readonly?: boolean
    disabled?: boolean
    /** Submit the score with a form under this name. One is made up when you leave it out. */
    name?: string
    /** Accessible name: what is being rated. */
    label?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { max: 5, label: 'Rating', size: 'md' },
)

/** The score, from 1 to max. 0 means not rated yet. */
const model = defineModel<number>({ default: 0 })

const fallbackName = useId()
const stars = computed(() => Array.from({ length: props.max }, (_star, index) => index + 1))
/** How much of each star is filled when read-only, from 0 to 1. */
const fill = (star: number) => Math.max(0, Math.min(model.value - (star - 1), 1))

function onClick(star: number) {
  // A radio button cannot be unticked by pressing it again; here that clears the score.
  if (model.value === star) model.value = 0
}

const STAR = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z'
</script>

<template>
  <div v-if="readonly" class="er-rating" role="img" :aria-label="`${label}: ${model} out of ${max}`" :data-size="size" data-readonly>
    <span v-for="star in stars" :key="star" class="er-rating-star">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR" /></svg>
      <svg class="er-rating-fill" viewBox="0 0 24 24" aria-hidden="true" :style="{ clipPath: `inset(0 ${(1 - fill(star)) * 100}% 0 0)` }"><path :d="STAR" /></svg>
    </span>
  </div>
  <!-- Real radio buttons underneath, so arrow keys, forms and screen readers work without extra code. -->
  <div v-else class="er-rating" role="radiogroup" :aria-label="label" :data-size="size" :data-disabled="disabled ? '' : undefined">
    <label v-for="star in stars" :key="star" class="er-rating-star" :data-on="star <= model ? '' : undefined">
      <input
        type="radio"
        :name="name ?? fallbackName"
        :value="star"
        :checked="model === star"
        :disabled="disabled"
        :aria-label="`${star} ${star === 1 ? 'star' : 'stars'}`"
        @change="model = star"
        @click="onClick(star)"
      />
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR" /></svg>
    </label>
  </div>
</template>

<style>
@layer components {
  .er-rating {
    --er-rating-color: var(--er-warning);
    display: inline-flex;
    gap: 0.125rem;
    vertical-align: middle;
  }

  .er-rating-star {
    position: relative;
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: var(--er-radius-sm);
  }

  .er-rating[data-size='sm'] .er-rating-star {
    width: 1rem;
    height: 1rem;
  }

  .er-rating[data-size='lg'] .er-rating-star {
    width: 1.75rem;
    height: 1.75rem;
  }

  .er-rating-star svg {
    display: block;
    width: 100%;
    height: 100%;
    fill: transparent;
    stroke: var(--er-input);
    stroke-width: 1.5;
    stroke-linejoin: round;
    transition:
      fill var(--er-duration),
      stroke var(--er-duration);
  }

  .er-rating-star .er-rating-fill,
  .er-rating-star[data-on] svg {
    fill: var(--er-rating-color);
    stroke: var(--er-rating-color);
  }

  .er-rating-fill {
    position: absolute;
    inset: 0;
  }

  .er-rating:not([data-readonly]) .er-rating-star {
    cursor: pointer;
  }

  /* While pointing, the stars up to the pointer light up as a preview of what a press would choose. */
  .er-rating:not([data-readonly], [data-disabled]):hover .er-rating-star svg {
    fill: var(--er-rating-color);
    stroke: var(--er-rating-color);
  }

  .er-rating:not([data-readonly], [data-disabled]) .er-rating-star:hover ~ .er-rating-star svg {
    fill: transparent;
    stroke: var(--er-input);
  }

  .er-rating-star input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .er-rating-star:has(input:focus-visible) {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-rating[data-disabled] {
    opacity: 0.5;
  }

  .er-rating[data-disabled] .er-rating-star {
    cursor: not-allowed;
  }
}
</style>
