import { createClient } from '@supabase/supabase-js';

// သင့်ရဲ့ Supabase Project မှ URL နှင့် API Key ကို ဤနေရာတွင် အစားထိုးပါ
const supabaseUrl = 'https://edigbepaxvygzhaecotp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkaWdiZXBheHZ5Z3poYWVjb3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDIzMTMsImV4cCI6MjA5ODU3ODMxM30.74C5iBN-2bQeI5hX4zcvgP6MXL6S10WgdD90gyLXZMM';

export const supabase = createClient(supabaseUrl, supabaseKey);