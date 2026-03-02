import React from 'react';
import SiloSharedForm from '../components/forms/SiloSharedForm.tsx';
import { site } from '@/config/site';

interface SiloPageTitleProps {
  title: string;
  sub_title?: string;
  image: string;
  className?: string;
}

const SiloPageTitle: React.FC<SiloPageTitleProps> = ({
  title,
  sub_title,
  image,
  className
}) => {
  return (
    <section
      className={`relative z-0 w-full bg-cover bg-no-repeat bg-[center_top] sm:bg-[center_10%] md:bg-[center_20%] lg:bg-[center_15%] ${className || ''}`}
      style={{ backgroundImage: `url('${image}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 sm:gap-12">
          {/* Left: Text Content */}
          <div className="text-white col-span-3">
            <h1>{title}</h1>
            {sub_title && (
              <p className="text-white">
                {sub_title}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-start gap-6 pt-6">
              <img
                className="mt-4 w-3/5 sm:w-1/3 rounded-2xl object-cover bg-white/20 p-2 max-h-[400px]"
                src="/images/profiles/charles-office.jpg"
                alt={site.business.founder.name}
              />
              <div>
                <p className="text-white text-md italic">
                  "We believe that integrity and professionalism are the cornerstones of our business and understand that trust is earned, so we work hard every day to earn the trust of our clients and customers."
                </p>
                <img
                  className="mt-2 w-3/5 object-cover max-h-[400px]"
                  src="/images/marketing/smith-signature-white.png"
                  alt={site.business.founder.name}
                />
                <p className="text-white">
                  {site.business.founder.name} <br />Managing Broker
                </p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-xl p-8 shadow-lg col-span-2 mt-8 sm:mt-0">
            <SiloSharedForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SiloPageTitle;