// src/pages/user/UserTournaments.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Tournament {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  published: boolean;
}

export const UserTournaments: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
    fetchMyRegistrations();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Tournament>('tournaments')
        .select('*')
        .eq('published', true)
        .order('start_date', { ascending: true });
      if (error) throw error;
      setTournaments(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id')
        .eq('player_id', user.id);
      if (error) throw error;
      setRegistrations(data?.map(r => r.tournament_id) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (tournamentId: string) => {
    if (!user) return alert('Login required');
    try {
      const { error } = await supabase.from('tournament_participants').insert({
        tournament_id: tournamentId,
        player_id: user.id,
        registered_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert('Registered successfully!');
      setRegistrations(prev => [...prev, tournamentId]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-indigo-700">Available Tournaments</h2>
      {loading && <p className="text-gray-500">Loading tournaments...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(t => (
          <div key={t.id} className="bg-white shadow-lg rounded-xl p-5 hover:shadow-2xl transition relative">
            <div className="absolute top-4 right-4 text-sm font-semibold px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
              {new Date(t.start_date) > new Date() ? 'Upcoming' : 'Ongoing/Finished'}
            </div>
            <h3 className="font-bold text-xl mb-2">{t.title}</h3>
            <p className="text-gray-700 mb-2 line-clamp-3">{t.description}</p>
            <p className="text-sm text-gray-500">Start: {new Date(t.start_date).toLocaleString()}</p>
            <p className="text-sm text-gray-500">End: {new Date(t.end_date).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mb-4">Registration Deadline: {new Date(t.registration_deadline).toLocaleString()}</p>
            <button
              disabled={registrations.includes(t.id)}
              onClick={() => handleRegister(t.id)}
              className={`w-full px-4 py-2 rounded font-semibold text-white transition ${
                registrations.includes(t.id)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {registrations.includes(t.id) ? 'Registered' : 'Register'}
            </button>
          </div>
        ))}
      </div>

      {tournaments.length === 0 && !loading && (
        <p className="text-gray-500">No tournaments available at the moment. Check back later!</p>
      )}
    </div>
  );
};
