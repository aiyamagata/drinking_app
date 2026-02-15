-- Add character_level to goals for game-like character progression
-- 休肝日で+1、飲酒日は維持、1〜10の段階

ALTER TABLE goals ADD COLUMN IF NOT EXISTS character_level integer DEFAULT 1 CHECK (character_level >= 1 AND character_level <= 10);
