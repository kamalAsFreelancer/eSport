import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Edit, Trash, Plus, Search } from 'lucide-react';

// -------------------- Types --------------------
interface NewsItem {
  id: string;          // UUID
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// -------------------- Component --------------------
export const AdminNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Fetch news on mount and when search changes
  useEffect(() => {
    fetchNews();
  }, [search]);

  // -------------------- Fetch News --------------------
  const fetchNews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from<NewsItem>('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (search.trim() !== '') {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Toggle Publish --------------------
  const togglePublish = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from<NewsItem>('news')
        .update({ published: !current })
        .eq('id', id);

      if (error) throw error;

      setNews(news.map(n => (n.id === id ? { ...n, published: !current } : n)));
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  // -------------------- Delete News --------------------
  const deleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    try {
      const { error } = await supabase
        .from<NewsItem>('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">📰 News Management</h2>
        <Link
          to="/admin/Create"
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plus className="h-4 w-4" /> Create News
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search news by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Loading / Empty / Cards */}
      {loading ? (
        <p className="text-gray-500">Loading news...</p>
      ) : news.length === 0 ? (
        <p className="text-gray-500">No news articles found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                {/* Excerpt */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {item.excerpt || 'No excerpt available.'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                {/* Status */}
                <button
                  onClick={() => togglePublish(item.id, item.published)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {item.published ? 'Published' : 'Draft'}
                </button>

                {/* Created date */}
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Link
                  to={`/admin/create/${item.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Edit className="h-4 w-4" /> Edit
                </Link>
                <button
                  onClick={() => deleteNews(item.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  <Trash className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
