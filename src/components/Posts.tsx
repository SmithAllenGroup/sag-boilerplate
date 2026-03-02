import React, { useState, useEffect } from 'react';

interface Post {
  uuid?: string;
  id?: string;
  slug: string;
  title: string;
  featured_image: string;
  published_at: string;
}

interface PostsProps {
  className?: string;
}

const Posts: React.FC<PostsProps> = ({ className }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('https://your-api.example.com/api/posts');
        const json = await res.json();
        // sort newest first (by published_at)
        const sortedPosts = (json.data || [])
          .slice()
          .sort((a: Post, b: Post) =>
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        setPosts(sortedPosts);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Loading posts...</div>;
  }

  return (
    <ul className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 ${className || ''}`}>
      {posts.map((post) => (
        <li key={post.uuid || post.id}>
          <a href={`/blog/${post.slug}`} className="block space-y-2">
            <img
              src={post.featured_image}
              alt={post.title || 'Post image'}
              className="w-full h-56 object-cover rounded-lg shadow-md"
            />
            <h2 className="text-lg font-semibold leading-tight">
              {post.title}
            </h2>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Posts;