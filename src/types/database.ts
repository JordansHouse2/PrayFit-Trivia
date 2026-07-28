/**
 * Hand-written to match supabase/migrations/0001_init.sql exactly, and
 * shaped to satisfy @supabase/supabase-js's GenericSchema/GenericTable
 * constraints (Row/Insert/Update/Relationships per table; Tables/Views/
 * Functions per schema). Once a real Supabase project is linked, prefer
 * regenerating this with
 * `supabase gen types typescript --linked > src/types/database.ts` so it
 * never drifts from the actual schema — this file is just the accurate
 * starting point until then.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; created_at: string };
        Insert: { id: string; created_at?: string };
        Update: { id?: string; created_at?: string };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          category: 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food';
          question: string;
          options: string[];
          correct_answer: string;
          verse_reference: string;
          verse_text: string;
          echo_word: string;
          echo_strength: 'direct' | 'thematic';
          difficulty: 'easy' | 'medium' | 'hard';
          translation: 'NIV';
          created_at: string;
        };
        Insert: {
          id?: string;
          category: 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food';
          question: string;
          options: string[];
          correct_answer: string;
          verse_reference: string;
          verse_text: string;
          echo_word: string;
          echo_strength: 'direct' | 'thematic';
          difficulty: 'easy' | 'medium' | 'hard';
          translation?: 'NIV';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [];
      };
      user_streaks: {
        Row: {
          user_id: string;
          count: number;
          last_completed_date: string | null;
          freezes_available: number;
          freeze_week_key: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          count?: number;
          last_completed_date?: string | null;
          freezes_available?: number;
          freeze_week_key?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_streaks']['Insert']>;
        Relationships: [];
      };
      user_bible_progress: {
        Row: {
          user_id: string;
          book_name: string;
          touched_chapters: number[];
          read_chapters: number[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          book_name: string;
          touched_chapters?: number[];
          read_chapters?: number[];
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_bible_progress']['Insert']>;
        Relationships: [];
      };
      user_verse_encounters: {
        Row: {
          id: string;
          user_id: string;
          question_id: string | null;
          category: 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food';
          verse_reference: string;
          verse_text: string;
          was_read: boolean;
          encountered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id?: string | null;
          category: 'Fitness' | 'Nutrition' | 'Health' | 'Science' | 'Food';
          verse_reference: string;
          verse_text: string;
          was_read?: boolean;
          encountered_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_verse_encounters']['Insert']>;
        Relationships: [];
      };
      user_quiz_completions: {
        Row: {
          id: string;
          user_id: string;
          day_key: string;
          score: number;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_key: string;
          score: number;
          points: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_quiz_completions']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
