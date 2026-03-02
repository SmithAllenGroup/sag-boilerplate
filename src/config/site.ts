// site.ts — Single source of truth for all brand-specific values.
// When creating a new project from the boilerplate, this is the ONE file you change.

export const site = {
  // ── Identity ──────────────────────────────────────────────
  name: "ACME Corp",
  legalName: "ACME Corp, Inc.",
  domain: "example.com",
  url: "https://example.com",
  tagline: "Your Tagline Here",
  description:
    "A brief description of your business and what you do. This appears in meta tags and schema markup across the site.",
  alternateName: "ACME Corp Business Brokers",

  // ── Contact ───────────────────────────────────────────────
  contact: {
    phone: "(555) 555-5555",
    phoneRaw: "+15555555555",
    phoneFormatted: "+1-555-555-5555",
    email: "hello@example.com",
    address: {
      street: "123 Main Street, Suite 100",
      city: "Anytown",
      state: "CA",
      zip: "90210",
      country: "US",
    },
    mapsUrl:
      "https://maps.google.com/?q=123+Main+Street+Suite+100+Anytown+CA+90210",
    mapsShareUrl: "https://maps.google.com",
  },

  // ── Geo ───────────────────────────────────────────────────
  geo: {
    latitude: "34.0522",
    longitude: "-118.2437",
  },

  // ── Brand Assets ──────────────────────────────────────────
  brand: {
    logo: "/images/logo_black.svg",
    logoPng: "/images/logo.png",
    favicon: "/images/favicon.png",
    logoWidth: "300",
    logoHeight: "100",
    logoSchemaWidth: "271",
    logoSchemaHeight: "165",
  },

  // ── Social ────────────────────────────────────────────────
  social: {
    facebook: "https://www.facebook.com/your-page",
    instagram: "https://www.instagram.com/your-handle",
    x: "https://x.com/your-handle",
    linkedin: "https://www.linkedin.com/company/your-company",
    youtube: "https://www.youtube.com/@your-channel",
  },

  // ── Analytics ─────────────────────────────────────────────
  analytics: {
    gaId: "G-XXXXXXXXXX",
  },

  // ── Business / Schema ─────────────────────────────────────
  business: {
    type: "LocalBusiness" as const,
    foundingDate: "2024",
    founder: {
      name: "Jane Doe",
      slug: "jane-doe",
    },
    employees: "1-10",
    priceRange: "$",
    license: "",
    serviceTypes: [
      "Business Brokerage",
      "Consulting",
    ],
    areaServed: [
      { type: "City", name: "Anytown", region: "CA" },
      { type: "State", name: "California" },
    ],
    openingHours: {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ] as string[],
      opens: "09:00",
      closes: "17:00",
    },
    rating: {
      value: "5.0",
      count: "1",
      best: "5",
      worst: "1",
    },
    articleSections: [
      "Business Brokerage",
    ],
    defaultKeywords:
      "business brokerage, your keywords here",
  },

  // ── Forms ────────────────────────────────────────────────
  forms: {
    contact: "https://usebasin.com/f/YOUR_CONTACT_FORM_ID",
    joinTeam: "https://usebasin.com/f/YOUR_JOIN_TEAM_FORM_ID",
    nda: "https://usebasin.com/f/YOUR_NDA_FORM_ID",
    listingRequest: "https://usebasin.com/f/YOUR_LISTING_REQUEST_FORM_ID",
    silo: "https://usebasin.com/f/YOUR_SILO_FORM_ID",
  },

  // ── SEO Defaults ──────────────────────────────────────────
  seo: {
    titleSuffix: "ACME Corp",
    defaultTitle: "Your Default Page Title",
    defaultDescription:
      "Default meta description for pages that don't specify one.",
    defaultImage: "/images/og-default.webp",
  },
} as const;

// ── Derived helpers ───────────────────────────────────────────
export const fullAddress = `${site.contact.address.street}, ${site.contact.address.city}, ${site.contact.address.state} ${site.contact.address.zip}`;

export const copyright = `\u00A9 ${new Date().getFullYear()} ${site.legalName}. ${site.business.license}`;

export const sameAs = [
  site.social.linkedin,
  site.social.facebook,
  site.social.instagram,
  site.social.x,
  site.social.youtube,
];
