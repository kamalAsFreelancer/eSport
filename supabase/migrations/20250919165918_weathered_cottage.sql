/*
  # Initial Database Setup for Tournament News Website

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `role` (enum: player, admin)
      - `game_ids` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `news` - News articles
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `author_id` (uuid, references profiles)
      - `published` (boolean)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tournaments` - Tournament management
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `game_type` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `registration_deadline` (timestamp)
      - `max_participants` (integer)
      - `status` (enum: upcoming, ongoing, finished)
      - `published` (boolean)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tournament_participants` - Tournament registrations
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, references tournaments)
      - `player_id` (uuid, references profiles)
      - `registered_at` (timestamp)
    
    - `tournament_results` - Tournament results and rankings
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, references tournaments)
      - `player_id` (uuid, references profiles)
      - `rank` (integer)
      - `points` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to published content
    - Add policies for user profile management
    - Add policies for admin content management
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('player', 'admin');
CREATE TYPE tournament_status AS ENUM ('upcoming', 'ongoing', 'finished');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'player',
  game_ids jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  game_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  registration_deadline timestamptz NOT NULL,
  max_participants integer DEFAULT 100,
  status tournament_status DEFAULT 'upcoming',
  published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

-- Tournament results table
CREATE TABLE IF NOT EXISTS tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rank integer NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- News policies
CREATE POLICY "Published news visible to everyone"
  ON news FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Admins can manage all news"
  ON news FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Tournaments policies
CREATE POLICY "Published tournaments visible to everyone"
  ON tournaments FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Admins can manage all tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Tournament participants policies
CREATE POLICY "Participants visible to tournament admins and self"
  ON tournament_participants FOR SELECT
  TO authenticated
  USING (
    auth.uid() = player_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Players can register themselves"
  ON tournament_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can unregister themselves"
  ON tournament_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = player_id);

-- Tournament results policies
CREATE POLICY "Results visible to everyone"
  ON tournament_results FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage results"
  ON tournament_results FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS news_published_created_at_idx ON news(published, created_at DESC);
CREATE INDEX IF NOT EXISTS news_featured_idx ON news(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS tournaments_published_start_date_idx ON tournaments(published, start_date);
CREATE INDEX IF NOT EXISTS tournament_participants_tournament_id_idx ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS tournament_results_tournament_id_rank_idx ON tournament_results(tournament_id, rank);