import React, { useMemo } from 'react';

interface BlogPostTitleProps {
  title: string;
  author: string;
  pubDate: string | Date;
  image: string;
  className?: string;
}

const BlogPostTitle: React.FC<BlogPostTitleProps> = ({
  title,
  author,
  pubDate,
  image,
  className
}) => {
  const formattedDate = useMemo(() => {
    return new Date(pubDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [pubDate]);

  return (
    <section
      className={`relative z-0 w-full min-h-[70vh] bg-cover bg-no-repeat bg-[center_top] sm:bg-[center_10%] md:bg-[center_20%] lg:bg-[center_15%] ${className || ''}`}
      style={{ backgroundImage: `url('${image}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-transparent"></div>

      {/* Full-height flex container */}
      <div className="relative z-10 flex min-h-[70vh] items-end w-full">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-3xl pb-20 text-white">
            <p className="text-sm text-white uppercase pb-2">
              By {author}{/* · {formattedDate} */}
            </p>
            <h1 className="text-5xl font-lora font-bold leading-tight">{title}</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPostTitle;