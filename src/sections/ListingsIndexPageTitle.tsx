import React from 'react';

interface ListingsIndexPageTitleProps {
  title: string;
  image: string;
  className?: string;
}

const ListingsIndexPageTitle: React.FC<ListingsIndexPageTitleProps> = ({
  title,
  image,
  className
}) => {
  return (
    <section
      className={`relative w-full min-h-[60vh] bg-cover bg-no-repeat bg-[center_bottom] sm:bg-[center_10%] md:bg-[center_20%] lg:bg-[center_55%] ${className || ''}`}
      style={{ backgroundImage: `url('${image}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-transparent"></div>

      {/* Full-height flex container */}
      <div className="relative z-10 flex min-h-[60vh] items-end w-full">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl pb-20 text-white">
            <h1 className="text-5xl font-lora font-bold leading-tight">{title}</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListingsIndexPageTitle;