---
name: seo-optimizer
description: Use when adding SEO to a Next.js/React app, optimizing meta tags, implementing structured data, improving Core Web Vitals, or setting up sitemaps and robots.txt. Covers technical SEO, Open Graph, JSON-LD, and image optimization.
---

# SEO Optimizer

## When to invoke this skill
- Setting up metadata for a new page or app
- Adding Open Graph / Twitter Cards
- Implementing structured data (JSON-LD)
- Improving Lighthouse SEO or Performance score
- Setting up sitemap and robots.txt
- Optimizing images for SEO

---

## Meta Tags (Next.js App Router)

```tsx
// app/layout.tsx — site-wide defaults
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: 'Your Site Name',
    template: '%s | Your Site Name',  // page title | site name
  },
  description: 'Clear, benefit-focused description. 150-160 chars.',
  keywords: ['keyword1', 'keyword2'],  // less important today but include
  authors: [{ name: 'Author Name' }],
  creator: 'Company Name',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://yoursite.com',
  },
}

// app/products/[slug]/page.tsx — dynamic page metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)

  return {
    title: product.name,                           // becomes "Product | Site"
    description: product.description.slice(0, 155),
    alternates: {
      canonical: `/products/${params.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: [{ url: product.image, width: 1200, height: 630, alt: product.name }],
      type: 'website',
    },
  }
}
```

---

## Open Graph & Twitter Cards

```tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'Page Title',
    description: 'Page description (up to 200 chars for OG)',
    url: 'https://yoursite.com/page',
    siteName: 'Your Site',
    images: [
      {
        url: '/og-image.png',    // 1200×630px recommended
        width: 1200,
        height: 630,
        alt: 'Descriptive alt text for the OG image',
      },
    ],
    locale: 'ar_SA',            // or 'en_US'
    type: 'website',            // 'article' for blog posts
  },
  twitter: {
    card: 'summary_large_image',   // or 'summary' for small image
    title: 'Page Title',
    description: 'Twitter description (up to 200 chars)',
    images: ['/og-image.png'],
    creator: '@yourhandle',
    site: '@yoursitehandle',
  },
}
```

### OG Image Generation (Next.js)
```tsx
// app/og/route.tsx — dynamic OG images
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Default Title'

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff' }}>
      <h1 style={{ fontSize: 60 }}>{title}</h1>
    </div>,
    { width: 1200, height: 630 }
  )
}
```

---

## Structured Data (JSON-LD)

```tsx
// Inline in page component — Google prefers JSON-LD
export default function ProductPage({ product }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'SAR',
      availability: 'https://schema.org/InStock',
      url: `https://yoursite.com/products/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* page content */}
    </>
  )
}
```

**Common Schema types:**
- `Product` — e-commerce products
- `Article` / `BlogPosting` — blog/news
- `Organization` — company info
- `BreadcrumbList` — navigation breadcrumbs
- `FAQPage` — FAQ sections
- `LocalBusiness` — physical stores
- `WebSite` with `SearchAction` — sitelinks search box

---

## Sitemap.xml

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts()

  const productUrls = products.map((product) => ({
    url: `https://yoursite.com/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://yoursite.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://yoursite.com/about', changeFrequency: 'monthly', priority: 0.5 },
    ...productUrls,
  ]
}
```

## robots.txt

```tsx
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
    ],
    sitemap: 'https://yoursite.com/sitemap.xml',
  }
}
```

---

## Core Web Vitals

| Metric | Target | Common Cause |
|--------|--------|--------------|
| LCP (Largest Contentful Paint) | < 2.5s | Slow images, no preload, render-blocking CSS |
| FID/INP (Interaction to Next Paint) | < 200ms | Heavy JS, long tasks |
| CLS (Cumulative Layout Shift) | < 0.1 | Images without dimensions, late-loading fonts |

**LCP fixes:**
```tsx
// Preload hero image
<link rel="preload" as="image" href="/hero.webp" />

// Next.js: priority prop on above-the-fold image
<Image src="/hero.webp" alt="Hero" priority width={1200} height={600} />

// Preconnect to font origins
<link rel="preconnect" href="https://fonts.googleapis.com" />
```

**CLS fixes:**
```tsx
// Always set width and height on images
<Image src={src} alt={alt} width={800} height={450} />

// Reserve space for dynamic content
<div className="min-h-[200px]">  {/* prevents shift when content loads */}

// Font display swap
// In next/font: display: 'swap' is default
```

---

## Image Optimization

```tsx
import Image from 'next/image'

// Always use next/image for:
// - Automatic WebP/AVIF conversion
// - Lazy loading by default
// - Responsive sizes

<Image
  src="/product.jpg"
  alt="Red sneaker, size 42, left side view"  // descriptive, specific
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}   // 75-85 is sweet spot
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// For external images, add domain to next.config.js:
// images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
```

**Alt text rules:**
- Describe the image content specifically: `"Woman using laptop in coffee shop"` not `"image"`
- For product images: include color, angle, key features
- For icons/decorative: `alt=""` (empty string, NOT omitted)
- No need to say "image of" or "photo of"

---

## Internal Linking Strategy

```tsx
// Use descriptive anchor text — never "click here" or "read more"
<Link href="/products/shoes">Shop Nike Air Max 90</Link>  // ✅
<Link href="/products/shoes">click here</Link>            // ❌

// Breadcrumbs on every deep page
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/products">Products</Link></li>
    <li aria-current="page">Air Max 90</li>
  </ol>
</nav>

// Related products / articles — keeps users engaged, distributes PageRank
```

---

## Accessibility for SEO

```html
<!-- Heading hierarchy — one H1 per page, logical nesting -->
<h1>Main page topic</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- Never skip heading levels for styling purposes -->
<!-- Use CSS to change appearance, not heading level -->

<!-- Lang attribute on html element -->
<html lang="ar">   <!-- or "en" -->

<!-- Skip-to-content link for keyboard users -->
<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
```
