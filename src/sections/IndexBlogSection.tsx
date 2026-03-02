import React from 'react';

interface Post {
  slug: {
    current: string;
  } | string;
  featured_image: string;
  title: string;
}

interface IndexBlogSectionProps {
  posts: Post[];
  className?: string;
}

const IndexBlogSection: React.FC<IndexBlogSectionProps> = ({ posts, className, ...props }) => {
  return (
    <section className={className} {...props}>
      <div className="mx-auto max-w-7xl px-6">
        <h2>Articles</h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => {
            const slug = typeof post.slug === 'string' ? post.slug : post.slug.current;
            return (
              <li key={slug}>
                <a href={`/blog/${slug}/`} className="block space-y-2">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <h2 className="text-lg font-semibold leading-tight">
                    {post.title}
                  </h2>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default IndexBlogSection;