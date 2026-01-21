const SUPABASE_URL = 'https://ptjuamhgqwoxgybhsyfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0anVhbWhncXdveGd5YmhzeWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjI0MzAsImV4cCI6MjA4NDU5ODQzMH0.CHdHEiA7264CqTf3Te0bgM18iU-OM9O5fJFYtz27yT8';

// Check if keys are set
if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.warn('Supabase keys are missing! Please update config.js');
}

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
