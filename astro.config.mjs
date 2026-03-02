// @ts-check

import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import { site } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
    site: site.url,
    integrations: [react(), sitemap({ filter: (page) => !page.includes('/dashboard') })],
    vite: {
        // @ts-ignore - @tailwindcss/vite types may not align with Astro's Vite config
        plugins: [tailwindcss()],
    },
});