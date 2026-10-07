<script setup lang="ts">
import { computed } from 'vue'
import { createQr, type QrLevel } from './qr'

const props = withDefaults(
  defineProps<{
    /** The link or text to encode. Shorter is better: less text makes bigger squares, which scan from further away. */
    value: string
    /** Width and height in px. */
    size?: number
    /** How much damage it survives: L, M, Q or H. Use H if you plan to put a logo over the middle. */
    level?: QrLevel
    /** Blank squares left round the code. Scanners need this quiet zone; 4 is what the standard asks for. */
    margin?: number
    /** What the code is for, for screen readers. Defaults to naming the value. */
    label?: string
  }>(),
  { size: 160, level: 'M', margin: 4 },
)

const code = computed(() => {
  try {
    const modules = createQr(props.value, props.level)
    // One path for all the dark squares: each row is drawn as runs, which keeps the markup small.
    let path = ''
    modules.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (!row[x]) continue
        let run = 1
        while (row[x + run]) run++
        path += `M${x + props.margin},${y + props.margin}h${run}v1h-${run}z`
        x += run
      }
    })
    return { path, extent: modules.length + props.margin * 2 }
  } catch {
    return undefined
  }
})
</script>

<template>
  <!-- Always dark squares on white, whatever the theme: many scanners cannot read a light-on-dark code. -->
  <svg
    v-if="code"
    class="er-qr-code"
    role="img"
    :aria-label="label ?? `QR code for ${value}`"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${code.extent} ${code.extent}`"
    shape-rendering="crispEdges"
  >
    <rect width="100%" height="100%" fill="#fff" />
    <path :d="code.path" fill="#000" />
  </svg>
  <!-- Always in the page, empty while the code can be drawn, so the problem is announced when it arises. -->
  <p class="er-qr-code-error" role="alert"><slot v-if="!code" name="error">This is too much text for a QR code.</slot></p>
</template>

<style>
@layer components {
  .er-qr-code {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: var(--er-radius-md);
  }

  .er-qr-code-error {
    margin: 0;
    color: var(--er-destructive);
    font-size: 0.875rem;
  }

  .er-qr-code-error:empty {
    /* Out of sight but still in the page for screen readers, which is what lets them announce it filling in. */
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
}
</style>
