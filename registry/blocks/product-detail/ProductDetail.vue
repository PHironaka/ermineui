<script setup lang="ts">
import { computed, reactive, ref, useId, watch } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { Button } from '../../ui/button'
import { DescriptionItem, DescriptionList } from '../../ui/description-list'
import { Price } from '../../ui/price'
import { ProductGallery } from '../../ui/product-gallery'
import { QuantityStepper } from '../../ui/quantity-stepper'
import { Rating } from '../../ui/rating'
import { RatingBreakdown } from '../../ui/rating-breakdown'
import { Review } from '../../ui/review'
import { StockIndicator } from '../../ui/stock-indicator'
import { Swatch, SwatchGroup } from '../../ui/swatch'
import { WishlistButton } from '../../ui/wishlist-button'
import { sampleProduct, type ProductDetailData, type ProductSelection } from './sample-data'

// Everything shown comes in through these props. The default is the made-up product from sample-data.ts.
const props = withDefaults(
  defineProps<{
    product?: ProductDetailData
    currency?: string
    locale?: string
    /** Set while the item is being added: the button shows a spinner and cannot be pressed twice. */
    loading?: boolean
    /** Heading level of the product's name. Section headings are one level below it. */
    titleAs?: 'h1' | 'h2' | 'h3'
  }>(),
  { product: () => sampleProduct, currency: 'USD', locale: 'en-US', titleAs: 'h2' },
)

const emit = defineEmits<{
  /** "Add to cart" was pressed with every option chosen. Add this to your cart. */
  addToCart: [selection: ProductSelection]
}>()

/** Whether the product is on the reader's wishlist. */
const saved = defineModel<boolean>('saved', { default: false })

const id = useId()
const quantity = ref(1)
const picture = ref(1)
/** Only reviews with this score are listed. Unset lists them all. */
const score = ref<number>()
/** Said once "Add to cart" is pressed with something still to choose. */
const missing = ref('')

/** The choice for each option, by its name. An option starts on its first value that can be bought. */
const chosen = reactive<Record<string, string>>({})
watch(
  () => props.product,
  (product) => {
    for (const key of Object.keys(chosen)) delete chosen[key]
    for (const option of product.options) {
      const first = option.values.find((value) => !value.unavailable)
      if (first) chosen[option.name] = first.value
    }
    quantity.value = 1
    picture.value = 1
  },
  { immediate: true },
)

const subheading = computed(() => `h${Number(props.titleAs[1]) + 1}`)
const reviewCount = computed(() => props.product.ratingCounts.reduce((sum, count) => sum + count, 0))
const average = computed(() => (reviewCount.value ? props.product.ratingCounts.reduce((sum, count, index) => sum + count * (index + 1), 0) / reviewCount.value : 0))
const reviews = computed(() => (score.value ? props.product.reviews.filter((review) => Math.round(review.rating) === score.value) : props.product.reviews))
const soldOut = computed(() => props.product.stock <= 0)

function add() {
  const unchosen = props.product.options.find((option) => !chosen[option.name])
  missing.value = unchosen ? `Choose a ${unchosen.name.toLowerCase()} first.` : ''
  if (!unchosen) emit('addToCart', { id: props.product.id, options: { ...chosen }, quantity: quantity.value })
}
</script>

<template>
  <article class="er-product-detail">
    <div class="er-product-detail-top">
      <ProductGallery v-model="picture" :images="product.images" :label="`Pictures of ${product.title}`" zoom />

      <div class="er-product-detail-info">
        <div class="er-product-detail-heading">
          <p v-if="product.brand" class="er-product-detail-brand">{{ product.brand }}</p>
          <component :is="titleAs" class="er-product-detail-title">{{ product.title }}</component>
          <a v-if="reviewCount" class="er-product-detail-rating" :href="`#${id}-reviews`">
            <Rating :model-value="average" readonly size="sm" label="Rated" />
            <span>{{ reviewCount }} {{ reviewCount === 1 ? 'review' : 'reviews' }}</span>
          </a>
        </div>

        <div class="er-product-detail-price">
          <Price :amount="product.price" :compare-at="product.compareAt" :currency="currency" :locale="locale" size="lg" show-saving />
          <StockIndicator :quantity="product.stock" />
        </div>

        <p class="er-product-detail-description">{{ product.description }}</p>

        <div v-for="option in product.options" :key="option.name" class="er-product-detail-option">
          <p class="er-product-detail-label">
            {{ option.name }}<span v-if="chosen[option.name]">: {{ option.values.find((value) => value.value === chosen[option.name])?.label ?? chosen[option.name] }}</span>
          </p>
          <SwatchGroup v-model="chosen[option.name]" :label="option.name">
            <Swatch v-for="value in option.values" :key="value.value" :value="value.value" :color="value.color" :label="value.label" :unavailable="value.unavailable" />
          </SwatchGroup>
        </div>

        <div class="er-product-detail-buy">
          <QuantityStepper v-model="quantity" :max="Math.max(1, product.stock)" :disabled="soldOut" :label="`Quantity of ${product.title}`" />
          <Button size="lg" class="er-product-detail-add" :loading="loading" :disabled="soldOut" @click="add">{{ soldOut ? 'Sold out' : 'Add to cart' }}</Button>
          <WishlistButton v-model="saved" :label="`Save ${product.title} for later`" />
        </div>
        <p class="er-product-detail-missing" role="alert">{{ missing }}</p>
        <p v-if="product.shipping" class="er-product-detail-note">{{ product.shipping }}</p>
        <!-- Anything more beside the pictures: a size guide link, payment logos. -->
        <slot />

        <Accordion type="multiple" :default-value="['details']">
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>
              <DescriptionList>
                <DescriptionItem v-for="detail in product.details" :key="detail.label" :label="detail.label">{{ detail.value }}</DescriptionItem>
              </DescriptionList>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>

    <section v-if="reviewCount" :id="`${id}-reviews`" class="er-product-detail-reviews" :aria-labelledby="`${id}-reviews-title`" tabindex="-1">
      <component :is="subheading" :id="`${id}-reviews-title`" class="er-product-detail-section-title">Reviews</component>
      <div class="er-product-detail-reviews-layout">
        <RatingBreakdown v-model="score" :counts="product.ratingCounts" selectable />
        <div class="er-product-detail-review-list">
          <p v-if="!reviews.length" class="er-product-detail-note">No written reviews with {{ score }} {{ score === 1 ? 'star' : 'stars' }} yet.</p>
          <Review v-for="review in reviews" :key="review.id" :author="review.author" :rating="review.rating" :title="review.title" :date="review.date" :verified="review.verified" :locale="locale">
            {{ review.body }}
          </Review>
        </div>
      </div>
    </section>
  </article>
</template>

<style>
@layer components {
  .er-product-detail {
    display: grid;
    gap: 2.5rem;
    width: 100%;
    min-width: 0;
    /* Side by side once there is room for both; the block measures itself, not the screen. */
    container-type: inline-size;
  }

  .er-product-detail-top {
    display: grid;
    align-items: start;
    gap: 1.5rem;
  }

  @container (min-width: 44rem) {
    .er-product-detail-top {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 2.5rem;
    }

    .er-product-detail-reviews-layout {
      grid-template-columns: 16rem minmax(0, 1fr);
      gap: 2.5rem;
    }
  }

  .er-product-detail-info {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
  }

  .er-product-detail-heading {
    display: grid;
    justify-items: start;
    gap: 0.25rem;
  }

  .er-product-detail-brand {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.8125rem;
    font-weight: var(--er-weight-medium);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .er-product-detail-title {
    margin: 0;
    font-family: var(--er-font-display);
    font-size: 1.625rem;
    font-weight: var(--er-weight-heading);
    letter-spacing: calc(-0.01em * var(--er-tracking-heading));
    line-height: 2rem;
    text-wrap: balance;
  }

  .er-product-detail-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: var(--er-radius-sm);
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .er-product-detail-rating:hover {
    color: var(--er-foreground);
  }

  .er-product-detail-rating:focus-visible {
    outline: 2px solid var(--er-ring);
    outline-offset: 2px;
  }

  .er-product-detail-price {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  .er-product-detail-description {
    margin: 0;
    color: var(--er-muted-foreground);
    font-family: var(--er-font-prose);
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .er-product-detail-option {
    display: grid;
    gap: 0.5rem;
  }

  .er-product-detail-label {
    margin: 0;
    font-size: 0.875rem;
    font-weight: var(--er-weight-medium);
  }

  .er-product-detail-label span {
    color: var(--er-muted-foreground);
    font-weight: 400;
  }

  .er-product-detail-buy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  .er-product-detail-buy .er-product-detail-add {
    flex: 1;
    min-width: 9rem;
  }

  .er-product-detail-buy .er-quantity-stepper,
  .er-product-detail-buy .er-wishlist-button {
    height: var(--er-control-lg);
  }

  .er-product-detail-buy .er-wishlist-button {
    width: var(--er-control-lg);
  }

  .er-product-detail-missing {
    margin: -0.5rem 0 0;
    color: var(--er-destructive);
    font-size: 0.875rem;
  }

  .er-product-detail-missing:empty {
    display: none;
  }

  .er-product-detail-note {
    margin: 0;
    color: var(--er-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .er-product-detail-reviews {
    display: grid;
    gap: 1.25rem;
    padding-top: 2rem;
    border-top: 1px solid var(--er-border);
    outline: none;
  }

  .er-product-detail-section-title {
    margin: 0;
    font-family: var(--er-font-display);
    font-size: 1.25rem;
    font-weight: var(--er-weight-semibold);
    line-height: 1.75rem;
  }

  .er-product-detail-reviews-layout {
    display: grid;
    align-items: start;
    gap: 1.5rem;
  }

  .er-product-detail-review-list {
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  .er-product-detail-review-list > .er-review + .er-review {
    padding-top: 1.5rem;
    border-top: 1px solid var(--er-border);
  }
}
</style>
