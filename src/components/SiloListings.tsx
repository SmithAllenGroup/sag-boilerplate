import React, { useState, useEffect, useMemo } from 'react';
import { formatConcepts, getStatusConfig } from '../utils/conceptMapping';

interface Listing {
  uuid: string;
  slug: string;
  title: string;
  content: string;
  featured_image: string;
  concept: string | string[];
  asking_price?: number;
  status?: string;
}

interface SiloListingsProps {
  concept?: string; // e.g., "Restaurant", "Cafe"
  county?: string;
  limit?: number; // optional: how many to show
  className?: string;
}

const SiloListings: React.FC<SiloListingsProps> = ({
  concept,
  county,
  limit,
  className
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('https://your-api.example.com/api/listings');
        const json = await res.json();
        setListings(json.data); // Fix: access `.data` just like in the working version
      } catch (err) {
        console.error('Failed to load filtered listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    let result = listings;

    if (concept) {
      result = result.filter(item => {
        if (Array.isArray(item.concept)) {
          return item.concept.includes(concept);
        }
        return item.concept === concept;
      });
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [listings, concept, limit]);

  if (loading) {
    return <div className="text-gray-600">Loading listings...</div>;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredListings.map((listing) => (
          <a
            key={listing.uuid}
            href={`/listings/${listing.slug}/`}
            className="block bg-white rounded shadow p-4 hover:shadow-lg transition-all hover:no-underline"
          >
            <img
              src={listing.featured_image}
              alt={listing.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="line-clamp-2 hover:no-underline">{listing.title}</h2>
            <p className="text-sm text-gray-500">Concept: {formatConcepts(listing.concept)}</p>
            <p className="mt-2 text-sm text-gray-700 line-clamp-3">{listing.content}</p>
            <div className="mt-2 flex items-center justify-between">
              {listing.asking_price && (
                <p className="font-semibold m-0">
                  ${Number(listing.asking_price).toLocaleString()}
                </p>
              )}
              {listing.status && (
                <span className={getStatusConfig(listing.status).classes}>
                  {getStatusConfig(listing.status).label}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
      <pre className="text-xs text-gray-400 mt-4">
        Filtered: {filteredListings.map(i => formatConcepts(i.concept)).join(' | ')}
      </pre>
    </div>
  );
};

export default SiloListings;