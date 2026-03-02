import { useState } from 'react';
import { motion } from 'framer-motion';

interface FAQ {
  _id: string;
  question: string;
  answerHTML: string;
  tags?: string[];
}

interface AnimatedFAQProps {
  faqs: FAQ[];
}

export default function AnimatedFAQ({ faqs }: AnimatedFAQProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [displayLimit, setDisplayLimit] = useState(50);

  // Get unique tags
  const allTags = [...new Set(faqs.flatMap(faq => faq.tags || []))].sort();

  // Filter FAQs based on search and tag
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || (faq.tags && faq.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Apply pagination to filtered results
  const displayedFAQs = filteredFAQs.slice(0, displayLimit);
  const hasMoreFAQs = filteredFAQs.length > displayLimit;

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setSearchTerm(''); // Clear search when filtering
    setDisplayLimit(50); // Reset pagination when filtering
  };

  const showMoreFAQs = () => {
    setDisplayLimit(prev => prev + 50);
  };

  // Reset pagination when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setDisplayLimit(50);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search and Filter Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
            />
          </div>

          {allTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Filter by topic:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTag === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Questions
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results Summary */}
      {/* {filteredFAQs.length > 0 && (
        <motion.div
          className="mb-6 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Showing {displayedFAQs.length} of {filteredFAQs.length} questions
          {(searchTerm || selectedTag !== 'all') && ` matching your criteria`}
        </motion.div>
      )} */}

      {/* FAQs Section */}
      {filteredFAQs.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600">
            {searchTerm || selectedTag !== 'all' 
              ? 'No questions match your search criteria.' 
              : 'No questions have been added yet. Check back soon!'
            }
          </p>
        </motion.div>
      ) : (
        <motion.dl
          className="divide-y divide-gray-900/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {displayedFAQs.map((faq, index) => {
            const isExpanded = expandedItems.has(faq._id);
            
            return (
              <motion.div
                key={faq._id}
                className="py-6 first:pt-0 last:pb-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.03,
                  ease: "easeOut"
                }}
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(faq._id)}
                    className="flex w-full items-start justify-between text-left text-gray-900 hover:text-gray-700 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-base/7 font-semibold pr-4">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-6"
                        animate={{ rotate: isExpanded ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <path d="M12 6v12m6-6H6" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </span>
                  </button>
                </dt>

                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? "auto" : 0,
                    opacity: isExpanded ? 1 : 0
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="overflow-hidden"
                >
                  <dd className="mt-2 pr-12">
                    <div
                      className="prose prose-sm prose-gray max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: faq.answerHTML }}
                    />

                    {faq.tags && faq.tags.length > 0 && (
                      <motion.div 
                        className="mt-4 pt-4 border-t border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ delay: isExpanded ? 0.2 : 0 }}
                      >
                        <div className="flex flex-wrap gap-2">
                          {faq.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </dd>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.dl>
      )}

      {/* Show More Button */}
      {hasMoreFAQs && (
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={showMoreFAQs}
            className="inline-flex items-center gap-2 rounded-md bg-primary-50 px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span>Show More Questions</span>
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-4"
              animate={{ y: [0, 2, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.button>
          <motion.p
            className="mt-3 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredFAQs.length - displayLimit} more questions available
          </motion.p>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        className="mt-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-white">
          <div className="px-6 py-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-7xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">Ready to sell your restaurant? Start with expert guidance today.</h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg/8 text-pretty text-gray-600">Our experienced brokers provide personalized consultation to help you navigate the complex process of selling your restaurant business successfully.</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a href="/contact" className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Contact Charles Today</a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
