"use client";

import {
    Menu, X, MapPin, Phone, FileSignature, Calculator,
    Tag, Search, BarChart3, ArrowRightFromLine, Banknote, ScrollText, Building2, Wine,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { site } from "@/config/site";

const services = [
    { icon: Tag, label: "Sell My Restaurant", href: "/services/sell-my-restaurant", description: "Confidential seller representation" },
    { icon: Search, label: "Buy A Restaurant", href: "/services/buy-a-restaurant", description: "Buyer matching and acquisitions" },
    { icon: BarChart3, label: "Restaurant Valuation", href: "/services/restaurant-valuation", description: "SDE and EBITDA-based valuations" },
    { icon: ArrowRightFromLine, label: "Exit Planning", href: "/services/exit-planning", description: "Strategic exit preparation" },
    { icon: ScrollText, label: "Lease Negotiation", href: "/services/lease-negotiation", description: "Restaurant lease services" },
    { icon: Building2, label: "Commercial Real Estate", href: "/services/commercial-real-estate", description: "F&B site selection and leasing" },
    { icon: Wine, label: "Liquor License Transfer", href: "/services/liquor-license-transfer", description: "California ABC license transfers" },
];

const resources = [
    { icon: Calculator, label: "SDE Calculator", href: "/resources/calculators/sde-calculator", description: "Estimate your restaurant's value" },
    { icon: Banknote, label: "Food Cost Calculator", href: "/resources/calculators/food-cost-calculator", description: "Per-dish food cost analysis" },
];

const PrimaryNavigation = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Top Bar with Address and Phone */}
            <div
                className="bg-gray-50 border-b border-gray-100"
                itemScope
                itemType="https://schema.org/RealEstateAgent"
            >
                <div className="container">
                    <div className="flex justify-between items-center py-2 text-xs text-gray-600">
                        <a
                            href={site.contact.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${site.name} Office Location`}
                            className="hidden sm:flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            itemProp="address"
                            itemScope
                            itemType="https://schema.org/PostalAddress"
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span itemProp="streetAddress">{site.contact.address.street}</span>
                            <span className="hidden md:inline">, </span>
                            <span className="hidden md:inline" itemProp="addressLocality">{site.contact.address.city}</span>
                            <span className="hidden md:inline">, </span>
                            <span className="hidden md:inline" itemProp="addressRegion">{site.contact.address.state}</span>
                            <span className="hidden md:inline" itemProp="postalCode">{site.contact.address.zip}</span>
                        </a>
                        <div className="flex items-center gap-4">
                            <a
                                href={`tel:${site.contact.phoneRaw}`}
                                title={`Call ${site.name}`}
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span itemProp="telephone">{site.contact.phone}</span>
                            </a>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <a
                                href="/nda"
                                title="Sign Non-Disclosure Agreement"
                                className="hidden sm:flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
                                <FileSignature className="w-3.5 h-3.5" />
                                <span>Sign NDA</span>
                            </a>
                        </div>
                    </div>
                </div>
                <meta itemProp="name" content={site.name} />
                <meta itemProp="url" content={site.url} />
            </div>

            <section className="navigation bg-background inset-x-0 top-0 z-50 shadow-sm relative">
                <div className="container">
                <NavigationMenu viewport={false} className="min-w-full">
                    <div className="flex w-full items-center gap-2 py-4">
                        <a
                            href="/"
                            title={`${site.name} Home`}
                            className="flex items-center gap-2"
                        >
                            <img
                                src={site.brand.logo}
                                className="h-12"
                                alt={site.name}
                            />
                        </a>
                        <div className="flex flex-1 items-center justify-end gap-2 xl:gap-4">
                            <NavigationMenuList className="hidden gap-0 lg:flex">
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-xs xl:text-sm font-medium bg-background">
                                        Services
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="left-1/2 -translate-x-1/2">
                                        <div className="grid w-[500px] grid-cols-2 gap-1 p-3">
                                            {services.map((service) => {
                                                const Icon = service.icon;
                                                return (
                                                    <NavigationMenuLink
                                                        key={service.label}
                                                        href={service.href}
                                                        title={service.description}
                                                        className="flex flex-row items-start gap-2 rounded-md p-2.5 hover:bg-accent"
                                                    >
                                                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <span className="block text-sm font-medium">{service.label}</span>
                                                            <span className="block text-xs text-muted-foreground">{service.description}</span>
                                                        </div>
                                                    </NavigationMenuLink>
                                                );
                                            })}
                                        </div>
                                        <div className="border-t p-2">
                                            <NavigationMenuLink
                                                href="/services"
                                                title="View all restaurant brokerage services"
                                                className="flex items-center justify-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            >
                                                View All Services
                                            </NavigationMenuLink>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-xs xl:text-sm font-medium bg-background">
                                        Resources
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="left-1/2 -translate-x-1/2">
                                        <div className="w-[280px] p-3 space-y-1">
                                            {resources.map((resource) => {
                                                const Icon = resource.icon;
                                                return (
                                                    <NavigationMenuLink
                                                        key={resource.label}
                                                        href={resource.href}
                                                        title={resource.description}
                                                        className="flex flex-row items-start gap-2 rounded-md p-2.5 hover:bg-accent"
                                                    >
                                                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <span className="block text-sm font-medium">{resource.label}</span>
                                                            <span className="block text-xs text-muted-foreground">{resource.description}</span>
                                                        </div>
                                                    </NavigationMenuLink>
                                                );
                                            })}
                                        </div>
                                        <div className="border-t p-2">
                                            <NavigationMenuLink
                                                href="/resources/calculators"
                                                title="View all restaurant calculators"
                                                className="flex items-center justify-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            >
                                                View All Calculators
                                            </NavigationMenuLink>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/blog"
                                        title="Blog"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xs xl:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                                        Blog
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/insights"
                                        title="Market Insights"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xs xl:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                                        Insights
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/contact"
                                        title="Contact Us"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xs xl:text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                                        Contact Us
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                            <Button asChild className="hidden md:block">
                                <a href="/listings" title="Search Our Listings">Search Our Listings</a>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Main Menu"
                                className="lg:hidden"
                                onClick={() => setOpen(!open)}
                            >
                                {!open && <Menu className="size-4"/>}
                                {open && <X className="size-4"/>}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {open && (
                        <div
                            className="border-border bg-background container fixed inset-0 top-[112px] z-50 flex h-[calc(100vh-112px)] w-full flex-col overflow-auto border-t lg:hidden">
                            <div>
                                <a
                                    href="/services"
                                    title="Our Services"
                                    className="border-border flex w-full items-center border-b py-4 text-left"
                                >
                                    <span className="flex-1 text-sm font-medium">Services</span>
                                </a>
                                <div className="border-border border-b py-2 pl-4">
                                    {services.map((service) => (
                                        <a
                                            key={service.label}
                                            href={service.href}
                                            title={service.description}
                                            className="flex w-full items-center py-2.5 text-left"
                                        >
                                            <span className="text-sm text-muted-foreground">{service.label}</span>
                                        </a>
                                    ))}
                                </div>
                                <a
                                    href="/resources/calculators"
                                    title="Resources"
                                    className="border-border flex w-full items-center border-b py-4 text-left"
                                >
                                    <span className="flex-1 text-sm font-medium">Resources</span>
                                </a>
                                <div className="border-border border-b py-2 pl-4">
                                    {resources.map((resource) => (
                                        <a
                                            key={resource.label}
                                            href={resource.href}
                                            title={resource.description}
                                            className="flex w-full items-center py-2.5 text-left"
                                        >
                                            <span className="text-sm text-muted-foreground">{resource.label}</span>
                                        </a>
                                    ))}
                                </div>
                                <a
                                    href="/blog"
                                    title="Blog"
                                    className="border-border flex w-full items-center border-b py-6 text-left"
                                >
                                    <span className="flex-1 text-sm font-medium">Blog</span>
                                </a>
                                <a
                                    href="/insights"
                                    title="Market Insights"
                                    className="border-border flex w-full items-center border-b py-6 text-left"
                                >
                                    <span className="flex-1 text-sm font-medium">Insights</span>
                                </a>
                                <a
                                    href="/contact"
                                    title="Contact Us"
                                    className="border-border flex w-full items-center border-b py-6 text-left"
                                >
                                    <span className="flex-1 text-sm font-medium">Contact Us</span>
                                </a>
                                {/* CTA button */}
                                <div className="py-6 flex flex-col gap-3">
                                    <Button asChild className="w-full">
                                        <a href="/listings" title="Search Our Listings">Search Our Listings</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </NavigationMenu>
                </div>
            </section>
        </>
    );
};

export { PrimaryNavigation };
