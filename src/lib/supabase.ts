import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
      apps: {
        Row: {
          id: string;
          name: string;
          tab: 'kartaga' | 'naqd' | 'visa';
          rate: number;
          commission: string | null;
          link: string | null;
          active: boolean;
          featured: boolean;
          color: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['apps']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['apps']['Insert']>;
      };
      end_users: {
        Row: {
          id: string;
          name: string;
          phone: string;
          joined_date: string;
          last_active: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['end_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['end_users']['Insert']>;
      };
      analytics_clicks: {
        Row: {
          id: string;
          app_id: string | null;
          user_id: string | null;
          tab: string;
          clicked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analytics_clicks']['Row'], 'id' | 'clicked_at'>;
        Update: Partial<Database['public']['Tables']['analytics_clicks']['Insert']>;
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>;
      };
    };
  };
};
