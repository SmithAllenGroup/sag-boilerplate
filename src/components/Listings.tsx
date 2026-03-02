import React, { useState, useEffect } from 'react';
import { formatCuisine, getStatusConfig } from '../utils/conceptMapping';

interface Listing {
  uuid: string;
  slug: string;
  title: string;
  content: string;
  featured_image: string;
  cuisine: string[] | null;
  asking_price?: number;
  status?: string;
  pub_date: string;
}

interface ListingsProps {
  className?: string;
}

const Listings: React.FC<ListingsProps> = ({ className }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('https://your-api.example.com/api/listings');
        const json = await res.json();
        const sortedListings = json.data.sort((b: Listing, a: Listing) =>
          new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
        );
        setListings(sortedListings);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Loading listings...</div>;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing) => (
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
            <h2 className="line-clamp-2">{listing.title}</h2>
            {listing.cuisine && listing.cuisine.length > 0 && (
              <p className="text-sm text-gray-500">Cuisine: {formatCuisine(listing.cuisine)}</p>
            )}
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
    </div>
  );
};

export default Listings;