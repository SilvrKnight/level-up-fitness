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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_weight_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      food_items: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          created_at: string
          fats_per_100g: number
          fiber_per_100g: number
          grams_per_unit: number | null
          id: string
          measurement_type: string
          name: string
          protein_per_100g: number
          source: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category: string
          created_at?: string
          fats_per_100g?: number
          fiber_per_100g?: number
          grams_per_unit?: number | null
          id?: string
          measurement_type?: string
          name: string
          protein_per_100g?: number
          source?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          created_at?: string
          fats_per_100g?: number
          fiber_per_100g?: number
          grams_per_unit?: number | null
          id?: string
          measurement_type?: string
          name?: string
          protein_per_100g?: number
          source?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          habit_id: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          habit_id: string
          id?: string
          log_date?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          habit_id?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          energy_level: number | null
          entry_date: string
          id: string
          plan_deviation_reason: string | null
          plan_followed: boolean | null
          tomorrow_goal: string | null
          updated_at: string | null
          user_id: string
          what_i_learned: string | null
          what_was_difficult: string | null
          what_went_well: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          id?: string
          plan_deviation_reason?: string | null
          plan_followed?: boolean | null
          tomorrow_goal?: string | null
          updated_at?: string | null
          user_id: string
          what_i_learned?: string | null
          what_was_difficult?: string | null
          what_went_well?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          id?: string
          plan_deviation_reason?: string | null
          plan_followed?: boolean | null
          tomorrow_goal?: string | null
          updated_at?: string | null
          user_id?: string
          what_i_learned?: string | null
          what_was_difficult?: string | null
          what_went_well?: string | null
        }
        Relationships: []
      }
      meal_ingredients: {
        Row: {
          calories_total: number | null
          carbs_per_100g: number
          carbs_total: number | null
          created_at: string
          fats_per_100g: number
          fats_total: number | null
          fiber_per_100g: number
          fiber_total: number | null
          food_item_id: string | null
          grams: number
          id: string
          ingredient_name: string
          is_ai_estimated: boolean | null
          meal_id: string
          protein_per_100g: number
          protein_total: number | null
          source: string | null
        }
        Insert: {
          calories_total?: number | null
          carbs_per_100g?: number
          carbs_total?: number | null
          created_at?: string
          fats_per_100g?: number
          fats_total?: number | null
          fiber_per_100g?: number
          fiber_total?: number | null
          food_item_id?: string | null
          grams: number
          id?: string
          ingredient_name: string
          is_ai_estimated?: boolean | null
          meal_id: string
          protein_per_100g?: number
          protein_total?: number | null
          source?: string | null
        }
        Update: {
          calories_total?: number | null
          carbs_per_100g?: number
          carbs_total?: number | null
          created_at?: string
          fats_per_100g?: number
          fats_total?: number | null
          fiber_per_100g?: number
          fiber_total?: number | null
          food_item_id?: string | null
          grams?: number
          id?: string
          ingredient_name?: string
          is_ai_estimated?: boolean | null
          meal_id?: string
          protein_per_100g?: number
          protein_total?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_templates: {
        Row: {
          created_at: string
          id: string
          ingredients_snapshot: Json
          is_favorite: boolean
          last_used_at: string
          meal_name: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fiber: number
          total_protein: number
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredients_snapshot: Json
          is_favorite?: boolean
          last_used_at?: string
          meal_name: string
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_fiber?: number
          total_protein?: number
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredients_snapshot?: Json
          is_favorite?: boolean
          last_used_at?: string
          meal_name?: string
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_fiber?: number
          total_protein?: number
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          created_at: string | null
          fats_grams: number | null
          fiber_grams: number | null
          id: string
          ingredients: string | null
          meal_date: string
          meal_name: string
          notes: string | null
          protein_grams: number | null
          time_consumed: string | null
          total_weight_grams: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fats_grams?: number | null
          fiber_grams?: number | null
          id?: string
          ingredients?: string | null
          meal_date?: string
          meal_name: string
          notes?: string | null
          protein_grams?: number | null
          time_consumed?: string | null
          total_weight_grams?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          created_at?: string | null
          fats_grams?: number | null
          fiber_grams?: number | null
          id?: string
          ingredients?: string | null
          meal_date?: string
          meal_name?: string
          notes?: string | null
          protein_grams?: number | null
          time_consumed?: string | null
          total_weight_grams?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          body_fat_percentage: number | null
          body_fat_source: string | null
          created_at: string | null
          current_weight_kg: number | null
          email: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          lean_body_mass: number | null
          onboarding_completed: boolean | null
          protein_basis: string | null
          protein_multiplier: number | null
          target_goal: string | null
          training_frequency: number | null
          updated_at: string | null
          user_id: string
          uses_creatine: boolean | null
          waist_cm: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          body_fat_percentage?: number | null
          body_fat_source?: string | null
          created_at?: string | null
          current_weight_kg?: number | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          lean_body_mass?: number | null
          onboarding_completed?: boolean | null
          protein_basis?: string | null
          protein_multiplier?: number | null
          target_goal?: string | null
          training_frequency?: number | null
          updated_at?: string | null
          user_id: string
          uses_creatine?: boolean | null
          waist_cm?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          body_fat_percentage?: number | null
          body_fat_source?: string | null
          created_at?: string | null
          current_weight_kg?: number | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          lean_body_mass?: number | null
          onboarding_completed?: boolean | null
          protein_basis?: string | null
          protein_multiplier?: number | null
          target_goal?: string | null
          training_frequency?: number | null
          updated_at?: string | null
          user_id?: string
          uses_creatine?: boolean | null
          waist_cm?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
