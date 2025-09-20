import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Trash } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  full_name: string;
  role: 'player' | 'admin';
  game_ids: string[];
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  tournament_id: string;
  player_id: string;
  registered_at: string;
  tournaments?: { title: string };
}

export const AdminPlayers: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Player>('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error fetching players');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectPlayer = async (player: Player) => {
    setSelectedPlayer(player);
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*, tournaments(title)')
        .eq('player_id', player.id);
      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to fetch participation history');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', playerId);
      if (error) throw error;
      fetchPlayers();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to delete player.');
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">🎮 Player Management</h2>
        <input
          type="text"
          placeholder="Search by username or full name..."
          value={search}
          onChange={handleSearchChange}
          className="border rounded-lg px-3 py-2 shadow-sm w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition"
          >
            {/* Player Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{player.username}</h3>
              <p className="text-gray-600">{player.full_name}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                  player.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {player.role.toUpperCase()}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleSelectPlayer(player)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
              >
                <Eye className="h-4 w-4" /> View
              </button>
              <button
                onClick={() => handleDeletePlayer(player.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition"
              >
                <Trash className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Player Details */}
      {selectedPlayer && (
        <div className="mt-4 p-5 border rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-bold">{selectedPlayer.username} - Details</h3>
          <p className="mt-2">
            <span className="font-semibold">Full Name:</span> {selectedPlayer.full_name}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {selectedPlayer.role}
          </p>
          <p>
            <span className="font-semibold">Games:</span> {JSON.stringify(selectedPlayer.game_ids)}
          </p>

          <h4 className="font-semibold mt-4">Participation History:</h4>
          <ul className="list-disc list-inside">
            {participants.length
              ? participants.map((p) => (
                  <li key={p.id}>
                    {p.tournaments?.title || 'Unknown Tournament'} -{' '}
                    {new Date(p.registered_at).toLocaleString()}
                  </li>
                ))
              : 'No tournament participation yet.'}
          </ul>

          <button
            onClick={() => setSelectedPlayer(null)}
            className="mt-4 px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
