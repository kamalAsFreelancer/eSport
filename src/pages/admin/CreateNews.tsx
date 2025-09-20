import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext'; // Your auth context

interface NewsItem {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  author_id?: string;
  published: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export const CreateNews: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Get current logged-in user
  const [news, setNews] = useState<NewsItem>({
    title: '',
    content: '',
    excerpt: '',
    published: false,
    featured: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing news for editing
  useEffect(() => {
    if (id) fetchNews(id);
  }, [id]);

  const fetchNews = async (newsId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<NewsItem>('news')
        .select('*')
        .eq('id', newsId)
        .single();
      if (error) throw error;
      setNews({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        published: data.published,
        featured: data.featured,
      });
    } catch (error: any) {
      console.error('Error fetching news:', error);
      alert(error.message || 'Failed to fetch news.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNews(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field: 'published' | 'featured') => {
    setNews(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to post news.');
      return;
    }

    setLoading(true);

    try {
      const payload: NewsItem = {
        ...news,
        author_id: user.id,
        updated_at: new Date().toISOString(),
        ...(id ? {} : { created_at: new Date().toISOString() }),
      };

      let result;
      if (id) {
        const { error } = await supabase.from('news').update(payload).eq('id', id);
        if (error) throw error;
        result = 'updated';
      } else {
        const { error } = await supabase.from('news').insert(payload);
        if (error) throw error;
        result = 'created';
      }

      alert(`News successfully ${result}.`);
      navigate('/admin/news');
    } catch (error: any) {
      console.error('Error saving news:', error);
      alert(error.message || 'Failed to save news.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">{id ? 'Edit News' : 'Create News'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={news.title}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block mb-1 font-medium">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={news.excerpt}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block mb-1 font-medium">Content</label>
          <textarea
            id="content"
            name="content"
            value={news.content}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            rows={6}
            required
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={news.published}
              onChange={() => handleToggle('published')}
            />
            Published
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={news.featured}
              onChange={() => handleToggle('featured')}
            />
            Featured
          </label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : id ? 'Update News' : 'Create News'}
        </button>
      </form>
    </div>
  );
};
