
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qzusguagzwsaitkijrnt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dXNndWFnendzYWl0a2lqcm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDEwNjYsImV4cCI6MjA1OTkxNzA2Nn0.Ejb2T-FmkcHKOcpu24XSNPAGp7V5Q_zbye1_rYeTwhM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'aera-auth',
    flowType: 'pkce'
  }
});

export const hasSupabaseCredentials = () => true;
