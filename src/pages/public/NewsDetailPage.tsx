import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { News } from '../../lib/types';

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          profiles:author_id (username, full_name)
        `)
        .eq('id', articleId)
        .eq('published', true)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error: any) {
      console.error('Error fetching article:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.content.substring(0, 200),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/news"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Link>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">
              {error ? `Error: ${error}` : 'Article not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/news"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Link>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-sm">
          {/* Article Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(article.created_at)}
                {(article as any).profiles && (
                  <>
                    <span className="mx-2">•</span>
                    <User className="h-4 w-4 mr-1" />
                    {(article as any).profiles.full_name || (article as any).profiles.username}
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {article.featured && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Share article"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div 
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>

          {/* Article Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Published on {formatDate(article.created_at)}
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share this article
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};