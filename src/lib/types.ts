export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: 'player' | 'admin';
          game_ids: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role?: 'player' | 'admin';
          game_ids?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: 'player' | 'admin';
          game_ids?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          author_id: string;
          published: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          author_id: string;
          published?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string;
          published?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          game_type: string;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          max_participants: number;
          status: 'upcoming' | 'ongoing' | 'finished';
          published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          game_type: string;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          max_participants?: number;
          status?: 'upcoming' | 'ongoing' | 'finished';
          published?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          game_type?: string;
          start_date?: string;
          end_date?: string;
          registration_deadline?: string;
          max_participants?: number;
          status?: 'upcoming' | 'ongoing' | 'finished';
          published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournament_participants: {
        Row: {
          id: string;
          tournament_id: string;
          player_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          player_id: string;
          registered_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          player_id?: string;
          registered_at?: string;
        };
      };
      tournament_results: {
        Row: {
          id: string;
          tournament_id: string;
          player_id: string;
          rank: number;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          player_id: string;
          rank: number;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          player_id?: string;
          rank?: number;
          points?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type News = Database['public']['Tables']['news']['Row'];
export type Tournament = Database['public']['Tables']['tournaments']['Row'];
export type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];
export type TournamentResult = Database['public']['Tables']['tournament_results']['Row'];