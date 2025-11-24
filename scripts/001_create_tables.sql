-- Updated to use user_id UUID instead of TEXT for proper auth integration
CREATE TABLE IF NOT EXISTS emojis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated user_id to UUID type
CREATE TABLE IF NOT EXISTS emoji_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji_id UUID NOT NULL REFERENCES emojis(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(emoji_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE emojis ENABLE ROW LEVEL SECURITY;
ALTER TABLE emoji_likes ENABLE ROW LEVEL SECURITY;

-- Added proper RLS policies with auth.uid() for security
CREATE POLICY "Anyone can view emojis" ON emojis
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert emojis" ON emojis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emojis" ON emojis
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for emoji_likes table
CREATE POLICY "Anyone can view likes" ON emoji_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON emoji_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON emoji_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emojis_user_id ON emojis(user_id);
CREATE INDEX IF NOT EXISTS idx_emojis_created_at ON emojis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emoji_likes_emoji_id ON emoji_likes(emoji_id);
CREATE INDEX IF NOT EXISTS idx_emoji_likes_user_id ON emoji_likes(user_id);
