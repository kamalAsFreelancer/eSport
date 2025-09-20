import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: 'player' | 'admin';
  game_ids: string[];
  created_at: string;
}

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      setProfile(data);
      setUsername(data.username);
      setFullName(data.full_name);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      alert('Profile updated!');
      fetchProfile();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p className="text-center text-gray-500 mt-6">Loading profile...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
      <div className="flex flex-col items-center">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 text-2xl font-bold mb-4">
          {profile.username[0].toUpperCase()}
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold mb-1">{fullName || 'No Name'}</h2>
        <p className="text-gray-600 mb-2">@{username || 'username'}</p>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile.role === 'admin' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
          {profile.role.toUpperCase()}
        </span>
        <p className="text-gray-400 text-sm mt-2">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>

      {/* Edit Form */}
      <div className="mt-6 space-y-4">
        <input
          className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          className="border p-2 w-full rounded focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Full Name"
        />

        {/* Display Game Interests */}
        <div>
          <p className="font-semibold mb-1">Games Interested:</p>
          <div className="flex flex-wrap gap-2">
            {profile.game_ids.length ? (
              profile.game_ids.map((game, idx) => (
                <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">{game}</span>
              ))
            ) : (
              <span className="text-gray-400">No games added</span>
            )}
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full py-2 rounded font-semibold text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};
