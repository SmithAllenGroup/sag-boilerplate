import { defineCollection, z } from 'astro:content';
import { site } from '../config/site';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        featured_image: z.string().optional(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        seo_image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
        faqs: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
    }),
});

const insights = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        author: z.string().default(site.business.founder.name),
        pubDate: z.coerce.date(),
        category: z.enum(['market-spotlight', 'market-report', 'news-analysis']),
        featured_image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        businesses_mentioned: z.array(z.string()).optional(),
        neighborhood: z.string().optional(),
        read_time: z.number().optional(),
        draft: z.boolean().default(false),
    }),
});

const faqs = defineCollection({
    type: 'content',
    schema: z.object({
        question: z.string(),
        order: z.number().optional(),
        tags: z.array(z.string()).optional(),
    }),
});

const listings = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        status: z.string().default('active'),
        type: z.string().nullable().optional(),
        blind: z.boolean().default(true),
        is_featured: z.boolean().default(false),
        is_published: z.boolean().default(false),

        // Financial
        listing_price: z.string().nullable().optional(),
        listing_price_extra: z.string().nullable().optional(),
        sales: z.string().nullable().optional(),
        sales_extra: z.string().nullable().optional(),
        cash_flow: z.string().nullable().optional(),
        cash_flow_extra: z.string().nullable().optional(),

        // Physical
        seating: z.string().nullable().optional(),
        seating_extra: z.string().nullable().optional(),
        parking: z.array(z.string()).default([]),
        hours: z.string().nullable().optional(),
        employees: z.string().nullable().optional(),
        established_year: z.string().nullable().optional(),

        // Classification
        concept: z.array(z.string()).default([]),
        cuisine: z.array(z.string()).default([]),

        // Details
        licenses: z.string().nullable().optional(),
        equipment_included: z.string().nullable().optional(),
        reason_for_sale: z.string().nullable().optional(),

        // Boolean features
        financing_available: z.boolean().default(false),
        liquor_license: z.boolean().default(false),
        outdoor_seating: z.boolean().default(false),
        delivery_takeout: z.boolean().default(false),
        franchise_available: z.boolean().default(false),
        includes_real_estate: z.boolean().default(false),
        live_entertainment: z.boolean().default(false),

        // Media
        featured_image: z.string().nullable().optional(),
        listing_flyer_url: z.string().nullable().optional(),

        // Social
        social_share: z.boolean().default(false),

        // Dates
        listing_date: z.string().nullable().optional(),
        pending_date: z.string().nullable().optional(),
        sold_date: z.string().nullable().optional(),
        leased_date: z.string().nullable().optional(),
        created_at: z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),

        // Agent / Office
        business_name: z.string().nullable().optional(),
        agent_name: z.string().nullable().optional(),
        office_name: z.string().nullable().optional(),
        office_phone: z.string().nullable().optional(),
        office_email: z.string().nullable().optional(),

        // Location
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        county: z.string().nullable().optional(),
        street_address: z.string().nullable().optional(),
        square_footage: z.number().nullable().optional(),
        lot_size: z.number().nullable().optional(),
        year_built: z.number().nullable().optional(),

        // Media array
        media: z.array(z.object({
            url: z.string(),
            alt: z.string().nullable().optional(),
            caption: z.string().nullable().optional(),
            order: z.number().default(0),
            mime_type: z.string().nullable().optional(),
        })).default([]),
    }),
});

const companyWeKeep = defineCollection({
    type: 'content',
    schema: z.object({
        // Core content fields
        title: z.string(),
        summary: z.string(),
        author: z.string().optional(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),

        // Images
        image: z.string().optional(),

        // SEO fields
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        seo_image: z.string().optional(),

        // Categorization
        tags: z.array(z.string()).optional(),

        // Publishing control
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),

        // Partner contact information
        partner_url: z.string().url().optional(),
        partner_phone: z.string().optional(),
        partner_contact: z.string().optional(),
        partner_email: z.string().email().optional(),
        partner_address: z.object({
            street: z.string().optional(),
            street2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
        }).optional(),
        partner_logo: z.string().optional(),
        partner_contact_photo: z.string().optional(),

        // Additional partner badges/certifications
        partner_badges: z.array(z.object({
            image: z.string(),
            alt: z.string().optional(),
            url: z.string().url().optional(),
        })).optional(),
    }),
});

export const collections = {
    'blog': blog,
    'insights': insights,
    'faqs': faqs,
    'company-we-keep': companyWeKeep,
    'listings': listings,
};
