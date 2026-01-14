import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using mock client for build')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Tag service functions
export const tagService = {
  async getUserTags(userId) {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createTag(userId, tagData) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tags')
      .insert([{ ...tagData, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTag(tagId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTag(tagId) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
    
    if (error) throw error
    return true
  }
}

// Subtask service functions
export const subtaskService = {
  async getTaskSubtasks(taskId) {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createSubtask(taskId, subtaskData) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('subtasks')
      .insert([{ ...subtaskData, task_id: taskId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSubtask(subtaskId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSubtask(subtaskId) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)
    
    if (error) throw error
    return true
  }
}

// Helper functions for common operations
export const taskService = {
  // Get today's tasks
  async getTodaysTasks(userId) {
    if (!supabase) return []
    
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .or(`due_date.is.null,due_date.eq.${today},due_date.lt.${today}`)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get all tasks for a user
  async getAllTasks(userId) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get upcoming tasks
  async getUpcomingTasks(userId) {
    if (!supabase) return []
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .gte('due_date', tomorrowStr)
      .order('due_date', { ascending: true })
      .order('due_time', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get completed tasks
  async getCompletedTasks(userId) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create new task
  async createTask(userId, taskData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    console.log('Creating task with data:', taskData, 'for user:', userId)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: userId,
        ...taskData
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating task:', error)
      throw error
    }
    
    console.log('Task created successfully:', data)
    return data
  },

  // Update task
  async updateTask(taskId, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    // Clean updates - convert empty strings to null for date/time/timestamp fields
    const cleanedUpdates = { ...updates }
    
    // Handle date fields
    if ('due_date' in cleanedUpdates) {
      cleanedUpdates.due_date = cleanedUpdates.due_date && cleanedUpdates.due_date.trim() 
        ? cleanedUpdates.due_date 
        : null
    }
    
    // Handle time fields
    if ('due_time' in cleanedUpdates) {
      cleanedUpdates.due_time = cleanedUpdates.due_time && cleanedUpdates.due_time.trim() 
        ? cleanedUpdates.due_time 
        : null
    }
    
    // Handle timestamp fields
    if ('completed_at' in cleanedUpdates) {
      cleanedUpdates.completed_at = cleanedUpdates.completed_at && cleanedUpdates.completed_at.trim() 
        ? cleanedUpdates.completed_at 
        : null
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...cleanedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Move task to trash (soft delete)
  async moveToTrash(taskId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get trashed tasks
  async getTrashedTasks(userId) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', true)
      .order('deleted_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Restore task from trash
  async restoreFromTrash(taskId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        deleted: false,
        deleted_at: null
      })
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Permanently delete task
  async permanentlyDeleteTask(taskId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
  },

  // Search tasks
  async searchTasks(userId, query) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .eq('deleted', false)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Add tags to task
  async addTagsToTask(taskId, tagIds) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const taskTags = tagIds.map(tagId => ({
      task_id: taskId,
      tag_id: tagId
    }))
    
    const { data, error } = await supabase
      .from('task_tags')
      .insert(taskTags)
      .select()
    
    if (error) throw error
    return data
  },

  // Remove tags from task
  async removeTagsFromTask(taskId, tagIds = null) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
    
    if (tagIds) {
      query = query.in('tag_id', tagIds)
    }
    
    const { error } = await query
    if (error) throw error
  },

  // Subscribe to task changes
  subscribeToTasks(userId, callback) {
    if (!supabase) return { unsubscribe: () => {} }
    
    return supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }
}
