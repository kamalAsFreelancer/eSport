import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Newspaper,
  Trophy,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ---------- Types ---------- */
interface Stats {
  totalPlayers: number;
  totalNews: number;
  publishedNews: number;
  totalTournaments: number;
  activeTournaments: number;
  totalParticipants: number;
}

interface ActivityItem {
  id: number;
  title: string;
  created_at: string;
  published?: boolean;
  status?: string;
  type: 'news' | 'tournament';
}

/* ---------- AdminHome Component ---------- */
export const AdminHome: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    totalNews: 0,
    publishedNews: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    totalParticipants: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Fetch counts in parallel using estimated counts (much faster)
      const [
        { count: playersCount },
        { count: totalNewsCount },
        { count: publishedNewsCount },
        { count: totalTournamentsCount },
        { count: activeTournamentsCount },
        { count: participantsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'estimated', head: true }),
        supabase.from('news').select('id', { count: 'estimated', head: true }),
        supabase.from('news').select('id', { count: 'estimated', head: true }).eq('published', true),
        supabase.from('tournaments').select('id', { count: 'estimated', head: true }),
        supabase.from('tournaments').select('id', { count: 'estimated', head: true }).in('status', ['upcoming', 'ongoing']),
        supabase.from('tournament_participants').select('id', { count: 'estimated', head: true }),
      ]);

      setStats({
        totalPlayers: playersCount || 0,
        totalNews: totalNewsCount || 0,
        publishedNews: publishedNewsCount || 0,
        totalTournaments: totalTournamentsCount || 0,
        activeTournaments: activeTournamentsCount || 0,
        totalParticipants: participantsCount || 0,
      });

      // Fetch recent activity separately
      const [recentNewsRes, recentTournamentsRes] = await Promise.all([
        supabase.from('news')
          .select('id, title, created_at, published')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('tournaments')
          .select('id, title, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const recentNews = recentNewsRes.data || [];
      const recentTournaments = recentTournamentsRes.data || [];

      const activity: ActivityItem[] = [
        ...recentNews.map(item => ({ ...item as any, type: 'news' })),
        ...recentTournaments.map(item => ({ ...item as any, type: 'tournament' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

      setRecentActivity(activity);

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-indigo-100">
          Manage your tournament platform, content, and users from here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Players" value={stats.totalPlayers} />
        <StatCard icon={Newspaper} iconBg="bg-green-100" iconColor="text-green-600" label="Published News" value={`${stats.publishedNews} / ${stats.totalNews}`} />
        <StatCard icon={Trophy} iconBg="bg-purple-100" iconColor="text-purple-600" label="Active Tournaments" value={`${stats.activeTournaments} / ${stats.totalTournaments}`} />
        <StatCard icon={TrendingUp} iconBg="bg-orange-100" iconColor="text-orange-600" label="Total Participants" value={stats.totalParticipants} />
        <StatCard icon={Calendar} iconBg="bg-red-100" iconColor="text-red-600" label="Avg. Participants" value={stats.totalTournaments > 0 ? Math.round(stats.totalParticipants / stats.totalTournaments) : 0} />
        <StatCard icon={Eye} iconBg="bg-indigo-100" iconColor="text-indigo-600" label="Content Items" value={stats.totalNews + stats.totalTournaments} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard to="/admin/create" icon={Plus} title="Create News Article" description="Write and publish new content" borderHover="hover:border-blue-400" />
        <ActionCard to="/admin/tournaments" icon={Plus} title="Create Tournament" description="Set up a new competition" borderHover="hover:border-green-400" />
        <ActionCard to="/admin/players" icon={Users} title="Manage Players" description="View and manage user accounts" borderHover="hover:border-purple-400" />
      </div>

      {/* Recent Activity */}
      <RecentActivity items={recentActivity} formatDate={formatDate} />
    </div>
  );
};

/* ---------- Reusable Components ---------- */

const StatCard: React.FC<{ icon: any, iconBg: string, iconColor: string, label: string, value: string | number }> = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center">
      <div className={`p-2 ${iconBg} rounded-lg`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ActionCard: React.FC<{ to: string, icon: any, title: string, description: string, borderHover?: string }> = ({ to, icon: Icon, title, description, borderHover }) => (
  <Link
    to={to}
    className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 ${borderHover}`}
  >
    <div className="text-center">
      <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </Link>
);

const RecentActivity: React.FC<{ items: ActivityItem[], formatDate: (date?: string) => string }> = ({ items, formatDate }) => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
    </div>
    <div className="p-6">
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${item.type === 'news' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {item.type === 'news' ? <Newspaper className="h-4 w-4 text-green-600" /> : <Trophy className="h-4 w-4 text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.type === 'news' ? 'News Article' : 'Tournament'} • {formatDate(item.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.type === 'news' && (
                  <span className={`px-2 py-1 text-xs rounded-full ${item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                )}
                {item.type === 'tournament' && (
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {item.status}
                  </span>
                )}
                <Link to={`/admin/${item.type === 'news' ? 'news' : 'tournaments'}/${item.id}/edit`} className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      )}
    </div>
  </div>
);
