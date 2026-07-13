import { createClient } from '@supabase/supabase-js';

// Utilizando as credenciais fornecidas para a integração com o Supabase
const rawSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ktrqmhxajakgbmkmrzns.supabase.co';
// Remove /rest/v1/ suffix se o usuário tiver configurado incorretamente
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_H6t1SZuJWgPAwHrPpEE9Rg_ZZhOjHov';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
