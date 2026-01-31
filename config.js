const SUPABASE_URL = 'https://ptjuamhgqwoxgybhsyfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0anVhbWhncXdveGd5YmhzeWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjI0MzAsImV4cCI6MjA4NDU5ODQzMH0.CHdHEiA7264CqTf3Te0bgM18iU-OM9O5fJFYtz27yT8';

// Check if keys are set
if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.warn('Supabase keys are missing! Please update config.js');
} else {
    console.log('Supabase config loaded. URL:', SUPABASE_URL);
}

// Initialize Supabase client
// We use window.supabaseClient to avoid conflict with the window.supabase library object
if (window.supabase && window.supabase.createClient) {
    try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        window.supabaseClient = null;
    }
} else {
    console.error('Supabase library not found on window object.');
    window.supabaseClient = null;
}

// For backward compatibility checking in script.js (though we will update script.js)
// confusingly, script.js was checking `if (!supabase)` but that referred to the library class usually,
// or a variable that wasn't defined. We'll make script.js use window.supabaseClient.
