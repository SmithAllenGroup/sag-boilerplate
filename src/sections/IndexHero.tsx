import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { site } from '@/config/site';

interface IndexHeroProps {
  className?: string;
}

const CYCLING_WORDS = [
  'Restaurants',
  'Cafes',
  'Bars',
  'Breweries',
  'Pizzerias',
  'Bakeries',
  'Coffee Shops',
  'Food Trucks',
  'Juice Bars',
  'Delis',
];

const CYCLE_INTERVAL = 3000;
const TRANSITION_DURATION = 0.5;

const IndexHero: React.FC<IndexHeroProps> = ({ className }) => {
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, CYCLE_INTERVAL);

    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  return (
    <section
      className={`relative z-0 w-full bg-cover bg-center bg-no-repeat ${className || ''}`}
      style={{ backgroundImage: "url('/images/marketing/hp_beach_banner.webp')" }}
    >
      <div className="w-full h-full absolute inset-0 z-0 bg-gradient-to-r from-gray-900/95 to-gray-900/20"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-3xl">
          <h1>
            We Sell Southern California{' '}
            {prefersReducedMotion ? (
              <span className="border-b-2 border-amber-400/70">Restaurants</span>
            ) : (
              <span
                className="relative inline-flex overflow-hidden align-baseline"
                style={{ height: '1.12em' }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={CYCLING_WORDS[index]}
                    className="inline-block border-b-2 border-amber-400/70"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: TRANSITION_DURATION, ease: 'easeInOut' }}
                  >
                    {CYCLING_WORDS[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </h1>
          <p className="mt-6 text-lg font-medium text-white/80">
            {site.name} professionally and confidentially represents restaurant owners and investors in the purchase and sale of food and beverage businesses across Orange, San Diego, and Riverside Counties.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <a
              href="/contact"
              title="Contact Us Today"
              className="inline-block rounded-md bg-white/80 px-6 py-3 text-sm font-semibold text-gray-900 border-2 border-gray-900 shadow-xs hover:no-underline"
            >
              Send Us A Message
            </a>
            <div className="text-white text-sm font-semibold">
              or Click to Call{' '}
              <a href={`tel:${site.contact.phoneRaw}`} className="hover:underline text-white">
                {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndexHero;
