-- Voice Interactions Schema
-- Stores all voice agent interactions for analytics and history

CREATE TABLE IF NOT EXISTS voice_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL DEFAULT 'en-IN',
  transcription TEXT NOT NULL,
  response TEXT NOT NULL,
  audio_base64 LONGTEXT,
  intent VARCHAR(50),
  confidence DECIMAL(3, 2),
  status VARCHAR(20) DEFAULT 'completed',
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_language (language),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Voice User Preferences
CREATE TABLE IF NOT EXISTS voice_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_language VARCHAR(10) DEFAULT 'en-IN',
  auto_play_response BOOLEAN DEFAULT TRUE,
  voice_speed DECIMAL(2, 1) DEFAULT 1.0,
  recording_duration_limit_ms INTEGER DEFAULT 30000,
  enable_history BOOLEAN DEFAULT TRUE,
  max_history_items INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Voice Intent Logs
CREATE TABLE IF NOT EXISTS voice_intent_logs (
  id SERIAL PRIMARY KEY,
  interaction_id INTEGER NOT NULL REFERENCES voice_interactions(id) ON DELETE CASCADE,
  intent_type VARCHAR(50) NOT NULL,
  intent_confidence DECIMAL(3, 2),
  extracted_entities JSON,
  routing_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_interaction_id (interaction_id),
  INDEX idx_intent_type (intent_type)
);
