/**
 * Laravel API Client
 * Fetches posts and listings from the Laravel backend
 */

const API_URL = import.meta.env.LARAVEL_API_URL || 'https://your-api.example.com/api/v1';
const API_TOKEN = import.meta.env.LARAVEL_API_TOKEN;

interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    [key: string]: any;
  };
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

// Post types
export interface Post {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  featured_image: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  domains: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

// Property type for nested relationships
export interface Property {
  id: number;
  uuid: string;
  name: string | null;
  type: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  county: string | null;
  square_footage: number | null;
  lot_size: number | null;
  year_built: number | null;
}

// Unit type for listing-unit relationship
export interface Unit {
  id: number;
  uuid: string;
  property_id: number;
  unit_number: string | null;
  square_footage: number | null;
  property?: Property;
}

// Organization type for listing relationships
export interface Organization {
  id: number;
  uuid: string;
  name: string;
}

// Media type for gallery images
export interface Media {
  id: number;
  uuid: string;
  url: string;
  filename: string;
  mime_type: string;
  name: string | null;
  alt: string | null;
  caption: string | null;
  collection: string;
  order: number;
}

// Listing types
export interface Listing {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  status: string;
  type: string | null;
  county: string | null;
  blind: boolean;
  is_featured: boolean;
  is_published: boolean;
  listing_price: string | null;
  listing_price_extra: string | null;
  sales: string | null;
  sales_extra: string | null;
  cash_flow: string | null;
  cash_flow_extra: string | null;
  seating: string | null;
  seating_extra: string | null;
  parking: string[] | null;
  concept: string[] | null;
  cuisine: string[] | null;
  hours: string | null;
  employees: string | null;
  established_year: string | null;
  licenses: string | null;
  equipment_included: string | null;
  reason_for_sale: string | null;
  financing_available: boolean;
  liquor_license: boolean;
  outdoor_seating: boolean;
  delivery_takeout: boolean;
  franchise_available: boolean;
  includes_real_estate: boolean;
  live_entertainment: boolean;
  content: string | null;
  featured_image: string | null;
  listing_flyer_url: string | null;
  listing_date: string | null;
  pending_date: string | null;
  sold_date: string | null;
  leased_date: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  office: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  } | null;
  domains: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  units?: Unit[];
  organizations?: Organization[];
  media?: Media[];
}

// Posts API
export async function getPosts(): Promise<Post[]> {
  return fetchApi<Post[]>('/posts');
}

export async function getPublishedPosts(): Promise<Post[]> {
  return fetchApi<Post[]>('/posts/published');
}

export async function getPostsByDomain(domain: string): Promise<Post[]> {
  return fetchApi<Post[]>(`/posts/domain/${encodeURIComponent(domain)}`);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return fetchApi<Post[]>(`/posts/tag/${encodeURIComponent(tag)}`);
}

export async function getPost(slugOrUuid: string): Promise<Post> {
  return fetchApi<Post>(`/posts/${encodeURIComponent(slugOrUuid)}`);
}

// FAQ types
export interface Faq {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

// FAQs API
export async function getFaqs(): Promise<Faq[]> {
  return fetchApi<Faq[]>('/faqs');
}

// Listings API
export async function getListings(): Promise<Listing[]> {
  return fetchApi<Listing[]>('/listings');
}

export async function getFeaturedListings(): Promise<Listing[]> {
  return fetchApi<Listing[]>('/listings/featured');
}

export async function getListingsByStatus(status: string): Promise<Listing[]> {
  return fetchApi<Listing[]>(`/listings/status/${encodeURIComponent(status)}`);
}

export async function getListingsByDomain(domain: string): Promise<Listing[]> {
  return fetchApi<Listing[]>(`/listings/domain/${encodeURIComponent(domain)}`);
}

export async function getListing(slugOrUuid: string): Promise<Listing> {
  return fetchApi<Listing>(`/listings/${encodeURIComponent(slugOrUuid)}`);
}

// Helper to format currency
export function formatCurrency(value: string | null): string {
  if (!value) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Helper to format date
export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
