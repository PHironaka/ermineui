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
  <div v-if="readonly" class="sb-rating" role="img" :aria-label="`${label}: ${model} out of ${max}`" :data-size="size" data-readonly>
    <span v-for="star in stars" :key="star" class="sb-rating-star">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="STAR" /></svg>
      <svg class="sb-rating-fill" viewBox="0 0 24 24" aria-hidden="true" :style="{ clipPath: `inset(0 ${(1 - fill(star)) * 100}% 0 0)` }"><path :d="STAR" /></svg>
    </span>
  </div>
  <!-- Real radio buttons underneath, so arrow keys, forms and screen readers work without extra code. -->
  <div v-else class="sb-rating" role="radiogroup" :aria-label="label" :data-size="size" :data-disabled="disabled ? '' : undefined">
    <label v-for="star in stars" :key="star" class="sb-rating-star" :data-on="star <= model ? '' : undefined">
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
  .sb-rating {
    --sb-rating-color: var(--sb-warning);
    display: inline-flex;
    gap: 0.125rem;
    vertical-align: middle;
  }

  .sb-rating-star {
    position: relative;
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: var(--sb-radius-sm);
  }

  .sb-rating[data-size='sm'] .sb-rating-star {
    width: 1rem;
    height: 1rem;
  }

  .sb-rating[data-size='lg'] .sb-rating-star {
    width: 1.75rem;
    height: 1.75rem;
  }

  .sb-rating-star svg {
    display: block;
    width: 100%;
    height: 100%;
    fill: transparent;
    stroke: var(--sb-input);
    stroke-width: 1.5;
    stroke-linejoin: round;
    transition:
      fill var(--sb-duration),
      stroke var(--sb-duration);
  }

  .sb-rating-star .sb-rating-fill,
  .sb-rating-star[data-on] svg {
    fill: var(--sb-rating-color);
    stroke: var(--sb-rating-color);
  }

  .sb-rating-fill {
    position: absolute;
    inset: 0;
  }

  .sb-rating:not([data-readonly]) .sb-rating-star {
    cursor: pointer;
  }

  /* While pointing, the stars up to the pointer light up as a preview of what a press would choose. */
  .sb-rating:not([data-readonly], [data-disabled]):hover .sb-rating-star svg {
    fill: var(--sb-rating-color);
    stroke: var(--sb-rating-color);
  }

  .sb-rating:not([data-readonly], [data-disabled]) .sb-rating-star:hover ~ .sb-rating-star svg {
    fill: transparent;
    stroke: var(--sb-input);
  }

  .sb-rating-star input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .sb-rating-star:has(input:focus-visible) {
    outline: 2px solid var(--sb-ring);
    outline-offset: 2px;
  }

  .sb-rating[data-disabled] {
    opacity: 0.5;
  }

  .sb-rating[data-disabled] .sb-rating-star {
    cursor: not-allowed;
  }
}
</style>
