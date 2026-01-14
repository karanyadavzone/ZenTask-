-- ============================================
-- FIX: Add missing order_index column to subtasks
-- ============================================

-- Add order_index column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subtasks' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN order_index INTEGER DEFAULT 0;
    
    -- Update existing subtasks to have order_index based on created_at
    UPDATE subtasks 
    SET order_index = subquery.row_number - 1
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY created_at) as row_number
      FROM subtasks
    ) AS subquery
    WHERE subtasks.id = subquery.id;
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'subtasks' AND column_name = 'order_index';

