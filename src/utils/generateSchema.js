import { site } from '@/config/site';

export function generateSchema({ service, cityName, stateName, state, url }) {
    return [
        {
            "@context": "https://schema.org",
            "@type": site.business.type,
            "@id": `${site.url}/#business`,
            "name": site.name,
            "image": `${site.url}${site.brand.logoPng}`,
            "url": site.url,
            "telephone": site.contact.phoneFormatted,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": site.contact.address.street,
                "addressLocality": site.contact.address.city,
                "addressRegion": site.contact.address.state,
                "postalCode": site.contact.address.zip,
                "addressCountry": site.contact.address.country
            },
            "description": `We help business owners in ${cityName}, ${stateName} sell their ${service.toLowerCase()} with confidentiality and expert guidance.`,
            "areaServed": {
                "@type": "City",
                "name": cityName,
                "addressRegion": state.toUpperCase()
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `${service} in ${cityName}`,
            "description": `Professional ${service.toLowerCase()} services in ${cityName}, ${stateName}. ${site.name} provides confidential brokerage, pricing, buyer screening, negotiation, and closing support.`,
            "url": url,
            "provider": {
                "@type": "Organization",
                "@id": `${site.url}/#organization`
            },
            "areaServed": {
                "@type": "City",
                "name": cityName,
                "addressRegion": state.toUpperCase()
            },
            "serviceType": "Business Brokerage"
        }
    ];
}
