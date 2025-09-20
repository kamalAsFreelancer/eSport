import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Tournament {
  id: string;
  title: string;
}

interface Player {
  id: string;
  username: string;
  full_name: string;
}

interface Result {
  id: string;
  tournament_id: string;
  player_id: string;
  rank: number;
  points: number;
  player_name?: string;
}

export const AdminLeaderboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from<Tournament>('tournaments')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to fetch tournaments');
    }
  };

  const fetchResults = async (tournamentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_results')
        .select('*, profiles(username, full_name)')
        .eq('tournament_id', tournamentId)
        .order('rank', { ascending: true });

      if (error) throw error;

      const formatted: Result[] = data?.map((r: any) => ({
        id: r.id,
        tournament_id: r.tournament_id,
        player_id: r.player_id,
        rank: r.rank,
        points: r.points,
        player_name: r.profiles.username,
      })) || [];

      setResults(formatted);
      setSelectedTournament(tournaments.find(t => t.id === tournamentId) || null);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tournament Leaderboard</h2>

      <div className="space-y-2">
        <label>Select Tournament:</label>
        <select
          value={selectedTournament?.id || ''}
          onChange={e => fetchResults(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">-- Select Tournament --</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {results.length > 0 && !loading && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Rank</th>
              <th className="border p-2">Player</th>
              <th className="border p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id}>
                <td className="border p-2">{r.rank}</td>
                <td className="border p-2">{r.player_name}</td>
                <td className="border p-2">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && results.length === 0 && selectedTournament && (
        <p className="mt-2">No results found for this tournament.</p>
      )}
    </div>
  );
};

