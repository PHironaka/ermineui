export interface ProductGalleryImage {
  src: string
  /** What the picture shows, e.g. "Back of the jacket". */
  alt: string
  /** A smaller version for the row of thumbnails. The full picture is used when there is none. */
  thumb?: string
}
