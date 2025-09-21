import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Tournament, News } from "../../lib/types";
import { useAuth } from "../../contexts/AuthContext";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedNews();
    fetchUpcomingTournaments();
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(`*, profiles:author_id (username, full_name)`)
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      setFeaturedNews(data || []);
    } catch (error) {
      console.error("Error fetching featured news:", error);
    }
  };

  const fetchUpcomingTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("published", true)
        .eq("status", "upcoming")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      setUpcomingTournaments(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to <span className="text-yellow-400">BARKHub</span>
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Join competitive gaming tournaments and stay updated with the latest esports news.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth"
                className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Join Now
              </Link>
              <Link
                to="/tournaments"
                className="border border-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Tournaments
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-indigo-50 rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Active Tournaments</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Registered Players</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100+</h3>
              <p className="text-gray-600">Monthly Events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured News</h2>
            <Link
              to="/news"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All News
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse"></div>
              ))}
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredNews.map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt || article.content.substring(0, 150) + "..."}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(article.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No featured news available.
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Tournaments</h2>
            <Link
              to="/tournaments"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All Tournaments
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg shadow-sm p-6 animate-pulse"></div>
              ))}
            </div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {tournament.game_type}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(tournament.start_date)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tournament.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Max: {tournament.max_participants} players</span>
                    <span className="capitalize">{tournament.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No upcoming tournaments.</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Competing?</h2>
            <p className="text-xl text-white mb-6">
              Join thousands of gamers in thrilling esports tournaments.
            </p>
            <Link
              to="/auth"
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
