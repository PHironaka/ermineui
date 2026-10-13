export interface CropState {
  /** How far the middle of the picture is from the middle of the frame, in px of the frame. */
  x: number
  y: number
  /** 1 fills the frame exactly; 2 shows the picture at twice that size. */
  zoom: number
}

interface Size {
  width: number
  height: number
}

/** The scale at which the picture just covers the frame, with nothing of the frame left empty. */
export const coverScale = (image: Size, frame: Size) => Math.max(frame.width / image.width, frame.height / image.height)

/** Pulls the picture back so that no edge of it comes inside the frame. */
export function clampOffset(state: CropState, image: Size, frame: Size): CropState {
  const scale = coverScale(image, frame) * state.zoom
  const maxX = Math.max(0, (image.width * scale - frame.width) / 2)
  const maxY = Math.max(0, (image.height * scale - frame.height) / 2)
  return { zoom: state.zoom, x: Math.max(-maxX, Math.min(state.x, maxX)), y: Math.max(-maxY, Math.min(state.y, maxY)) }
}

/** The part of the original picture that is inside the frame, in the picture's own px: what to cut out. */
export function sourceRect(state: CropState, image: Size, frame: Size): { x: number; y: number; width: number; height: number } {
  const scale = coverScale(image, frame) * state.zoom
  const width = frame.width / scale
  const height = frame.height / scale
  return { x: image.width / 2 - state.x / scale - width / 2, y: image.height / 2 - state.y / scale - height / 2, width, height }
}
