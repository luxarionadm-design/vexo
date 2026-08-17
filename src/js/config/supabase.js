/**
 * Supabase Configuration
 * @singleton - Single instance for entire app
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbljpmxnsffyhunxvfx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaWpqcG14bnNmamZ2aHVueHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDg5NTgsImV4cCI6MjEwMjUyNDk1OH0.jETOU1u9ZVoDhuz8fdsP2Oknoe4I4qgnC7GTsuS7JaM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
