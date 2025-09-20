import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Result {
  id: string;
  tournament_title: string;
  rank: number;
  points: number;
}

export const UserResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_results')
        .select('*, tournament_id(title)') 
        .eq('player_id', user.id);
      if (error) throw error;
      setResults(data?.map((r: any) => ({
        id: r.id,
        tournament_title: r.tournament_id.title,
        rank: r.rank,
        points: r.points,
      })) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Results</h2>
      {loading && <p>Loading...</p>}
      <ul>
        {results.map(r => (
          <li key={r.id} className="border p-2 rounded mb-2">
            {r.tournament_title} - Rank: {r.rank}, Points: {r.points}
          </li>
        ))}
        {!results.length && <li>No results yet</li>}
      </ul>
    </div>
  );
};
