import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Calendar,
  TrendingUp,
  Gamepad2,
  Newspaper,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Tournament, News } from '../../lib/types';

export const DashboardHome: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    joinedTournaments: 0,
    upcomingTournaments: 0,
    totalResults: 0,
    recentNews: 0,
  });
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([]);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: participantData } = await supabase
        .from('tournament_participants')
        .select('tournament_id, tournaments(*)')
        .eq('player_id', user!.id);

      const joinedTournaments = participantData?.length || 0;
      const upcomingTournaments =
        participantData?.filter((p) => (p.tournaments as any)?.status === 'upcoming').length || 0;

      const { count: resultsCount } = await supabase
        .from('tournament_results')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', user!.id);

      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: news } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        joinedTournaments,
        upcomingTournaments,
        totalResults: resultsCount || 0,
        recentNews: news?.length || 0,
      });

      setRecentTournaments(tournaments || []);
      setRecentNews(news || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-lg text-white">
        <h2 className="text-3xl font-extrabold mb-2">
          Welcome back, {profile?.full_name || profile?.username}! 👋
        </h2>
        <p className="text-indigo-100">
          Here’s an overview of your activity, tournaments, and the latest news.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Joined Tournaments',
            value: stats.joinedTournaments,
            icon: Trophy,
            color: 'blue',
          },
          {
            label: 'Upcoming',
            value: stats.upcomingTournaments,
            icon: Calendar,
            color: 'green',
          },
          {
            label: 'Total Results',
            value: stats.totalResults,
            icon: Award,
            color: 'purple',
          },
          {
            label: 'Recent News',
            value: stats.recentNews,
            icon: Newspaper,
            color: 'orange',
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div
                className={`p-3 bg-${card.color}-100 rounded-full shadow-sm`}
              >
                <card.icon
                  className={`h-6 w-6 text-${card.color}-600`}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tournaments */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              🎮 Recent Tournaments
            </h3>
            <Link
              to="/dashboard/tournaments"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentTournaments.length > 0 ? (
              <div className="space-y-4">
                {recentTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {tournament.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tournament.game_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatDate(tournament.start_date)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          tournament.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : tournament.status === 'ongoing'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tournament.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No tournaments available
              </p>
            )}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              📰 Latest News
            </h3>
            <Link
              to="/dashboard/news"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentNews.length > 0 ? (
              <div className="space-y-4">
                {recentNews.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">
                No news available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
