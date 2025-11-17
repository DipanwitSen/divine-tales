export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          created_at: string
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          metadata: Json | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          metadata?: Json | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          metadata?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      learning_tasks: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          difficulty: string
          id: string
          reward_points: number
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          difficulty: string
          id?: string
          reward_points: number
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          reward_points?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_eyes: string | null
          avatar_gender: string | null
          avatar_hair: string | null
          avatar_skin: string | null
          created_at: string
          id: string
          level: number | null
          points: number | null
          theme_preference: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_eyes?: string | null
          avatar_gender?: string | null
          avatar_hair?: string | null
          avatar_skin?: string | null
          created_at?: string
          id: string
          level?: number | null
          points?: number | null
          theme_preference?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_eyes?: string | null
          avatar_gender?: string | null
          avatar_hair?: string | null
          avatar_skin?: string | null
          created_at?: string
          id?: string
          level?: number | null
          points?: number | null
          theme_preference?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          mood: Database["public"]["Enums"]["user_mood"]
          source: Database["public"]["Enums"]["text_source"]
          title: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          mood: Database["public"]["Enums"]["user_mood"]
          source: Database["public"]["Enums"]["text_source"]
          title: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          mood?: Database["public"]["Enums"]["user_mood"]
          source?: Database["public"]["Enums"]["text_source"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_task_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          next_available_at: string | null
          started_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          next_available_at?: string | null
          started_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          next_available_at?: string | null
          started_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "learning_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      game_type: "chess" | "sudoku" | "yoga"
      text_source: "bible" | "upanishads" | "quran"
      user_mood:
        | "peaceful"
        | "inspired"
        | "grateful"
        | "seeking"
        | "reflective"
        | "joyful"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      game_type: ["chess", "sudoku", "yoga"],
      text_source: ["bible", "upanishads", "quran"],
      user_mood: [
        "peaceful",
        "inspired",
        "grateful",
        "seeking",
        "reflective",
        "joyful",
      ],
    },
  },
} as const
