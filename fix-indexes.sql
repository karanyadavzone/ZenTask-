-- ============================================
-- FIX: Add missing columns and create indexes
-- ============================================

-- First, check and add the 'deleted' column to tasks table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'deleted'
  ) THEN
    ALTER TABLE tasks ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Now create indexes (safe version - will skip if column doesn't exist)
-- Only create indexes for columns that exist

-- Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Only create deleted index if the column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'deleted'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted);
  END IF;
END $$;

-- Only create due_date index if the column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  END IF;
END $$;

-- Indexes for tags table
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- Indexes for subtasks table
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);

-- Indexes for task_tags table
CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);

