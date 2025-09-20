import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Tournament } from '../../lib/types';

export const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('all');
  const [gameTypes, setGameTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchTournaments();
  }, [filter, gameTypeFilter]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tournaments')
        .select('*')
        .eq('published', true)
        .order('start_date', { ascending: true });

      if (filter !== 'all') query = query.eq('status', filter);
      if (gameTypeFilter !== 'all') query = query.eq('game_type', gameTypeFilter);

      const { data, error } = await query;
      if (error) throw error;

      setTournaments(data || []);
      const types = [...new Set((data || []).map(t => t.game_type))];
      setGameTypes(types);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isRegistrationOpen = (tournament: Tournament) => {
    const now = new Date();
    const deadline = new Date(tournament.registration_deadline);
    return now < deadline && tournament.status === 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tournaments</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and join competitive gaming tournaments. Test your skills against players worldwide.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
            </select>

            <select
              value={gameTypeFilter}
              onChange={(e) => setGameTypeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Games</option>
              {gameTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tournament Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse p-6 h-72"></div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-300 overflow-hidden flex flex-col"
              >
                {tournament.image_url && (
                  <img
                    src={tournament.image_url}
                    alt={tournament.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {tournament.game_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-semibold ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{tournament.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{tournament.description}</p>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Starts: {formatDate(tournament.start_date)}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Max: {tournament.max_participants} players</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Reg: {formatDate(tournament.registration_deadline)}</div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                  </Link>

                  {/* Registration Status */}
                  {isRegistrationOpen(tournament) && (
                    <p className="text-green-600 text-xs mt-2 text-center font-semibold">Registration Open</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-500">
              {filter !== 'all' || gameTypeFilter !== 'all'
                ? 'Try adjusting your filters to see more tournaments.'
                : 'Check back soon for new tournament announcements.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
