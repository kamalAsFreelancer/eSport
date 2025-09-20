// src/pages/admin/AdminTournaments.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export interface Tournament {
  id?: string;
  title: string;
  description: string;
  game_type: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  status: 'upcoming' | 'ongoing' | 'finished';
  published: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: string;
  tournament_id: string;
  player_id: string;
  registered_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export const AdminTournaments: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Tournament>({
    title: '',
    description: '',
    game_type: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: 0,
    status: 'upcoming',
    published: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showRegistrationsFor, setShowRegistrationsFor] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Tournament>('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTournaments(data || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error fetching tournaments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*, profiles(username, full_name)')
        .eq('tournament_id', tournamentId);
      if (error) throw error;
      setRegistrations(data || []);
      setShowRegistrationsFor(tournamentId);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to fetch registrations.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? Number(value) : value,
    }));
  };

  const handleTogglePublished = () => {
    setForm(prev => ({ ...prev, published: !prev.published }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in.');
    setLoading(true);
    try {
      const payload: Tournament = {
        ...form,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        ...(editingId ? {} : { created_at: new Date().toISOString() }),
      };
      if (editingId) {
        const { error } = await supabase.from('tournaments').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('Tournament updated!');
      } else {
        const { error } = await supabase.from('tournaments').insert(payload);
        if (error) throw error;
        alert('Tournament created!');
      }
      setForm({
        title: '',
        description: '',
        game_type: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        max_participants: 0,
        status: 'upcoming',
        published: false,
      });
      setEditingId(null);
      fetchTournaments();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error saving tournament.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t: Tournament) => {
    setForm(t);
    setEditingId(t.id || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      alert('Tournament deleted!');
      fetchTournaments();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to delete tournament.');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-200 text-blue-800';
      case 'ongoing':
        return 'bg-green-200 text-green-800';
      case 'finished':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-indigo-700">{editingId ? 'Edit Tournament' : 'Create Tournament'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white shadow-lg rounded-xl">
        <div className="grid md:grid-cols-2 gap-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500" />
          <input name="game_type" value={form.game_type} onChange={handleChange} placeholder="Game Type" required className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500" />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-500" rows={3} />
        <div className="grid md:grid-cols-3 gap-4">
          <input type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} required className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500" />
          <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} required className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500" />
          <input type="datetime-local" name="registration_deadline" value={form.registration_deadline} onChange={handleChange} required className="border p-2 rounded w-full focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-4">
          <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange} placeholder="Max participants" min={1} className="border p-2 rounded w-32 focus:ring-2 focus:ring-indigo-500" />
          <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-48 focus:ring-2 focus:ring-indigo-500">
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="finished">Finished</option>
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={handleTogglePublished} className="h-5 w-5 text-indigo-600" /> Published
          </label>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition">
          {loading ? 'Saving...' : editingId ? 'Update Tournament' : 'Create Tournament'}
        </button>
      </form>

      <h3 className="text-2xl font-bold text-indigo-700 mt-8">All Tournaments</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(t => (
          <div key={t.id} className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition relative">
            <div className={`absolute top-4 right-4 px-2 py-1 rounded text-sm font-bold ${statusBadge(t.status)}`}>{t.status}</div>
            <h4 className="font-bold text-lg">{t.title}</h4>
            <p className="text-sm text-gray-600">{t.game_type}</p>
            <p className="mt-2 text-gray-700 line-clamp-3">{t.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleEdit(t)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Edit</button>
              <button onClick={() => t.id && handleDelete(t.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
              <button onClick={() => t.id && fetchRegistrations(t.id)} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">Players</button>
            </div>
          </div>
        ))}
      </div>

      {showRegistrationsFor && (
        <div className="mt-6 p-4 bg-white shadow-lg rounded-xl">
          <h4 className="font-bold text-indigo-700 text-lg mb-2">Registered Players</h4>
          <ul className="space-y-1">
            {registrations.length ? registrations.map(r => (
              <li key={r.id} className="p-2 border rounded hover:bg-indigo-50 transition">
                {r.profiles?.username} ({r.profiles?.full_name}) - {new Date(r.registered_at).toLocaleString()}
              </li>
            )) : <li className="text-gray-500">No players registered</li>}
          </ul>
          <button onClick={() => setShowRegistrationsFor(null)} className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition">Close</button>
        </div>
      )}
    </div>
  );
};
