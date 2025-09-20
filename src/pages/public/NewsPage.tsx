import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { News } from '../../lib/types';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchNews(1);
  }, []);

  const fetchNews = async (pageNum: number) => {
    try {
      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles:author_id (username, full_name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (pageNum === 1) setNews(data || []);
      else setNews((prev) => [...prev, ...(data || [])]);

      setHasMore((data || []).length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Stay updated with tournament announcements, player highlights, and esports news.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && page === 1
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse h-72"></div>
              ))
            : news.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300 overflow-hidden flex flex-col"
                >
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3 text-gray-500 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                        {(article as any).profiles && (
                          <>
                            <span>•</span>
                            <User className="h-4 w-4" />
                            <span>{(article as any).profiles.full_name || (article as any).profiles.username}</span>
                          </>
                        )}
                      </div>
                      {article.featured && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link to={`/news/${article.id}`} className="hover:text-blue-600 transition-colors">
                        {article.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-4 flex-1">
                      {article.excerpt || article.content.substring(0, 200) + '...'}
                    </p>
                    <Link
                      to={`/news/${article.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-auto transition-colors"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Articles'}
            </button>
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No news articles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
