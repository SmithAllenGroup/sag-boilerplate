import React from 'react';
import { site } from '@/config/site';

interface IndexSellSectionProps {
  className?: string;
}

const IndexSellSection: React.FC<IndexSellSectionProps> = ({ className, ...props }) => {
  return (
    <section className={className} {...props}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-6 mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
          <div>
            <h2>Sell Your Restaurant</h2>
            <p>
              Selling your restaurant is one of the most significant decisions you'll make, and it's essential to do it right. At {site.name}, we understand the intricacies involved in selling a business and are committed to making the process seamless and stress-free for you. Our brokerage services are designed to help you achieve the best possible outcome, ensuring every step is handled with precision and care.
            </p>
            <div className="mt-6">
              <a
                href="/services/sell-my-restaurant"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 border-2 border-gray-900 shadow-xs hover:no-underline"
              >
                Sell Your Restaurant
              </a>
            </div>
          </div>
          <div>
            <img
              src="/images/marketing/sell-your-restaurant.jpg"
              className="aspect-3/2 sm:w-9/12 sm:ml-auto object-cover rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-[80px] shadow-md shadow-gray-600"
              alt="Sell your California restaurant or F&B business."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndexSellSection;