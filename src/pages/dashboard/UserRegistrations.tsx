import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Tournament {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export const UserRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('tournament_id(id, title, start_date, end_date)')
        .eq('player_id', user.id);
      if (error) throw error;
      setRegistrations(data?.map((r: any) => r.tournament_id) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Registrations</h2>
      {loading && <p>Loading...</p>}
      <ul>
        {registrations.map(t => (
          <li key={t.id} className="border p-2 rounded mb-2">
            {t.title} ({new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()})
          </li>
        ))}
        {!registrations.length && <li>No registrations yet</li>}
      </ul>
    </div>
  );
};
