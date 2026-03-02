import React, { useState, useEffect, useMemo } from 'react';

interface Post {
  slug: string;
  title: string;
  image: string;
  tags: string[];
}

interface SiloBlogPostsProps {
  tags?: string | string[];
  limit?: number;
  className?: string;
}

const SiloBlogPosts: React.FC<SiloBlogPostsProps> = ({
  tags = null,
  limit = 3,
  className,
  ...props
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const filterTags = useMemo(() => {
    if (!tags) return null;
    return Array.isArray(tags)
      ? tags.map(t => t.toLowerCase())
      : [tags.toLowerCase()];
  }, [tags]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/blog/blog.json');
        const allPosts: Post[] = await res.json();

        const matchesTags = (post: Post) =>
          !filterTags || post.tags.some(tag => filterTags.includes(tag.toLowerCase()));

        const filteredPosts = allPosts.filter(matchesTags).slice(0, limit);
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      }
    };

    fetchPosts();
  }, [filterTags, limit]);

  return (
    <section className={className} {...props}>
      <h2>Articles</h2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.slice(0, 3).map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}/`} className="block space-y-2">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <h2 className="text-lg font-semibold leading-tight">
                {post.title}
              </h2>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SiloBlogPosts;