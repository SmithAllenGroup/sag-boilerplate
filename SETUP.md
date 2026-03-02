# SAG Boilerplate Setup Guide

Astro 5 + React 19 + Tailwind CSS v4 site template for business brokerage firms.

## Quick Start

```bash
git clone <repo-url> my-site
cd my-site
npm install
cp .env.example .env
npm run dev
```

## Configuration Checklist

### 1. Brand Configuration (`src/config/site.ts`)

This is the **single source of truth** for all brand values. Every field needs to be updated:

| Section | Fields | Notes |
|---------|--------|-------|
| Identity | `name`, `legalName`, `domain`, `url`, `tagline`, `description`, `alternateName` | `url` must include `https://` with no trailing slash |
| Contact | `phone`, `phoneRaw`, `phoneFormatted`, `email`, full `address` object, `mapsUrl`, `mapsShareUrl` | `phoneRaw` is for `tel:` links, `phoneFormatted` is for schema markup |
| Geo | `latitude`, `longitude` | Used in LocalBusiness schema |
| Brand Assets | `logo`, `logoPng`, `favicon`, `logoWidth`, `logoHeight` | Paths relative to `/public/images/` |
| Social | All platform URLs | Remove any you don't use |
| Analytics | `gaId` | Google Analytics measurement ID |
| Business | `foundingDate`, `founder.name`, `founder.slug`, `license`, `serviceTypes`, `areaServed`, `openingHours`, `rating` | Powers structured data / JSON-LD |
| Forms | All 5 UseBasin form IDs | See step 5 below |
| SEO | `titleSuffix`, `defaultTitle`, `defaultDescription`, `defaultImage` | Fallbacks for pages without explicit meta |

### 2. Team Configuration (`src/config/team.ts`)

Replace the sample team members with your actual team:

```typescript
export const team: TeamMember[] = [
  {
    name: "Your Name",
    role: "Managing Broker",
    imageUrl: "/images/profiles/your-photo.jpg",
    link: "/about/your-slug/",
  },
];
```

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```
LARAVEL_API_URL=https://your-api-domain.com/api/v1
LARAVEL_API_TOKEN=your_bearer_token_here
```

If you're not using the Laravel CRM backend, the listings API will gracefully fail and you can manage listings as local markdown in `src/content/listings/`.

### 4. Brand Assets

Replace these placeholder files in `public/images/`:

- `logo_black.svg` — Primary logo (SVG)
- `logo.png` — Logo for schema markup (PNG)
- `favicon.png` — Browser favicon

### 5. Form Setup (UseBasin)

1. Create 5 forms at [usebasin.com](https://usebasin.com):
   - **Contact** — general contact form
   - **Join Team** — recruitment form
   - **NDA** — non-disclosure agreement form
   - **Listing Request** — listing inquiry form
   - **Silo** — location page contact form
2. Update `site.forms` in `src/config/site.ts` with your form IDs

### 6. Update `package.json`

Change the `name` field to your project name.

### 7. Update `robots.txt`

Replace `example.com` with your actual domain in `public/robots.txt`.

### 8. Add Content

Create your first pieces of content:

- **Blog post**: `src/content/blog/my-first-post.md` (see `_sample.md` for schema)
- **FAQ**: `src/content/faqs/my-question.md` (see `_sample.md` for schema)
- **Insight**: `src/content/insights/my-insight.md` (see `_sample.md` for schema)
- **Listing**: `src/content/listings/my-listing.md` (see `_sample.md` for schema)

Remove the `_sample.md` files when you have real content, or set `draft: true` to keep them hidden.

### 9. Verify Configuration

Run this command to confirm all placeholders have been replaced:

```bash
grep -r "ACME\|example\.com\|555-5555\|Jane Doe\|John Smith\|YOUR_" src/ public/robots.txt
```

The only matches should be in `src/config/site.ts` and `src/config/team.ts` (which you've already updated).

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── config/          # site.ts (brand config), team.ts (team data)
├── content/         # Markdown content collections
│   ├── blog/        # Blog posts
│   ├── insights/    # Market insights
│   ├── faqs/        # FAQ entries
│   ├── listings/    # Business listings
│   └── company-we-keep/  # Partner profiles
├── components/
│   ├── ui/          # shadcn/ui primitives
│   ├── forms/       # Contact, NDA, Listing Request, Join Team, Silo forms
│   └── resources/   # Calculator components (SDE, Food Cost)
├── layouts/         # Astro layouts (main, blog, insight, listing)
├── sections/        # Reusable page sections (hero, footer, page titles)
├── pages/           # File-based routing
├── lib/             # API client, utilities
├── styles/          # Global CSS with Tailwind v4
└── utils/           # Concept mapping, spintax
```

## Content Collections

| Collection | Path | Description |
|-----------|------|-------------|
| Blog | `src/content/blog/` | Evergreen articles |
| Insights | `src/content/insights/` | Timely market commentary |
| FAQs | `src/content/faqs/` | Question + markdown answer |
| Listings | `src/content/listings/` | Business/property listings |
| Company We Keep | `src/content/company-we-keep/` | Partner profiles |

## Deployment

Configured for Vercel out of the box. `vercel.json` includes cache headers for static assets.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Notes

- All pages use `site.ts` values via imports — no hardcoded brand references in components
- Forms use React Hook Form + Zod validation with phone auto-formatting
- Layouts include JSON-LD structured data that pulls from `site.ts`
- Location silo pages use spintax for content variation
- The `@/` import alias maps to `src/`
