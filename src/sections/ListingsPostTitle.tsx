import React from 'react';

interface ListingsPostTitleProps {
  blind: boolean;
  title: string;
  county: string | null;
  featured_image: string;
  includes_real_estate?: boolean;
  className?: string;
}

const ListingsPostTitle: React.FC<ListingsPostTitleProps> = ({
  blind,
  title,
  county,
  featured_image,
  includes_real_estate,
  className
}) => {
  const locationString = county ? `${county} County` : '';

  return (
    <section
      className={`relative w-full min-h-[40vh] sm:min-h-[60vh] bg-cover bg-no-repeat bg-[center_bottom] sm:bg-[center_10%] md:bg-[center_20%] lg:bg-[center_55%] ${className || ''}`}
      style={{ backgroundImage: `url('${featured_image}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-transparent"></div>

      {/* Full-height flex container */}
      <div className="relative z-10 flex min-h-[40vh] sm:min-h-[60vh] items-end w-full">
        <div className="my-0 ml-auto mr-auto w-full max-w-7xl grid sm:grid-cols-2 sm:justify-between px-6 items-end gap-6 pb-8">
          <div className="text-white">
            {locationString && (
              <p className="text-sm text-white uppercase pb-2">
                {locationString}
              </p>
            )}
            <h1 className="sm:text-5xl text-3xl font-lora font-bold leading-tight">{title}</h1>
            {includes_real_estate && (
              <span className="inline-block mt-3 bg-emerald-600 text-white text-sm font-semibold px-3 py-1 rounded">
                Includes Real Estate
              </span>
            )}
          </div>
          {blind && (
            <div className="sm:text-right text-white font-semibold self-end">
              Photo is for placement purposes only.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ListingsPostTitle;